const baseConfig = {
    appId: "com.avri.awsAppManager",
    productName: "AWS App Manager",
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
        description: "AWS Application Manager - A tool for managing AWS applications",
        author: "Avri-Here"
    },
    publish: {
        provider: "github",
        owner: "Avri-Here",
        repo: "awsAppManager",
        private: false
    },
    nsis: {
        oneClick: false,
        perMachine: true,
        allowToChangeInstallationDirectory: false,
        createDesktopShortcut: true,
        createStartMenuShortcut: false,
        // guid: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        differentialPackage: false
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
            publisher: "CN=Avri-Here",
            publisherDisplayName: "Avri-Here",
            languages: ["en-US"],
        },
        win: {
            icon: "src/assets/icons/managerAws.ico",
            target: [{
                target: "nsis",
                arch: ["x64"]
            }],
            legalTrademarks: "Avri © 2025",
            verifyUpdateCodeSignature: false,
            requestedExecutionLevel: "asInvoker",
            signAndEditExecutable: false,
            signDlls: false,
            publisherName: "Avri-Here"
        },
        compression: "normal",
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