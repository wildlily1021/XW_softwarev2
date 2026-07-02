import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { SaveDialogOptions, OpenDialogOptions } from '../../src/shared/platform-bridge';

const require = createRequire(import.meta.url);
const { ipcMain, dialog, BrowserWindow, app } = require('electron') as typeof import('electron');

const IPC_READ_TEXT_FILE = 'file:read-text';
const IPC_WRITE_TEXT_FILE = 'file:write-text';
const IPC_SHOW_SAVE_DIALOG = 'file:show-save-dialog';
const IPC_SHOW_OPEN_DIALOG = 'file:show-open-dialog';
const IPC_GET_USER_DATA_PATH = 'file:get-user-data-path';

async function handleReadTextFile(_e: Electron.IpcMainInvokeEvent, filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err: unknown) {
    if (isMissingAppStateFile(err, filePath)) {
      return '';
    }
    throw err;
  }
}

async function handleWriteTextFile(_e: Electron.IpcMainInvokeEvent, filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

function handleGetUserDataPath(): string {
  return path.join(app.getPath('userData'), 'dongfanghong');
}

function isMissingAppStateFile(err: unknown, filePath: string): boolean {
  const code = (err as NodeJS.ErrnoException | undefined)?.code;
  if (code !== 'ENOENT') return false;

  const stateDir = path.join(app.getPath('userData'), 'dongfanghong', 'state');
  const relativePath = path.relative(stateDir, filePath);
  return relativePath !== '' && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

async function handleShowSaveDialog(e: Electron.IpcMainInvokeEvent, opts: SaveDialogOptions): Promise<string | null> {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showSaveDialog(win!, {
    title: opts.title,
    defaultPath: opts.defaultPath,
    filters: opts.filters as Electron.FileDialogFilter[] | undefined,
  });
  return result.canceled ? null : result.filePath ?? null;
}

async function handleShowOpenDialog(e: Electron.IpcMainInvokeEvent, opts: OpenDialogOptions): Promise<string | null> {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showOpenDialog(win!, {
    title: opts.title,
    defaultPath: opts.defaultPath,
    filters: opts.filters as Electron.FileDialogFilter[] | undefined,
    properties: opts.multiple ? ['multiSelections'] : undefined,
  });
  return result.canceled ? null : result.filePaths[0] ?? null;
}

export function registerFileHandlers(): void {
  ipcMain.handle(IPC_READ_TEXT_FILE, handleReadTextFile);
  ipcMain.handle(IPC_WRITE_TEXT_FILE, handleWriteTextFile);
  ipcMain.handle(IPC_SHOW_SAVE_DIALOG, handleShowSaveDialog);
  ipcMain.handle(IPC_SHOW_OPEN_DIALOG, handleShowOpenDialog);
  ipcMain.handle(IPC_GET_USER_DATA_PATH, handleGetUserDataPath);
}

export function cleanupFileHandlers(): void {
  ipcMain.removeHandler(IPC_READ_TEXT_FILE);
  ipcMain.removeHandler(IPC_WRITE_TEXT_FILE);
  ipcMain.removeHandler(IPC_SHOW_SAVE_DIALOG);
  ipcMain.removeHandler(IPC_SHOW_OPEN_DIALOG);
  ipcMain.removeHandler(IPC_GET_USER_DATA_PATH);
}
