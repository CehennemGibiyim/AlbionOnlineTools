const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppDataPath: () => ipcRenderer.invoke('get-app-data-path'),
    
    // Updates
    checkUpdate: () => ipcRenderer.invoke('check-update'),
    
    // File dialogs
    openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
    saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
    
    // File operations
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    
    // Dialogs
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    
    // Platform info
    platform: process.platform,
    arch: process.arch,
    
    // Process info
    env: process.env.NODE_ENV || 'production'
});

// Version info
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
});

console.log('✅ Preload script loaded');
