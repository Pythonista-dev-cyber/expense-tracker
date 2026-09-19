import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import icon from '../../resources/icon.png?asset';
import { IPC } from '@shared/ipc';
import { loadData, saveData } from './store';

// v1 stored data under the npm package name; keep that folder so existing expenses carry over.
// EXPENSE_TRACKER_DATA_DIR lets tests run against an isolated folder.
app.setPath(
  'userData',
  process.env.EXPENSE_TRACKER_DATA_DIR || join(app.getPath('appData'), 'expense-tracker'),
);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 900,
    minHeight: 620,
    title: 'Expense Tracker',
    backgroundColor: '#07080d',
    icon,
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#c7cbe0', height: 44 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow = win;

  // `ready-to-show` doesn't always fire for this page while the window is hidden, so also show once
  // the page has loaded. The dark backgroundColor means there is no white flash either way.
  const reveal = () => {
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  };
  win.once('ready-to-show', reveal);
  win.webContents.once('did-finish-load', reveal);
  win.on('closed', () => (mainWindow = null));

  // Never let the page open new windows or navigate away from the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  if (!app.isPackaged) {
    win.webContents.on('console-message', (event) => console.log('[renderer]', event.message));
  }

  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (!app.isPackaged && devUrl) void win.loadURL(devUrl);
  else void win.loadFile(join(__dirname, '../renderer/index.html'));
}

ipcMain.handle(IPC.load, () => loadData());
ipcMain.handle(IPC.save, (_event, data: unknown) => saveData(data));
ipcMain.handle(IPC.exportCsv, async (_event, csv: unknown) => {
  if (typeof csv !== 'string' || !mainWindow) return false;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export expenses',
    defaultPath: 'expenses.csv',
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  });
  if (canceled || !filePath) return false;
  await writeFile(filePath, '﻿' + csv, 'utf8');
  return true;
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  void app.whenReady().then(() => {
    app.setAppUserModelId('com.expensetracker.app');
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
