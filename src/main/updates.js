import { Notification, BrowserWindow, dialog } from "electron";



export default async () => {

    try {

        global.logOnWebConsole(`📦 Current version : ${process.env.appVersion}`);

        const updaterModule = await import('electron-updater');
        const autoUpdater = updaterModule?.autoUpdater ?? updaterModule?.default?.autoUpdater;
        autoUpdater.autoDownload = false;

        if (process.env.IS_DEV_MODE) {
            debuggerForDevEnv(autoUpdater);
        };
        callEventHandlers(autoUpdater);


        const result = await autoUpdater.checkForUpdates();
        const isUpdateAvailable = !!result?.updateInfo && result.updateInfo.version !== process.env.appVersion;

        global.logOnWebConsole('🔍 Update check completed :', isUpdateAvailable);

        if (isUpdateAvailable) {

            const notificationObj = {
                title: "New update available ..",
                iconType: "info", sound: true, timeout: 9000,
                message: "Click here to start App update ..",
            };

            const userClicked = await new Promise((resolve) => {
                const notif = new Notification({
                    title: notificationObj.title,
                    body: notificationObj.message,
                    silent: !notificationObj.sound,
                    icon: process.env.NOTIFICATION_ICON_PATH,
                });

                const timer = setTimeout(() => {
                    notif.close();
                    resolve(false);
                }, notificationObj.timeout || 9000);

                notif.once('click', () => {
                    clearTimeout(timer);
                    notif.close();
                    resolve(true);
                });

                notif.show();
            });

            if (userClicked) {

                global.logOnWebConsole('🔄 Downloading update ...');
                await autoUpdater.downloadUpdate();
                autoUpdater.autoInstallOnAppQuit = true;
            }
        }


    } catch (error) {

        global.logOnWebConsole('❌ Auto-updater initialization error:', error?.stack || error?.message || String(error));

    }
};





const debuggerForDevEnv = (autoUpdater) => {

    autoUpdater?.setFeedURL({
        provider: 'github',
        owner: 'Avri-Here',
        repo: 'awsAppManager',
        private: false,
    });

    autoUpdater.logger = {
        info: (msg) => global.logOnWebConsole(msg),
        warn: (msg) => global.logOnWebConsole(msg),
        error: (msg) => global.logOnWebConsole(msg),
        debug: (msg) => global.logOnWebConsole(msg),
        transports: {
            file: { level: 'debug' } 
        }
    };

    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.updateConfigPath = process.env.DEV_UPDATE_CONFIG_PATH;
    autoUpdater.autoDownload = false;


};


const callEventHandlers = (autoUpdater) => {


    autoUpdater.on('download-progress', (progress) => {
        global.logOnWebConsole(`⬇️ Download progress: ${progress.percent.toFixed(2)}%`);
        global.logOnWebConsole(`📊 Downloaded ${progress.transferred} of ${progress.total} bytes`);
        global.logOnWebConsole(`⚡ Download speed: ${progress.bytesPerSecond} bytes/sec`);

        try {
            const fraction = Math.max(0, Math.min(1, (progress?.percent ?? 0) / 100));
            BrowserWindow.getAllWindows().forEach(win => win.setProgressBar(fraction, { mode: 'normal' }));
        } catch (_) {}
    });

    autoUpdater.on('update-downloaded', async (info) => {
        global.logOnWebConsole('✅ Update downloaded:', JSON.stringify(info, null, 2));

        try { BrowserWindow.getAllWindows().forEach(win => win.setProgressBar(-1)); } catch (_) {}

        try {
            const result = await dialog.showMessageBox({
                type: 'info',
                buttons: ['Install now', 'Install on exit'],
                defaultId: 0,
                cancelId: 1,
                title: 'Update Ready !',
                message: 'The update has been downloaded. Do you want to install it now or on app exit ?',
                detail: `Version ${info?.version ?? ''} is ready to install .`
            });

            if (result.response === 0) {
                autoUpdater.autoInstallOnAppQuit = false;
                global.logOnWebConsole('🚀 Installing update now...');
                autoUpdater.quitAndInstall();
            } else {
                autoUpdater.autoInstallOnAppQuit = true;
                global.logOnWebConsole('🕘 Update will be installed on app exit.');
            }
        } catch (e) {
            global.logOnWebConsole('⚠️ Could not show install prompt, will install on exit.');
            autoUpdater.autoInstallOnAppQuit = true;
        }
    });

    autoUpdater.on('error', (error) => {
        global.logOnWebConsole('❌ AutoUpdater Error:', error);
        global.logOnWebConsole('🔍 Error details:', error.stack || error.message);
    });
}

