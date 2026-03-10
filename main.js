const { app, BrowserWindow, ipcMain, Menu, dialog, net } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

// Keep a global reference of the window object
let mainWindow = null;
let appDataPath = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Initialize app data directory
function initAppData() {
    appDataPath = path.join(app.getPath('userData'), 'albion-tools');
    if (!fs.existsSync(appDataPath)) {
        fs.mkdirSync(appDataPath, { recursive: true });
    }
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: true
        },
        icon: path.join(__dirname, 'dist', 'assets', 'icon.png'),
        show: false
    });

    const startUrl = isDev 
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, 'index.html')}`;

    mainWindow.loadURL(startUrl);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create application menu
    createMenu();

    // Handle any uncaught exceptions
    mainWindow.webContents.on('crashed', () => {
        dialog.showErrorBox('Uygulama Hatası', 'Albion Tools çöktü. Lütfen yeniden başlatın.');
        app.quit();
    });
}

function createMenu() {
    const template = [
        {
            label: 'Dosya',
            submenu: [
                {
                    label: 'Çıkış',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Düzen',
            submenu: [
                {
                    label: 'Yakınlaştır',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.zoomFactor += 0.1;
                        }
                    }
                },
                {
                    label: 'Uzaklaştır',
                    accelerator: 'CmdOrCtrl+Minus',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.zoomFactor -= 0.1;
                        }
                    }
                },
                {
                    label: 'Normal Boyuta Döndür',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.zoomFactor = 1;
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Geliştirici Araçları',
                    accelerator: 'F12',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.toggleDevTools();
                        }
                    }
                }
            ]
        },
        {
            label: 'Yardım',
            submenu: [
                {
                    label: 'Hakkında',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Albion Online Tools Hakkında',
                            message: 'Albion Online Tools v2.0.0',
                            detail: 'Kapsamlı Albion Online araç takımı\nMarket analizi, craft hesaplamcısı, PvP tracking ve daha fazlası',
                            buttons: ['Tamam']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Event Handlers
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-data-path', () => {
    return appDataPath;
});

ipcMain.handle('check-update', async () => {
    // Placeholder for update checking
    return { hasUpdate: false, version: app.getVersion() };
});

ipcMain.handle('open-file-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
});

ipcMain.handle('save-file-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-message-box', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});

// App event handlers
app.on('ready', () => {
    initAppData();
    createWindow();
});

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar to stay active
    // until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    if (mainWindow === null) {
        createWindow();
    }
});

// Handle any unhandled exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    dialog.showErrorBox('Hata', 'Bir hata oluştu: ' + error.message);
});

console.log('✅ Electron Main Process başlatıldı');
