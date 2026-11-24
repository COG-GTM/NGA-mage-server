// Mage instance config for the parity suite. Run from <checkout>/instance:
//   PARITY_PORT=4000 PARITY_NAME=baseline node -r ./root_modules_first.js ./node_modules/.bin/mage.service -C <repo>/parity/instance.config.js
const path = require('path')
const base = require(path.resolve(process.cwd(), 'config.js'))

const port = Number(process.env.PARITY_PORT || 4200)
const name = process.env.PARITY_NAME || 'upgraded'
const scratch = path.resolve(process.env.PARITY_SCRATCH || path.join(require('os').homedir(), 'mage-parity-scratch'), name)
const dirs = ['attachmentDir', 'exportDir', 'iconDir', 'layerDir', 'securityDir', 'userDir', 'sftpKeyDir']
const mage = { ...base.mage, port, mongo: { ...base.mage.mongo, url: `mongodb://127.0.0.1:27017/mage_parity_${name}` } }
for (const d of dirs) {
  mage[d] = path.join(scratch, path.basename(base.mage[d]))
  require('fs').mkdirSync(mage[d], { recursive: true })
}
mage.sftpKeyFile = path.join(mage.sftpKeyDir, 'mage-sftp-key')
module.exports = { mage }
