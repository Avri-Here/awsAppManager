


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


    ipcMain.handle('trayNotification', (_, args = {}) => {

        const iconPath = process.env.NOTIFICATION_ICON_PATH;
        
        return new Promise(async resolve => {

            const otherBalloonOpen = () => process.env.BALLOON_OPENED === 'true';

            while (otherBalloonOpen()) await new Promise(resolve => setTimeout(resolve, 300));

            process.env.BALLOON_OPENED = true;

            tray.removeAllListeners('balloon-click');
            tray.removeAllListeners('balloon-closed');

            tray.displayBalloon({
                icon: iconPath,
                title: args.title,
                noSound: !args.sound,
                content: args.message,
                respectQuietTime: true,
                iconType: args.iconType || 'info',
            });


            const timer = setTimeout(() => {

                tray.removeBalloon();
                process.env.BALLOON_OPENED = false;
                resolve('timeout');

            }, args.timeout || 5000);


            tray.once('balloon-click', () => {

                clearTimeout(timer);

                process.env.BALLOON_OPENED = false;
                tray.removeBalloon();

                resolve('balloonClick');
            });


            tray.once('balloon-closed', () => {

                clearTimeout(timer);

                process.env.BALLOON_OPENED = false;
                tray.removeBalloon();

                resolve('balloonClosed');
            });

        });
    });


};
