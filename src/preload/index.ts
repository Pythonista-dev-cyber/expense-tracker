import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@shared/ipc';
import type { ExpenseApi } from '@shared/types';

const api: ExpenseApi = {
  load: () => ipcRenderer.invoke(IPC.load),
  save: (data) => ipcRenderer.invoke(IPC.save, data),
  exportCsv: (csv) => ipcRenderer.invoke(IPC.exportCsv, csv),
};

contextBridge.exposeInMainWorld('api', api);
