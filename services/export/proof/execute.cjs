const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
module.exports = async function(c) {
  const {root,out,env,log,req,admin,outsider,event,start,stop,ready,delay,emit,runtimeRevision,changeCommittedAt,imageId} = c;
  const Zip = require(root+'/service/node_modules/adm-zip');
  const Database = require(root+'/service/node_modules/better-sqlite3');
  const results=[];
  function check(label, condition, actual) {
    const result={label,result:condition?'passed':'failed',actual};
    results.push(result); log(result);
    emit('assertion', { label, result: result.result });
    fs.writeFileSync(out+'/assertions.json',JSON.stringify(results,null,2));
    if (!condition) throw new Error(`ASSERTION FAILED ${label}: ${JSON.stringify(actual)}`);
  }
  const sha = b => crypto.createHash('sha256').update(b).digest('hex');
  const filter = { startDate:'2026-01-15T00:00:00Z',endDate:'2026-01-16T00:00:00Z' };
  const body = format => ({format,observations:{...filter},locations:{...filter}});
  fs.writeFileSync(out+'/request.json',JSON.stringify(body('csv'),null,2));
  async function finished(id) {
    let data;
    for (let i=0;i<150;i++) {
      const list=await req('GET','/api/exports/mine',undefined,admin.token,200);
      data=list.data.find(x=>x.id===id);
      if (data && ['Completed','Failed'].includes(data.status)) return data;
      await delay(200);
    }
    throw new Error(`Export timed out: ${JSON.stringify(data)}`);
  }
  function canonical(file) {
    const db = new Database(file,{readonly:true});
    const schema = db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all();
    const tables={};
    for (const table of schema.filter(x=>x.type==='table')) {
      const rows=db.prepare('SELECT * FROM "'+table.name.replaceAll('"','""')+'"').all();
      for (const row of rows) {
        if (table.name==='gpkg_contents') row.last_change='<export time>';
        for (const k of Object.keys(row)) if (Buffer.isBuffer(row[k])) row[k]={hex:row[k].toString('hex')};
      }
      rows.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
      tables[table.name]=rows;
    }
    db.close();
    return {schema,tables};
  }
  async function exportAll(mode) {
    const manifests={}; const summaries={};
    for (const format of ['csv','geojson','kml','geopackage']) {
      const dir=`${out}/${mode}/${format}`; fs.mkdirSync(dir,{recursive:true});
      const created = await req('POST',`/api/events/${event.id}/exports`,body(format),admin.token,200);
      fs.writeFileSync(dir+'/created.json',JSON.stringify(created.data,null,2));
      check(`${mode} ${format}: creation returns record`,!!created.data.id,{id:created.data.id,status:created.data.status});
      const exp=await finished(created.data.id);
      fs.writeFileSync(dir+'/completed.json',JSON.stringify(exp,null,2));
      check(`${mode} ${format}: Completed, one observation and one location`,exp.status==='Completed'&&exp.summary.observations.count===1&&exp.summary.locations.count===1,exp);
      const r=await fetch(`http://127.0.0.1:4242/api/exports/mine/${exp.id}`,{headers:{Authorization:`Bearer ${admin.token}`},signal:AbortSignal.timeout(30000)});
      const buf=Buffer.from(await r.arrayBuffer());
      log(`GET /api/exports/mine/${exp.id} -> ${r.status} ${r.headers.get('content-type')} ${buf.length} bytes`);
      check(`${mode} ${format}: ZIP download`,r.status===200&&r.headers.get('content-type')==='application/zip'&&buf.length>0,{status:r.status,bytes:buf.length});
      fs.writeFileSync(dir+'/archive.zip',buf);
      const zip=new Zip(buf); const entries=zip.getEntries().filter(e=>!e.isDirectory);
      check(`${mode} ${format}: ZIP has readable entries`,entries.length>0,entries.map(e=>e.entryName));
      zip.extractAllTo(dir+'/entries',true);
      const manifest=[];
      for (const e of entries.sort((a,b)=>a.entryName.localeCompare(b.entryName))) {
        let bytes=e.getData();
        const item={name:e.entryName,bytes:bytes.length,rawSha256:sha(bytes)};
        if (e.entryName.endsWith('.gpkg')) {
          const dump=canonical(dir+'/entries/'+e.entryName);
          bytes=Buffer.from(JSON.stringify(dump,null,2));
          fs.writeFileSync(dir+'/canonical.json',bytes);
          item.tableCounts=Object.fromEntries(Object.entries(dump.tables).map(([n,rows])=>[n,rows.length]));
          item.canonicalSha256=sha(bytes);
        }
        item.comparisonSha256=sha(bytes); manifest.push(item);
      }
      fs.writeFileSync(dir+'/manifest.json',JSON.stringify(manifest,null,2));log({mode,format,manifest});
      manifests[format]=manifest; summaries[format]=exp.summary;
    }
    return {manifests,summaries};
  }
  function compare(mode, actual, expected) {
    for (const format of Object.keys(expected.manifests)) {
      const keys = list => list.map(({name,comparisonSha256})=>({name,comparisonSha256}));
      check(`${mode} ${format}: content parity`, JSON.stringify(keys(actual.manifests[format])) === JSON.stringify(keys(expected.manifests[format])), { expected: keys(expected.manifests[format]), actual: keys(actual.manifests[format]) });
      check(`${mode} ${format}: summary parity`, JSON.stringify(actual.summaries[format]) === JSON.stringify(expected.summaries[format]), actual.summaries[format]);
    }
  }
  const deployment = mode => emit('deployment_verified', { mode, revision: runtimeRevision, change_committed_at: changeCommittedAt, image_id: mode === 'delegated' ? imageId : null, evidence: `${mode === 'in-process' ? 'off' : mode === 'delegated' ? 'on' : 'rollback'}/`, acceptance: 'four completed, downloaded exports with expected fixture counts' });
  await stop(c.mage);
  c.mage=start('mage-off',root+'/service/bin/mage.service.js');
  await ready('http://127.0.0.1:4242/api',c.mage);
  check('Flag off startup selects in-process',fs.readFileSync(out+'/mage-off.log','utf8').includes('exports run in-process (MAGE_EXPORT_SERVICE_URL not set)'),'expected log present');
  const baseline=await exportAll('off');
  deployment('in-process');
  const deniedOff=await req('POST',`/api/events/${event.id}/exports`,body('csv'),outsider.token,403);
  fs.writeFileSync(out+'/denied-off.json',JSON.stringify(deniedOff,null,2));
  check('Flag off denies authenticated nonparticipant',deniedOff.status===403,deniedOff);
  const sharedToken=crypto.randomBytes(24).toString('hex');
  const noTokenEnv={...env};
  delete noTokenEnv.MAGE_EXPORT_SERVICE_TOKEN;
  const noToken=spawnSync(process.execPath,[root+'/services/export/lib/index.js'],{env:noTokenEnv,cwd:root+'/service',encoding:'utf8',timeout:10000});
  fs.writeFileSync(out+'/export-service-no-token.log',noToken.stdout+noToken.stderr);
  check('Export service refuses startup without token',noToken.status===1&&(noToken.stdout+noToken.stderr).includes('MAGE_EXPORT_SERVICE_TOKEN is required'),{exitCode:noToken.status,signal:noToken.signal,log:noToken.stdout+noToken.stderr});
  const remote=start('export-service',root+'/services/export/lib/index.js',{MAGE_EXPORT_SERVICE_TOKEN:sharedToken});
  await ready('http://127.0.0.1:4243/health',remote);
  const health=await fetch('http://127.0.0.1:4243/health');
  const healthBody=await health.json();
  check('Standalone health endpoint',health.status===200&&healthBody.status==='ok',{status:health.status,body:healthBody});
  await stop(c.mage);
  c.mage=start('mage-on',root+'/service/bin/mage.service.js',{MAGE_EXPORT_SERVICE_URL:'http://127.0.0.1:4243',MAGE_EXPORT_SERVICE_TOKEN:sharedToken});
  await ready('http://127.0.0.1:4242/api',c.mage);
  check('Flag on startup selects delegation',fs.readFileSync(out+'/mage-on.log','utf8').includes('exports delegated to export service at http://127.0.0.1:4243'),'expected log present');
  const delegated=await exportAll('on');
  for (const format of Object.keys(baseline.manifests)) {
    const keys = list=>list.map(({name,comparisonSha256})=>({name,comparisonSha256}));
    check(`${format}: identical archive entry names and ${format==='geopackage'?'canonical schema/rows':'bytes'}`,
      JSON.stringify(keys(baseline.manifests[format]))===JSON.stringify(keys(delegated.manifests[format])),
      {off:keys(baseline.manifests[format]),on:keys(delegated.manifests[format])});
    check(`${format}: identical export summaries`,JSON.stringify(baseline.summaries[format])===JSON.stringify(delegated.summaries[format]),delegated.summaries[format]);
  }
  const remoteLog=fs.readFileSync(out+'/export-service.log','utf8');
  check('Standalone service handled all four requests',['csv','geojson','kml','geopackage'].every(f=>remoteLog.includes(`exported ${f} for event ${event.id}`)),remoteLog.split('\n').filter(x=>x.includes('exported')));
  log('PARITY COMPLETE');
  deployment('delegated');
  const deniedOn=await req('POST',`/api/events/${event.id}/exports`,body('csv'),outsider.token,403);
  fs.writeFileSync(out+'/denied-on.json',JSON.stringify(deniedOn,null,2));
  check('Flag on preserves nonparticipant denial',JSON.stringify(deniedOff)===JSON.stringify(deniedOn),deniedOn);
  const outsiderExports=await req('GET','/api/exports/mine',undefined,outsider.token,200);
  check('Denied request creates no export or delegation',outsiderExports.data.length===0&&fs.readFileSync(out+'/export-service.log','utf8')===remoteLog,{exports:outsiderExports.data});
  for (const variant of ['missing','wrong']) {
    const headers={'content-type':'application/json'};
    if(variant==='wrong') headers['x-mage-export-token']='deliberately-incorrect-test-token';
    const response=await fetch('http://127.0.0.1:4243/exports',{method:'POST',headers,body:JSON.stringify({format:'csv',event,params:{}})});
    const json=await response.json();
    check(`Direct service ${variant} token rejected`,response.status===401&&json.error==='unauthorized',{status:response.status,body:json});
  }
  const malformed=await fetch('http://127.0.0.1:4243/exports',{method:'POST',headers:{'content-type':'application/json','x-mage-export-token':sharedToken},body:JSON.stringify({format:'csv',event:{}})});
  const malformedBody=await malformed.json();
  fs.writeFileSync(out+'/malformed.json',JSON.stringify({status:malformed.status,body:malformedBody},null,2));
  check('Malformed event with valid token is HTTP 400',malformed.status===400&&malformedBody.error.startsWith('invalid event:'),{status:malformed.status,body:malformedBody});
  const healthyAfterMalformed=await fetch('http://127.0.0.1:4243/health');
  const healthyBody=await healthyAfterMalformed.json();
  check('Malformed event does not crash export service',healthyAfterMalformed.status===200&&healthyBody.status==='ok'&&remote.exitCode===null&&remote.signalCode===null,{status:healthyAfterMalformed.status,body:healthyBody,pid:remote.pid});
  emit('fault_injected', { incident_id: 'exporter-stop-1', fault: 'intentional exporter process/container stop' });
  await stop(remote); log('STOP export-service before outage check');
  const began=Date.now();
  const unavailable=await req('POST',`/api/events/${event.id}/exports`,body('csv'),admin.token,200);
  check('Outage creation still returns export record',!!unavailable.data.id,unavailable.data);
  const failed=await finished(unavailable.data.id);
  fs.writeFileSync(out+'/outage.json',JSON.stringify(failed,null,2));
  check('Outage export transitions to Failed without hanging',failed.status==='Failed'&&Date.now()-began<30000,{elapsedMs:Date.now()-began,...failed});
  emit('incident_detected', { incident_id: 'exporter-stop-1', evidence: 'outage.json', criterion: 'authenticated export observed Failed' });
  const failedPath=path.join(env.MAGE_EXPORT_DIR,failed.relativePath);
  const fdDir=`/proc/${c.mage.pid}/fd`;
  const orphanFds=fs.readdirSync(fdDir).map(x=>{try{return fs.readlinkSync(path.join(fdDir,x))}catch{return ''}}).filter(x=>x.includes(failed.relativePath));
  check('Failed export leaves no orphan file or open descriptor',!fs.existsSync(failedPath)&&orphanFds.length===0,{failedPath,exists:fs.existsSync(failedPath),orphanFds,remainingExports:fs.readdirSync(env.MAGE_EXPORT_DIR)});
  const alive=await req('GET',`/api/events/${event.id}`,undefined,admin.token,200);
  check('API remains alive after exporter outage',alive.data.id===event.id&&c.mage.exitCode===null,{eventId:alive.data.id,pid:c.mage.pid});
  await delay(2000);
  const after=await req('GET','/api/exports/mine',undefined,admin.token,200);
  check('API remains responsive two seconds after outage',after.data.find(x=>x.id===failed.id).status==='Failed'&&c.mage.exitCode===null&&c.mage.signalCode===null,{status:after.status,failedExportStatus:after.data.find(x=>x.id===failed.id).status});
  emit('recovery_started', { incident_id: 'exporter-stop-1', action: 'restart same exporter revision; no new release' });
  const recovered = start('export-recovered', root+'/services/export/lib/index.js', { MAGE_EXPORT_SERVICE_TOKEN: sharedToken });
  await ready('http://127.0.0.1:4243/health', recovered);
  const recoveredExports = await exportAll('recovery');
  compare('recovery', recoveredExports, baseline);
  emit('incident_recovered', { incident_id: 'exporter-stop-1', evidence: 'recovery/', criterion: 'all four authenticated export formats downloaded and matched baseline' });
  const history = await req('GET','/api/exports/mine',undefined,admin.token,200);
  check('Recovery does not silently replay the failed job',history.data.find(x=>x.id===failed.id).status==='Failed','failed record retained; new jobs used for recovery');
  emit('rollback_started', { action: 'stop exporter, unset URL and token, restart API' });
  await stop(recovered);
  await stop(c.mage);
  c.mage = start('mage-rollback', root+'/service/bin/mage.service.js');
  await ready('http://127.0.0.1:4242/api', c.mage);
  check('Rollback selects legacy engine',fs.readFileSync(out+'/mage-rollback.log','utf8').includes('exports run in-process (MAGE_EXPORT_SERVICE_URL not set)'),'exporter stopped, feature flag unset');
  const rolledBack = await exportAll('rollback');
  compare('rollback', rolledBack, baseline);
  deployment('rollback');
  emit('rollback_verified', { evidence: 'rollback/', criterion: 'all four formats match with exporter stopped; persisted fixture reused' });
  const retirement = spawnSync('bash', [root+'/services/export/scripts/check-dead-code.sh'], { cwd:root, encoding:'utf8' });
  fs.writeFileSync(out+'/retirement-gate.log',retirement.stdout+retirement.stderr);
  check('Static retirement importer gate',retirement.status===0,{exitCode:retirement.status});
  emit('retirement_decision', { decision: 'retain legacy path', reason: 'no production observation window or operator approval; static gate alone does not authorize deletion' });
  log(`FINISHED ${results.length} assertions`);
};
