import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import * as fs from 'fs';

export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: `读取文件失败: ${filePath}, 错误: ${(error as Error).message}` };
    }
  });

  ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
    try {
      await fs.promises.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: `写入文件失败: ${filePath}, 错误: ${(error as Error).message}` };
    }
  });

  ipcMain.handle('dialog:showSaveDialog', async (_event, options: Electron.SaveDialogOptions) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });

  ipcMain.handle('dialog:showOpenDialog', async (_event, options: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  });

  ipcMain.handle('file:getAppDataPath', async () => {
    return app.getPath('userData');
  });

  ipcMain.handle('export:html', async (_event, html: string, defaultFileName: string) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: '导出为 Reveal.js HTML',
        defaultPath: `${defaultFileName || 'presentation'}.html`,
        filters: [{ name: 'HTML Files', extensions: ['html'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      await fs.promises.writeFile(result.filePath, html, 'utf-8');
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: `导出HTML失败: ${defaultFileName}, 错误: ${(error as Error).message}` };
    }
  });
}
