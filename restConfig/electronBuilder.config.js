

const baseConfig = {
    appId: "com.avri.awsAppManager",
    productName: "awsAppManager",
    directories: {
        output: "release",
        buildResources: "build",
    },
    files: ["dist-main/main.js", "dist-preload/index.js", "dist-renderer/**/*"],
    extraResources: [
        {
            from: "src/assets",
            to: "src/assets"
        }
    ],
    extraMetadata: {
        version: process.env.VITE_APP_VERSION,
    },
    publish: {
        provider: "github",
        owner: "Avri-Here",
        repo: "awsAppManager",
        private: false
    },
    nsis: {
        oneClick: false,
        perMachine: false,
        allowToChangeInstallationDirectory: false,
        createDesktopShortcut: false,
        createStartMenuShortcut: false,
        shortcutName: "AWS App Manager",
        runAfterFinish: true,
        include: "build/installer.nsh",
        installerIcon: "build/installer/img/managerAws.ico",
        uninstallerIcon: "build/installer/img/managerAws.ico",
        installerHeader: "build/installer/img/nsisMetroHeader.bmp",
        installerHeaderIcon: "build/installer/img/managerAws.ico",
        installerSidebar: "build/installer/img/nsisMetroWizard.bmp",
        guid: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        displayLanguageSelector: false,
        multiLanguageInstaller: false,
        packElevateHelper: true,
        deleteAppDataOnUninstall: false,
        menuCategory: "Productivity",
        warningsAsErrors: false,
        unicode: true
    }
};


const platformSpecificConfigurations = {

    darwin: {
        ...baseConfig,
        afterPack: "./restConfig/codeSignMac.mjs",
        mac: {
            icon: "src/assets/icons/managerAws.icns",
            target: [{ target: "dmg" }, { target: "zip" }],
        },
    },
    win32: {
        ...baseConfig,
        artifactName: "${productName}-Setup-${version}.${ext}",
        appx: {
            applicationId: "com.avri.awsAppManager",
            backgroundColor: "#1F1F1F",
            displayName: "awsAppManager",
            identityName: "com.avri.awsAppManager",
            publisher: "CN=Avraham Yom-Tov",
            publisherDisplayName: "Avraham Yom-Tov",
            languages: ["en-US"],
        },
        win: {
            icon: "src/assets/icons/managerAws.ico",
            target: [{
                target: "nsis",
                arch: ["x64"]
            }],
            legalTrademarks: "AWS App Manager © 2024",
            verifyUpdateCodeSignature: false,
            requestedExecutionLevel: "asInvoker",
            signAndEditExecutable: true,
            signDlls: false
        },
        compression: "maximum",
        detectUpdateChannel: true,
    },
    linux: {
        ...baseConfig,
        linux: {
            category: "Utility",
            icon: "src/assets/icons/managerAws.ico",
            target: [{ target: "AppImage" }, { target: "deb" }, { target: "zip" }],
        },
    },
};

module.exports = platformSpecificConfigurations[process.platform];





























