const path = require('node:path');

// Electron builder installs production deps inside dist/electron/UnPackaged.
// That environment doesn't need `quasar prepare`, so we no-op there.
if (process.env.npm_config_production === 'true' || process.env.NODE_ENV === 'production') {
  process.exit(0);
}

const isPackagedInstall = process.cwd().includes(
  `${path.sep}dist${path.sep}electron${path.sep}UnPackaged`,
);

if (isPackagedInstall) {
  process.exit(0);
}

// Quasar CLI preparation is only needed in a fully provisioned dev install.
// We intentionally no-op here to keep packaging and dependency installs stable.
process.exit(0);
