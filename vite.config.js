

import { rmSync } from "fs";
import { join } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";


const pkg = require("./package.json");
const __dirname = import.meta.dirname || process.cwd();

const rendererRoot = join(__dirname, "src", "renderer");
const mainEntryPoint = join(__dirname, "src", "main", "main.js");


const mainOutDir = join(__dirname, "dist-main");
const rendererOutDir = join(__dirname, "dist-renderer");

const dirsToClean = ["dist-main", "dist-preload", "dist-renderer", "release"];

process.env.VITE_APP_VERSION = pkg.version;

export default defineConfig(({ command }) => {

    try {
        if (process.platform === "win32") {
            execSync("taskkill /F /IM electron.exe", { stdio: "ignore" });
        }

        if (process.platform === "darwin") {
            execSync("pkill electron", { stdio: "ignore" });
        }
    } catch (error) { }


    

    const isServe = command === "serve";
    const isBuild = command === "build";
    const sourcemap = isServe || process.argv.includes("--sourcemap");
    
    if (!isServe && isBuild) {
        dirsToClean.forEach(dir => {
            try {
                rmSync(join(__dirname, dir), { recursive: true, force: true });
            } catch (err) {
                console.warn(`Could not remove ${dir}:`, err);
            }
        });
    }

    return {
        root: rendererRoot,
        build: {
            sourcemap,
            emptyOutDir: true,
            outDir: rendererOutDir,
            // minify: 'esbuild',
            // target: 'esnext',
            // chunkSizeWarningLimit: 2000,
            // rollupOptions: {
            //     output: {
            //         manualChunks: {
            //             vendor: ['react', 'react-dom'],
            //             aws: ['@aws-sdk/client-codeartifact', '@aws-sdk/client-sts', '@aws-sdk/credential-providers'],
            //             ui: ['@fluentui/react-components', '@fluentui/react-icons']
            //         }
            //     }
            // }
        },
        plugins: [
            react(),
            electron([
                {
                    entry: mainEntryPoint,
                    onstart(options) {
                        options.startup();
                    },
                    vite: {
                        build: {
                            sourcemap,
                            minify: isBuild,
                            outDir: mainOutDir,
                            rollupOptions: {
                                external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
                            },
                        },
                    },
                },
            ]),
            process.env.NODE_ENV === "test" ? null : renderer(),
        ],
        server: (() => ({
            host: "127.0.0.1",
            port: 7777,
        }))(),
        clearScreen: false,
        test: {
            root: "src",
        },
    };
}); 