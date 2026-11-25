// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('funcs', {
    loadFolder: () => ipcRenderer.invoke('loadFolder'),
    loadImage: ((filepath: string) => ipcRenderer.invoke('loadImage', filepath)),
    getDirFilesList: (data: string) => ipcRenderer.invoke('getDirFilesList', data),
    getFolderPreview: (folders: string[]) => ipcRenderer.invoke('getFolderPreview', folders),
    setFullscreen: (isEnabled: boolean ) => ipcRenderer.invoke('setFullscreen', isEnabled),
    isFullscreen: () => ipcRenderer.invoke('isFullscreen'),
    // Returns a function that removes the handler again
    addFullscreenEventHandler: (callback: (arg0: boolean) => void) => {
        const listener = (_event: Electron.IpcRendererEvent, value: boolean) => callback(value);
        ipcRenderer.on('fullscreen-switched', listener);
        return () => { ipcRenderer.off('fullscreen-switched', listener); };
    },
});