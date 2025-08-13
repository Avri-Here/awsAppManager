




import { BrowserWindow, ipcMain, nativeTheme, app } from "electron";
import { getMfaCodeValidation, loadAccountList } from "../utils/restUtils.js";
import { removeNpmConfig, updateCredentialsFile, updateMavenSettings, updateNpmConfig } from '../utils/fileSystemUtils.js';
import { updateCodeArtifactToken } from "../utils/awsService.js";
import { assumeRole } from "../utils/awsService.js";
import { getSessionTokenWithMFA } from "../utils/awsService.js";



// IMPORTANT :
// Use ipcRenderer.invoke ↔ ipcMain.handle when a response ( Promise ) is needed .. 
// Use ipcRenderer.send ↔ ipcMain.on for fire-and-forget messages ( no response ) ..



const defaultConfig = {
    defaultRegion: 'us-west-2'
};

export default (mainWindow = new BrowserWindow()) => {


    global.logOnWebConsole = (message) => {
        
        mainWindow?.webContents.send("logOnWebConsole", message);
    };

    ipcMain.on("openDevTools", () => {

        mainWindow.webContents.openDevTools({ mode: 'undocked' });
    });

    ipcMain.on("minimizeWindow", () => {

        mainWindow?.hide();
    });

    ipcMain.on('setProgressBarWin', (_, value, mode = 'normal') => {

        mainWindow?.setProgressBar(value, { mode });

    });

    ipcMain.on("themeShouldUseDarkColors", (event) => {

        event.returnValue = nativeTheme.shouldUseDarkColors;
    });

    ipcMain.handle("getMfaCodeValidation", async (_, mfaSecret) => {

        return getMfaCodeValidation(mfaSecret);
    });

    ipcMain.handle("loadAccountList", () => {

        return loadAccountList()
    });

    ipcMain.handle("removeNpmConfigFile", async () => {

        await removeNpmConfig();
    });

    ipcMain.handle("getSessionTokenWithMFA", async (_, mfaCode, username) => {

        return await getSessionTokenWithMFA(mfaCode, username);
    });


    ipcMain.on("updateXmlConfiguration", async (_, authToken) => {

        try {
            updateMavenSettings(authToken);
            console.log("Updated Maven settings.xml with CodeArtifact token .");
        } catch (error) {
            console.error("Failed to update Maven settings.xml :", error);
            throw error;
        }
    });

    ipcMain.on("updateNpmConfiguration", async (_, authToken) => {

        try {
            updateNpmConfig(authToken);
            console.log("Updated NPM config with CodeArtifact token .");
        } catch (error) {
            console.error("Failed to update NPM config :", error);
            throw error;
        }
    });

    ipcMain.handle("assumeRole", async (_, accountId, isCodeArtifact, username) => {

        return await assumeRole(accountId, isCodeArtifact, username);
    });

    ipcMain.handle("updateCredentialsFile", async (_, profile, credentials) => {

        return updateCredentialsFile(profile, credentials, defaultConfig);
    });

    ipcMain.handle("updateCodeArtifactToken", async (_, credentials) => {

        return await updateCodeArtifactToken(credentials);
    });

    nativeTheme.on('updated', () => {

        BrowserWindow.getAllWindows().forEach(window => {
            window.webContents.send('nativeThemeChanged');
        });
    });

    app.on('before-quit', async (event) => {

        event?.preventDefault();
        app?.exit();
    });

    mainWindow.on('ready-to-show', () => {

        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('close', (event) => {

        event?.preventDefault();
        mainWindow?.hide();
    });
};
