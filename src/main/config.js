


import os from 'os';
import { join } from 'path';
import { app } from 'electron';

const isRunningOnWin = os.platform() === 'win32';
const isDevMode = !app.isPackaged || !__dirname.includes('app.asar');


isRunningOnWin && (process.env.IS_WINDOWS = true);

const iconExt = isRunningOnWin ? 'ico' : isDevMode ? 'png' : 'icns';
const dirFromRoot = isDevMode ? process.cwd() : process.resourcesPath;


process.env.REJECT_UNAUTHORIZED = '0';
process.env.appVersion = app.getVersion();
app.commandLine.appendSwitch('log-level', '3');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
app.commandLine.appendSwitch('force-logging-mode', 'minimal');


if (isDevMode) {

    process.env.IS_DEV_MODE = true;
    console.log('DevMode is on - Happy coding !');
    process.on('uncaughtException', console.error);
    process.on('unhandledRejection', console.error);
    process.env.DEV_UPDATE_CONFIG_PATH = join(dirFromRoot, "restConfig", "dev-app-update.yml");

};

if (process.platform === 'win32') {
    app.setAppUserModelId('com.avri.awsAppManager');
};

process.env.MAIN_PAGE_PATH = join(__dirname, "..", "dist-renderer", "index.html");

process.env.ICON_PATH = join(dirFromRoot, "src", "assets", "icons", `managerAws.${iconExt}`);
process.env.NOTIFICATION_ICON_PATH = join(dirFromRoot, "src", "assets", "icons", `notification.png`);


