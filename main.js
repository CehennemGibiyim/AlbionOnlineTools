const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this local tool, or use preload
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e1e24',
      symbolColor: '#74b1be'
    }
  });

  mainWindow.loadFile('index.html');
  
  // Custom Titlebar integration can be handled if needed, otherwise default window frames
  if (process.platform === 'win32') {
    mainWindow.removeMenu(); // Remove default windows menu
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
