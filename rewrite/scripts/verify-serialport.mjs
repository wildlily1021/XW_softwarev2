// Minimal verification that the runtime serialport entry used by Electron main
// loads and that SerialPort.list() works.
// Run from rewrite/: node scripts/verify-serialport.mjs

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

try {
  const { SerialPort } = require('serialport/dist/serialport');

  console.log('serialport runtime entry loaded successfully');
  console.log('SerialPort class:', typeof SerialPort);

  const ports = await SerialPort.list();
  console.log('SerialPort.list() returned:', ports.length, 'port(s)');
  for (const port of ports) {
    console.log(' -', port.path, port.manufacturer || '(unknown manufacturer)');
  }

  console.log('\nVerification PASSED');
  process.exit(0);
} catch (err) {
  console.error('Verification FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
}
