import { defineConfig } from '#q-app/wrappers';
import UnoCSS from 'unocss/vite';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import unoConfig from './uno.config';

const require = createRequire(import.meta.url);

function readInstalledPackageVersion(packageName: string): string {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    return JSON.parse(readFileSync(packageJsonPath, 'utf-8')).version as string;
  } catch {
    const resolvedEntry = require.resolve(packageName);
    let currentDir = dirname(resolvedEntry);

    while (true) {
      const packageJsonPath = join(currentDir, 'package.json');
      if (existsSync(packageJsonPath)) {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
          name?: string;
          version?: string;
        };
        if (pkg.name === packageName && typeof pkg.version === 'string') {
          return pkg.version;
        }
      }

      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }
  }

  throw new Error(`[quasar.config] Unable to resolve installed version for ${packageName}`);
}

const pinnedRuntimeDependencies = {
  echarts: readInstalledPackageVersion('echarts'),
  nanoid: readInstalledPackageVersion('nanoid'),
  pinia: readInstalledPackageVersion('pinia'),
  quasar: readInstalledPackageVersion('quasar'),
  serialport: readInstalledPackageVersion('serialport'),
  unocss: readInstalledPackageVersion('unocss'),
  vue: readInstalledPackageVersion('vue'),
  'vue-router': readInstalledPackageVersion('vue-router'),
};

export default defineConfig(() => ({
  boot: [],
  css: ['app.scss'],

  extras: ['roboto-font', 'material-icons', 'material-icons-outlined'],

  sourceFiles: {
    electronMain: 'src-electron/main/index',
  },

  build: {
    target: {
      browser: ['esnext'],
      node: 'node22',
    },

    typescript: {
      strict: true,
      vueShim: true,
    },

    vueRouterMode: 'hash',

    extendViteConf(viteConf) {
      viteConf.resolve = viteConf.resolve ?? {};
      viteConf.resolve.alias = {
        ...(viteConf.resolve.alias ?? {}),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      };

      viteConf.plugins = viteConf.plugins ?? [];
      viteConf.plugins.push(UnoCSS(unoConfig));

      // Externalize native modules for Electron main process
      viteConf.build = viteConf.build ?? {};
      viteConf.build.rollupOptions = viteConf.build.rollupOptions ?? {};
      viteConf.build.rollupOptions.external = [
        ...(Array.isArray(viteConf.build.rollupOptions.external)
          ? viteConf.build.rollupOptions.external
          : []),
        'serialport',
        '@serialport/bindings-cpp',
      ];
    },
  },

  devServer: {
    open: false,
    fs: {
      allow: ['..'],
    },
  },

  framework: {
    config: {},
    plugins: ['Dialog', 'Notify'],
  },

  animations: [],

  electron: {
    preloadScripts: ['preload/index'],
    extendPackageJson(pkg) {
      pkg.dependencies = {
        ...(pkg.dependencies ?? {}),
        ...pinnedRuntimeDependencies,
      };
    },
    inspectPort: 5859,
    bundler: 'builder',
    builder: {
      appId: 'com.lct.commander',
      productName: '激光链路标准测试设备上位机',
      npmRebuild: false,
      asar: true,
      asarUnpack: ['**/*.node'],
      win: {
        signAndEditExecutable: false,
        verifyUpdateCodeSignature: false,
        target: [
          {
            target: 'dir',
            arch: ['x64'],
          },
        ],
      },

      linux: {
        target: [
          {
            target: 'AppImage',
            arch: ['x64'],
          },
          {
            target: 'deb',
            arch: ['x64'],
          },
        ],
        icon: 'src-electron/icons/icon.png',
        category: 'Utility',
        executableName: 'lct-commander',
        synopsis: '激光链路标准测试设备上位机',
        description: '激光链路标准测试设备上位机应用程序',
        desktop: {
          Name: '激光链路标准测试设备上位机',
          GenericName: 'LCT Commander',
          Comment: '激光链路标准测试设备上位机',
          Categories: 'Utility;',
          Keywords: 'lct;commander;激光链路;',
          StartupNotify: true,
        },
      },

      afterPack: async (context: {
        packager: { platform: { name: string } };
        outDir: string;
      }) => {
        if (context.packager.platform.name !== 'linux') {
          return;
        }

        const fs = await import('node:fs/promises');
        const path = await import('node:path');

        async function findDesktopFiles(dir: string): Promise<string[]> {
          const files: string[] = [];

          try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);

              if (entry.isDirectory()) {
                files.push(...(await findDesktopFiles(fullPath)));
              } else if (entry.isFile() && entry.name.endsWith('.desktop')) {
                files.push(fullPath);
              }
            }
          } catch {
            return files;
          }

          return files;
        }

        const desktopFiles = await findDesktopFiles(context.outDir);

        for (const desktopFile of desktopFiles) {
          let content = await fs.readFile(desktopFile, 'utf-8');

          if (!content.includes('Encoding=')) {
            content = content.replace('[Desktop Entry]', '[Desktop Entry]\nEncoding=UTF-8');
            await fs.writeFile(desktopFile, content, 'utf-8');
          }
        }
      },
    },
  },
}));
