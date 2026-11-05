/**
 * Characterization tests: pin the exact archive entry bytes the export
 * transforms produce for a fixed fixture set, so the extraction into the
 * standalone export service can be verified to preserve output.
 *
 * Regenerate snapshots (after a deliberate, reviewed output change) with
 *   MAGE_EXPORT_SNAPSHOT_UPDATE=1 npm run test:run -- --grep "characterization \(in-process"
 */
import { expect } from 'chai'
import { CHARACTERIZED_FORMATS, characterize, expectMatchesSnapshot, inProcessRunner, readManifest } from './characterize'

describe('export characterization (in-process transforms, flag off)', function() {

  this.timeout(30000)

  for (const format of CHARACTERIZED_FORMATS) {
    describe(format, function() {

      it('produces the snapshotted archive entries', async function() {
        const result = await characterize(format, inProcessRunner)
        expectMatchesSnapshot(result)
      })

      it('is deterministic across runs', async function() {
        const first = await characterize(format, inProcessRunner)
        const second = await characterize(format, inProcessRunner)
        expect(second.entries.map(x => [ x.name, x.sha256 ])).to.deep.equal(first.entries.map(x => [ x.name, x.sha256 ]))
      })

      it('summarizes the fixture observations and location', async function() {
        const result = await characterize(format, inProcessRunner)
        expect(result.summary.observations?.count, 'observation count').to.equal(2)
        expect(result.summary.locations?.count, 'location count').to.equal(1)
      })

      it('records every entry in the manifest with a hash', function() {
        const manifest = readManifest(format)
        expect(manifest.format).to.equal(format)
        expect(Object.keys(manifest.entries)).to.not.be.empty
        for (const entry of Object.values(manifest.entries)) {
          expect(entry.sha256).to.match(/^[0-9a-f]{64}$/)
        }
      })
    })
  }
})
