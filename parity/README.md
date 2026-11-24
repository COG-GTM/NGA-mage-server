# Angular upgrade parity suite

Same Playwright specs run against the baseline (`develop` worktree, http://localhost:4000) and the upgraded branch (http://localhost:4200).

```bash
# each checkout: build web-app + plugins (npm run build-all), then from <checkout>/instance:
PARITY_PORT=4000 PARITY_NAME=baseline node -r ./root_modules_first.js ./node_modules/.bin/mage.service -C <repo>/parity/instance.config.js
PARITY_PORT=4200 PARITY_NAME=upgraded node -r ./root_modules_first.js ./node_modules/.bin/mage.service -C <repo>/parity/instance.config.js

# fresh state per run: drop mage_parity_baseline / mage_parity_upgraded DBs and parity/.auth, then restart both servers
cd parity && npm ci && npx playwright install chromium
npx playwright test            # both projects
node compare.mjs               # report/side-by-side/*.png + report/README.md
```

Each server uses its own Mongo DB (`mage_parity_<name>`). The first run creates the admin account with a random password stored in `parity/.auth/` (git-ignored).
