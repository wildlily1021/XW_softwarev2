const fs = require('node:fs');
const path = require('node:path');

const logPath = path.resolve(__dirname, 'tmp-electron-entry-probe.log');

function log(line) {
  fs.appendFileSync(logPath, `${line}\n`, 'utf8');
}

fs.writeFileSync(logPath, '', 'utf8');

for (const mod of ['electron', 'electron/main', 'electron/renderer']) {
  try {
    const value = require(mod);
    const keys = value && typeof value === 'object' ? Object.keys(value).slice(0, 10).join(',') : typeof value;
    log(`${mod}: ok ${keys}`);
  } catch (error) {
    log(`${mod}: fail ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`);
  }
}

try {
  const electron = require('electron');
  log(`electron.app: ${typeof electron?.app}`);
  log(`electron.BrowserWindow: ${typeof electron?.BrowserWindow}`);
} catch (error) {
  log(`electron.inspect: fail ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`);
}
