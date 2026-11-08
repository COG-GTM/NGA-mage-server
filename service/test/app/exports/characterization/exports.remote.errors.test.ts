import { expect } from 'chai'
import http from 'http'
import { AddressInfo } from 'net'
import { RemoteExportEngine, RemoteExportError, EXPORT_SUMMARY_HEADER } from '../../../../lib/app.impl/exports/app.impl.exports.remote'
import { BufferWriteable } from '../../../utils'
import { fixtureEvent, fixtureExportParams } from './fixture'

describe('remote export transport failures (HTTP integration)', function() {

  let server: http.Server
  let content: BufferWriteable

  afterEach(async function() {
    content?.destroy()
    server?.closeAllConnections()
    if (server?.listening) {
      await new Promise<void>(resolve => server.close(() => resolve()))
    }
  })

  async function exportResponse(handler: http.RequestListener): Promise<unknown> {
    server = http.createServer(handler)
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address() as AddressInfo
    content = new BufferWriteable()
    const engine = RemoteExportEngine({ url: `http://127.0.0.1:${port}`, timeout: 1000 })
    let deadline: NodeJS.Timeout | undefined
    try {
      return await Promise.race([
        engine.export('csv', fixtureEvent(), fixtureExportParams(), content).then(
          () => 'completed',
          error => error
        ),
        new Promise<string>(resolve => {
          deadline = setTimeout(() => resolve('still pending after the response disconnected'), 1500)
        })
      ])
    }
    finally {
      if (deadline) clearTimeout(deadline)
    }
  }

  it('rejects a complete HTTP error response and releases the content stream', async function() {
    const error = await exportResponse((req, res) => {
      req.resume()
      res.writeHead(503, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'export temporarily unavailable' }))
    })
    expect(error).to.be.instanceOf(RemoteExportError)
    expect((error as RemoteExportError).statusCode).to.equal(503)
    expect(content.destroyed).to.be.true
  })

  for (const statusCode of [ 200, 401, 503 ]) {
    it(`rejects an interrupted HTTP ${statusCode} response and releases the content stream`, async function() {
      const error = await exportResponse((req, res) => {
        req.resume()
        res.writeHead(statusCode, {
          'content-type': statusCode === 200 ? 'application/zip' : 'application/json',
          'content-length': 1000,
          'connection': 'close',
          [EXPORT_SUMMARY_HEADER]: JSON.stringify({ observations: { count: 1 } })
        })
        res.end('partial response')
      })
      expect(error, 'a disconnected response must settle the export instead of leaving it running').to.be.instanceOf(RemoteExportError)
      expect((error as RemoteExportError).statusCode).to.equal(statusCode)
      expect((error as Error).message).to.equal('export service response aborted')
      expect(content.destroyed).to.be.true
    })
  }
})
