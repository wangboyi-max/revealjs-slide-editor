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

// Track wrapped callbacks for proper unsubscribe
const wrappedCallbacks = new Map<string, Map<(...args: unknown[]) => void, (_event: Electron.IpcRendererEvent, ...args: unknown[]) => void>>();

const validChannels = ['menu:new', 'menu:open', 'menu:save', 'menu:saveAs', 'menu:about'];

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
    if (!validChannels.includes(channel)) return;

    const wrappedCallback = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);

    if (!wrappedCallbacks.has(channel)) {
      wrappedCallbacks.set(channel, new Map());
    }
    wrappedCallbacks.get(channel)!.set(callback, wrappedCallback);

    ipcRenderer.on(channel, wrappedCallback);
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    if (!validChannels.includes(channel)) return;

    const channelCallbacks = wrappedCallbacks.get(channel);
    if (!channelCallbacks) return;

    const wrappedCallback = channelCallbacks.get(callback);
    if (wrappedCallback) {
      ipcRenderer.removeListener(channel, wrappedCallback);
      channelCallbacks.delete(callback);
    }
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
