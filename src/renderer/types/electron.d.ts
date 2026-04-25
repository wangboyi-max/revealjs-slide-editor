declare global {
  interface Window {
    electronAPI: {
      file: {
        read: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
        write: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      };
      dialog: {
        showSaveDialog: (options: { title?: string; defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePath?: string }>;
        showOpenDialog: (options: { title?: string; filters?: { name: string; extensions: string[] }[]; properties?: ('openFile' | 'openDirectory' | 'multiSelections')[] }) => Promise<{ canceled: boolean; filePaths?: string[] }>;
      };
      export: {
        html: (html: string, defaultFileName?: string) => Promise<{ success: boolean; error?: string; filePath?: string }>;
      };
      getAppDataPath: () => Promise<string>;
      on: (channel: string, callback: (...args: unknown[]) => void) => void;
      off: (channel: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

declare module 'reveal.js' {
  const Reveal: {
    initialize: (options?: object) => { slide: (index: number) => void };
  };
  export default Reveal;
}

export {};
