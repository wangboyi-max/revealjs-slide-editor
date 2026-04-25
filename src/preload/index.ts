import { contextBridge, ipcRenderer } from 'electron';

export interface FileResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface DialogResult {
  canceled: boolean;
  filePaths?: string[];
  filePath?: string;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
}

const api = {
  file: {
    read: (filePath: string): Promise<FileResult> => ipcRenderer.invoke('file:read', filePath),
    write: (filePath: string, content: string): Promise<FileResult> =>
      ipcRenderer.invoke('file:write', filePath, content),
  },
  dialog: {
    showSaveDialog: (options: SaveDialogOptions): Promise<DialogResult> =>
      ipcRenderer.invoke('dialog:showSaveDialog', options),
    showOpenDialog: (options: OpenDialogOptions): Promise<DialogResult> =>
      ipcRenderer.invoke('dialog:showOpenDialog', options),
  },
  getAppDataPath: (): Promise<string> => ipcRenderer.invoke('file:getAppDataPath'),
  export: {
    html: (html: string, defaultFileName?: string): Promise<{ success: boolean; error?: string; filePath?: string }> =>
      ipcRenderer.invoke('export:html', html, defaultFileName),
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['menu:new', 'menu:open', 'menu:save', 'menu:saveAs', 'menu:about'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['menu:new', 'menu:open', 'menu:save', 'menu:saveAs', 'menu:about'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
