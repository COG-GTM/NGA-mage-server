const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const { spawn, execFileSync } = require('child_process');
const { once } = require('events');
const root = path.resolve(__dirname, '../../..');
const out = path.resolve(process.env.MAGE_E2E_OUT || path.join(root, 'services/export/proof/runs', new Date().toISOString().replace(/[:.]/g, '-')));
fs.mkdirSync(out, { recursive: true });
const eventsPath = path.join(out, 'events.ndjson');
const eventFd = fs.openSync(eventsPath, 'wx');
const started = process.hrtime.bigint();
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const revision = git('rev-parse', 'HEAD');
const runtimeRevision = git('log', '-1', '--format=%H', '--', 'service/src', 'services/export/src');
const changeCommittedAt = git('show', '-s', '--format=%cI', runtimeRevision);
const image = process.env.MAGE_PROOF_IMAGE;
const imageId = image ? execFileSync('docker', ['image', 'inspect', '--format', '{{.Id}}', image], { encoding: 'utf8' }).trim() : null;
function emit(type, detail = {}) {
  fs.writeSync(eventFd, JSON.stringify({ type, timestamp: new Date().toISOString(), elapsed_ms: Number(process.hrtime.bigint() - started) / 1e6, ...detail }) + '\n');
}
emit('window_started', { environment: 'isolated-local-demo', revision, runtime_revision: runtimeRevision, change_committed_at: changeCommittedAt, worktree_dirty: !!git('status', '--porcelain'), image, image_id: imageId, node: process.version });
const { MongoMemoryServer } = require(root + '/service/node_modules/mongodb-memory-server');
const delay = ms => new Promise(r => setTimeout(r, ms));
const transcript = fs.createWriteStream(out + '/transcript.txt');
function log(x) { const line = typeof x === 'string' ? x : JSON.stringify(x); console.log(line); transcript.write(line + '\n'); }
const procs = [];
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('MAGE_')));
delete env.MAGE_EXPORT_SERVICE_URL;
delete env.MAGE_EXPORT_SERVICE_TOKEN;
Object.assign(env, { MAGE_ADDRESS: '127.0.0.1', MAGE_PORT: '4242', MAGE_EXPORT_SERVICE_HOST: '127.0.0.1', MAGE_EXPORT_SERVICE_PORT: '4243' });
for (const name of ['ATTACHMENT', 'EXPORT', 'ICON', 'LAYER', 'SECURITY', 'TEMP', 'USER']) {
  env[`MAGE_${name}_DIR`] = `${out}/data/${name.toLowerCase()}`;
  fs.mkdirSync(env[`MAGE_${name}_DIR`], { recursive: true });
}
function start(name, entry, extra = {}) {
  const fd = fs.openSync(`${out}/${name}.log`, 'w');
  const childEnv = { ...env, ...extra };
  const container = image && entry === root + '/services/export/lib/index.js';
  const containerName = `mage-proof-${process.pid}-${procs.length}`;
  const args = container ? ['run', '--rm', '--name', containerName, '--network', 'host', '--mount', `type=bind,source=${out}/data,target=${out}/data,readonly`, ...Object.keys(childEnv).filter(key => key.startsWith('MAGE_')).flatMap(key => ['--env', key]), image] : [entry];
  const p = spawn(container ? 'docker' : process.execPath, args, { cwd: root + '/service', env: childEnv, stdio: ['ignore', fd, fd] });
  p.on('error', err => { log(`PROCESS ERROR ${name}: ${err.message}`); });
  if (container) p.containerName = containerName;
  fs.closeSync(fd); procs.push(p);
  log(`START ${name}: ${container ? imageId : entry} pid=${p.pid}`);
  emit('process_started', { name, pid: p.pid, container: !!container });
  return p;
}
async function stop(p) {
  if (p && p.exitCode === null && p.signalCode === null) {
    const exited = once(p, 'exit');
    if (p.containerName) execFileSync('docker', ['stop', '--time', '5', p.containerName], { stdio: 'ignore' });
    else p.kill('SIGTERM');
    await exited;
  }
}
async function ready(url, p) {
  for (let i=0;i<120;i++) {
    if (p.exitCode !== null || p.signalCode !== null) throw new Error(`process exited ${p.exitCode}/${p.signalCode}`);
    try { const r = await fetch(url, { signal: AbortSignal.timeout(1000) }); await r.arrayBuffer(); if (r.status === 200) return; } catch {}
    await delay(250);
  }
  throw new Error(`not ready: ${url}`);
}
async function req(method, route, body, token, expected) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let encoded;
  if (body instanceof FormData) encoded = body;
  else if (body !== undefined) { headers['content-type']='application/json'; encoded=JSON.stringify(body); }
  const response = await fetch('http://127.0.0.1:4242' + route, { method, headers, body: encoded, signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  log(`${method} ${route} -> ${response.status}`);
  if (expected && ![].concat(expected).includes(response.status)) throw new Error(`expected ${expected}: ${text}`);
  return { status: response.status, data };
}
async function signin(name, password, uid) {
  const auth = await req('POST', '/auth/local/signin', { username: name, password }, null, 200);
  const login = await req('POST', '/auth/token', { uid }, auth.data.token, 200);
  return login.data;
}
let mongo;
(async () => {
  for (const port of [4242, 4243]) {
    await new Promise((resolve, reject) => {
      const listener = net.createServer();
      listener.once('error', reject);
      listener.listen(port, '127.0.0.1', () => listener.close(resolve));
    });
  }
  mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  env.MAGE_MONGO_URL = mongo.getUri('mage_export_e2e');
  log(`MONGO ${env.MAGE_MONGO_URL}`);
  let mage = start('mage-off', root + '/service/bin/mage.service.js');
  await ready('http://127.0.0.1:4242/api', mage);
  const password = crypto.randomBytes(24).toString('hex');
  const outsiderPassword = crypto.randomBytes(24).toString('hex');
  await req('POST', '/api/setup', { username: 'export-admin', password, passwordconfirm: password, uid: 'export-admin-device' }, null, 200);
  const admin = await signin('export-admin', password, 'export-admin-device');
  const roles = (await req('GET', '/api/roles', undefined, admin.token, 200)).data;
  const role = roles.find(r => r.name === 'USER_ROLE');
  const userForm = new FormData();
  for (const [key,value] of Object.entries({ username:'export-outsider', displayName:'Export Outsider', password:outsiderPassword, passwordconfirm:outsiderPassword, roleId:role.id })) userForm.set(key,value);
  const outsiderUser = (await req('POST','/api/users', userForm, admin.token,200)).data;
  await req('POST','/api/devices',{uid:'export-outsider-device',name:'Outsider',registered:true,userId:outsiderUser.id},admin.token,[200,201]);
  const outsider = await signin('export-outsider',outsiderPassword,'export-outsider-device');
  const event = (await req('POST','/api/events',{name:'Export Parity E2E',style:{}},admin.token,201)).data;
  const populated = (await req('GET',`/api/events/${event.id}`,undefined,admin.token,200)).data;
  const team = populated.teams.find(t => t.teamEventId === event.id);
  await req('POST',`/api/teams/${team.id}/users`,{id:admin.user.id},admin.token,[200,201]);
  const form = (await req('POST',`/api/events/${event.id}/forms`,{
    name:'Evidence',userFields:[],archived:false,color:'#336699',
    fields:[{id:1,name:'notes',title:'Notes',type:'textfield',required:false},
      {id:2,name:'quantity',title:'Quantity',type:'numberfield',required:false}]
  },admin.token,[200,201])).data;
  const observationId = (await req('POST',`/api/events/${event.id}/observations/id`,{},admin.token,[200,201])).data.id;
  const observation = (await req('PUT',`/api/events/${event.id}/observations/${observationId}`,{
    id:observationId,eventId:event.id,type:'Feature',geometry:{type:'Point',coordinates:[-77.0365,38.8977]},
    properties:{timestamp:'2026-01-15T12:00:00.000Z',forms:[{formId:form.id,notes:'API parity: café, "quoted" & <tag>',quantity:7}]}
  },admin.token,[200,201])).data;
  const locations = (await req('POST',`/api/events/${event.id}/locations`,[{
    type:'Feature',geometry:{type:'Point',coordinates:[-77.04,38.90]},
    properties:{timestamp:'2026-01-15T12:01:00.000Z',accuracy:1}
  }],admin.token,[200,201])).data;
  fs.writeFileSync(out+'/fixture.json',JSON.stringify({event,form,observation,locations,adminUserId:admin.user.id,outsiderUserId:outsider.user.id},null,2));
  log(`READY event=${event.id} form=${form.id} observation=${observationId}; admin and nonparticipant authenticated.`);
  emit('fixture_ready', { observations: 1, locations: 1, authenticated_users: 2 });
  const run = require('./execute.cjs');
  await run({root,out,env,log,req,admin,outsider,event,mage,start,stop,ready,delay,emit,runtimeRevision,changeCommittedAt,imageId});
  emit('exercise_passed');
})().catch(err => { log(`ERROR ${err.stack}`); emit('exercise_failed', { message: err.message }); process.exitCode=1; }).finally(async () => {
  for (const p of procs) await stop(p);
  if (mongo) await mongo.stop();
  emit('window_ended');
  fs.closeSync(eventFd);
  transcript.end();
});
