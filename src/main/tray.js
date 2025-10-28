


import { app, Menu, Tray, ipcMain } from "electron";



export default (mainWindow) => {

    const tray = new Tray(process.env.ICON_PATH);

    const contextMenu = Menu.buildFromTemplate([

        {
            label: 'Quit',
            click: () => {
                app?.quit();
            }
        },
        {
            label: 'Console',
            click: () => {
                if (!mainWindow?.isDestroyed()) {

                    mainWindow.webContents.openDevTools({ mode: 'undocked' });

                    if (!mainWindow.isVisible()) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            }
        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('awsAppManager');


    tray.on('click', () => {

        if (mainWindow.isVisible()) {
            mainWindow.hide();
            return;
        }

        mainWindow.show();
        mainWindow.focus();
    });
};
