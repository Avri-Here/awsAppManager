

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
        differentialPackage: true,
        deleteAppDataOnUninstall: false
    },
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
            target: [{ target: "nsis", arch: ["x64"] }],
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












































// Portable .Exe !
// const desktopPath = process.env.USERPROFILE ? `${process.env.USERPROFILE}\\Desktop` : "release";

// const portableConfig = {
//     ...baseConfig,
//     directories: {
//         ...baseConfig.directories,
//         output: `${desktopPath}\\aws-build-temp`,
//     },
//     win: {
//         icon: "src/assets/icons/managerAws.ico",
//         target: [{
//             target: "portable",
//             arch: ["x64"]
//         }],
//     },
//     portable: {
//         artifactName: "${productName}-portable.${ext}",
//     },
// };

// module.exports = process.env.PORTABLE ? portableConfig : platformSpecificConfigurations[process.platform];


// "scripts": {
//     "buildExeOnly": "npm run build && set PORTABLE=true && electron-builder --config restConfig/electronBuilder.config.js --publish=never"
// }