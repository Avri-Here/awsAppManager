



import './config.js';
import createTray from './tray.js';
import startAppUpdates from './updates.js';
import handleAndServeApp from './handlers.js';

import { BrowserWindow, app } from "electron";

const isAppAlreadyRunning = app.requestSingleInstanceLock();

if (!isAppAlreadyRunning) app.quit();


const createMainApp = async () => {


    const windowOptions = {

        width: 550, height: 350,
        maxWidth: 550, maxHeight: 350,
        minWidth: 550, minHeight: 350,
        backgroundMaterial: "mica", show: false,
        titleBarStyle: 'hidden', vibrancy: "header",
        icon: process.env.ICON_PATH, resizable: true, frame: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false },
    };

    const mainWindow = new BrowserWindow(windowOptions);

    handleAndServeApp(mainWindow);
    createTray(mainWindow);

    mainWindow.webContents.on('did-finish-load', () => {

        if (process.env.IS_DEV_MODE) {
            mainWindow.webContents.openDevTools({ mode: 'undocked' });
            mainWindow.webContents.removeAllListeners('devtools-opened');
            mainWindow.webContents.once('devtools-opened', () => mainWindow.focus());
        }

        startAppUpdates();
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        return;
    }

    mainWindow.loadFile(process.env.MAIN_PAGE_PATH);
    

};


app.whenReady().then(createMainApp);
app.on('window-all-closed', () => app.quit()); 