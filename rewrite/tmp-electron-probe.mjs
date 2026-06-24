import fs from 'node:fs/promises';
import path from 'node:path';

const logPath = path.resolve('./rewrite/tmp-electron-probe.log');

async function log(line) {
  await fs.appendFile(logPath, `${line}\n`, 'utf8');
}

async function probe(name, loader) {
  try {
    const value = await loader();
    await log(`${name}: ok (${typeof value})`);
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
    await log(`${name}: fail ${message}`);
  }
}

await fs.writeFile(logPath, '', 'utf8');

await probe('electron-default', async () => import('electron'));
await probe('electron-app', async () => {
  const mod = await import('electron');
  return mod.app ?? mod.default?.app;
});
await probe('serialport-default', async () => import('serialport'));
await probe('serialport-named', async () => {
  const mod = await import('serialport');
  return mod.SerialPort;
});
await probe('main-index', async () => import('./src-electron/main/index.ts'));
await probe('main-file-handlers', async () => import('./src-electron/main/file-handlers.ts'));
await probe('main-storage-filter', async () => import('./src-electron/main/storage-filter.ts'));

const electronMod = await import('electron');
const app = electronMod.app ?? electronMod.default?.app;
if (app?.quit) {
  app.quit();
}
