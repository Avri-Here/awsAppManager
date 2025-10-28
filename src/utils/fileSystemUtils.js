

import { join } from "path";
import { homedir } from "os";
import { unlink } from "fs/promises";
import { parse, stringify } from "ini";
import { writeFileSync, readFileSync, existsSync, renameSync } from "fs";





const writeLocks = new Set();

export const getAwsCredentialsPath = () => {
    return join(homedir(), '.aws', 'credentials');
};

export const updateCredentialsFile = (profile, credentials, config) => {

    const credentialsPath = getAwsCredentialsPath();

    while (writeLocks.has(credentialsPath)) {
        
        const delay = Math.random() * 100 + 50;

        if (process.env.IS_WINDOWS) {
            
            require('child_process').execSync(`ping 127.0.0.1 -n 1 > nul`, { timeout: delay });
        } else {
            require('child_process').execSync(`ping 127.0.0.1 > /dev/null`, { timeout: delay });
        }
    }

    writeLocks.add(credentialsPath);

    try {
        let credentialsContent = '';

        if (existsSync(credentialsPath)) {
            const backupPath = credentialsPath + '.bak';
            credentialsContent = readFileSync(credentialsPath, 'utf-8');
            writeFileSync(backupPath, credentialsContent);
        }

        const configData = credentialsContent ? parse(credentialsContent) : {};

        configData[profile] = {
            aws_access_key_id: credentials.AccessKeyId,
            aws_secret_access_key: credentials.SecretAccessKey,
            aws_session_token: credentials.SessionToken,
            region: config.defaultRegion
        };

        const tempPath = credentialsPath + '.tmp.' + Date.now();
        writeFileSync(tempPath, stringify(configData));
        renameSync(tempPath, credentialsPath);
    } finally {
        writeLocks.delete(credentialsPath);
    }
};

export const updateMavenSettings = (authToken) => {
    const settingsPath = join(homedir(), '.m2', 'settings.xml');

    if (!existsSync(settingsPath)) {
        throw new Error("Maven settings.xml not found, skipping Maven configuration.");
    }

    let settingsContent = readFileSync(settingsPath, 'utf-8');
    const serverIds = ['cxone-codeartifact', 'platform-utils', 'plugins-codeartifact'];

    let updated = false;

    serverIds.forEach(serverId => {
        const serverRegex = new RegExp(
            `(<server>\\s*<id>${serverId}</id>\\s*<username>.*?</username>\\s*<password>)([^<]*)(</password>\\s*</server>)`,
            'gis'
        );

        const match = settingsContent.match(serverRegex);
        if (match) {
            settingsContent = settingsContent.replace(serverRegex, `$1${authToken}$3`);
            updated = true;
        }
    });

    if (updated) {
        writeFileSync(settingsPath, settingsContent);
    } else {
        console.log("No matching server configurations found in Maven settings.xml.");
        return;
    }
};

export const updateNpmConfig = (authToken) => {

    const registry = 'https://nice-devops-369498121101.d.codeartifact.us-west-2.amazonaws.com/npm/cxone-npm/';
    const authTokenKey = '//nice-devops-369498121101.d.codeartifact.us-west-2.amazonaws.com/npm/cxone-npm/:_authToken';

    const npmrcContent = `registry=${registry}\n${authTokenKey}=${authToken}\n`;
    const npmrcPath = join(homedir(), '.npmrc');

    writeFileSync(npmrcPath, npmrcContent);
};


export const removeNpmConfig = async () => {

    try {

        const npmrcPath = join(homedir(), '.npmrc');
        if (!existsSync(npmrcPath)) {
            return "NPM config file not found - skipping removal ...";

        };

        await unlink(npmrcPath);

        return "NPM config file removed successfully ...";
    } catch (error) {
        return `Error removing NPM config file : ${error}`;
    };
};




