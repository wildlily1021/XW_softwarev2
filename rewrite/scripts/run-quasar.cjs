const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const REQUIRED_NODE_MAJOR = 22;

function getNodeMajor(versionText) {
  const match = /^v?(\d+)/.exec(versionText);
  return match ? Number(match[1]) : null;
}

function findNodeExecutable() {
  const direct = process.execPath;
  if (direct && fs.existsSync(direct) && getNodeMajor(process.version) === REQUIRED_NODE_MAJOR) {
    return direct;
  }

  const candidates = [
    path.join(
      process.env.LOCALAPPDATA || '',
      'Microsoft',
      'WinGet',
      'Packages',
      'OpenJS.NodeJS.22_Microsoft.Winget.Source_8wekyb3d8bbwe',
      'node-v22.23.1-win-x64',
      'node.exe',
    ),
    'C:\\Program Files\\nodejs\\node.exe',
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to locate Node ${REQUIRED_NODE_MAJOR} for Quasar commands.`);
}

function findQuasarCli() {
  const pnpmDir = path.join(projectRoot, 'node_modules', '.pnpm');
  const entries = fs.readdirSync(pnpmDir, { withFileTypes: true });
  const appViteDir = entries.find(
    (entry) => entry.isDirectory() && entry.name.startsWith('@quasar+app-vite@2.4.0_'),
  );

  if (!appViteDir) {
    throw new Error('Unable to locate @quasar/app-vite in node_modules/.pnpm.');
  }

  return path.join(
    pnpmDir,
    appViteDir.name,
    'node_modules',
    '@quasar',
    'app-vite',
    'bin',
    'quasar.js',
  );
}

const nodePath = findNodeExecutable();
const quasarCli = findQuasarCli();
const args = [quasarCli, ...process.argv.slice(2)];

const result = spawnSync(nodePath, args, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_BUILDER_BINARIES_MIRROR:
      process.env.ELECTRON_BUILDER_BINARIES_MIRROR ??
      'https://npmmirror.com/mirrors/electron-builder-binaries/',
    ELECTRON_MIRROR:
      process.env.ELECTRON_MIRROR ?? 'https://npmmirror.com/mirrors/electron/',
    PATH: `${path.dirname(nodePath)}${path.delimiter}${process.env.PATH || ''}`,
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
