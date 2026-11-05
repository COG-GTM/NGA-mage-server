/**
 * Flag-on characterization: the same fixture set and snapshots as
 * `exports.characterization.test.ts`, but the archive is produced by the
 * MAGE service's `RemoteExportEngine` (the `MAGE_EXPORT_SERVICE_URL` path)
 * calling a locally started export service (`services/export`) whose
 * transforms are wired to the same fixture repositories.  This proves the
 * proxy adapter, the wire protocol and the extracted transforms yield the
 * same bytes as the in-process path.
 *
 * Requires the export service to be built: `cd services/export && npm install
 * && npm link ../../service && npm run build`.  When it is not built these
 * tests are reported as pending rather than silently passing.
 */
import { expect } from 'chai'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { AddressInfo } from 'net'
import { RemoteExportEngine } from '../../../../lib/app.impl/exports/app.impl.exports.remote'
import { CHARACTERIZED_FORMATS, characterize, ExportRunner, expectMatchesSnapshot, inProcessRunner } from './characterize'
import { fixtureRepositories } from './fixture'

const EXPORT_SERVICE_LIB = path.resolve(__dirname, '..', '..', '..', '..', '..', 'services', 'export', 'lib')
const TOKEN = 'characterization-shared-secret'

describe('export characterization (remote export service, flag on)', function() {

  this.timeout(30000)

  let server: http.Server | undefined
  let url: string
  let remoteRunner: ExportRunner

  before(function() {
    if (!fs.existsSync(path.join(EXPORT_SERVICE_LIB, 'server.js'))) {
      console.warn(`export service not built at ${EXPORT_SERVICE_LIB}; skipping flag-on characterization`)
      this.skip()
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createExportServer } = require(path.join(EXPORT_SERVICE_LIB, 'server'))
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { transformFactory } = require(path.join(EXPORT_SERVICE_LIB, 'repositories'))
    const repos = fixtureRepositories()
    const quiet = { debug() {}, info() {}, warn() {}, error() {} }
    const app = createExportServer({ transformForFormat: transformFactory({ ...repos }, quiet), token: TOKEN, log: quiet })
    return new Promise<void>(resolve => {
      server = app.listen(0, '127.0.0.1', () => {
        url = `http://127.0.0.1:${(server!.address() as AddressInfo).port}`
        const engine = RemoteExportEngine({ url, token: TOKEN })
        remoteRunner = (format, event, params, out) => engine.export(format, event, params, out)
        resolve()
      })
    })
  })

  after(function() {
    server?.close()
  })

  for (const format of CHARACTERIZED_FORMATS) {
    describe(format, function() {

      it('produces the snapshotted archive entries through the export service', async function() {
        const result = await characterize(format, remoteRunner)
        expectMatchesSnapshot(result)
      })

      it('produces entries byte-identical to the in-process engine', async function() {
        const remote = await characterize(format, remoteRunner)
        const local = await characterize(format, inProcessRunner)
        expect(remote.entries.map(x => [ x.name, x.sha256 ])).to.deep.equal(local.entries.map(x => [ x.name, x.sha256 ]))
        expect(remote.summary).to.deep.equal(local.summary)
      })
    })
  }

  it('rejects requests without the shared token', async function() {
    const engine = RemoteExportEngine({ url, token: 'wrong' })
    const { BufferWriteable } = await import('../../../utils')
    const { fixtureEvent, fixtureExportParams } = await import('./fixture')
    const content = new BufferWriteable()
    let err: any
    await engine.export('csv', fixtureEvent(), fixtureExportParams(), content).catch(e => err = e)
    expect(err).to.be.instanceOf(Error)
    expect(err.statusCode).to.equal(401)
    expect(content.destroyed, 'content stream released on failure').to.be.true
  })
})
