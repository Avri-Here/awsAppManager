

import { join } from "path";
import { homedir } from "os";
import { promisify } from "util";
import { unlink } from "fs/promises";
import { exec } from "child_process";
import { parse, stringify } from "ini";
import { parseString, Builder } from "xml2js";
import { writeFileSync, readFileSync, existsSync, renameSync } from "fs";





const writeLocks = new Set();

export const getAwsCredentialsPath = () => {
    return join(homedir(), '.aws', 'credentials');
};

export const updateCredentialsFile = (profile, credentials, config) => {
    const credentialsPath = getAwsCredentialsPath();

    while (writeLocks.has(credentialsPath)) {
        const delay = Math.random() * 100 + 50;
        require('child_process').execSync(`ping 127.0.0.1 -n 1 > nul`, { timeout: delay });
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

export const updateMavenSettings = async (authToken) => {
    const settingsPath = join(homedir(), '.m2', 'settings.xml');

    if (!existsSync(settingsPath)) {
        throw new Error("Maven settings.xml not found, skipping Maven configuration.");
    }

    const settingsContent = readFileSync(settingsPath, 'utf-8');
    const parseXml = promisify(parseString);

    const result = await parseXml(settingsContent);

    if (result.settings?.servers?.[0]?.server) {
        const servers = result.settings.servers[0].server;
        const serverIds = ['cxone-codeartifact', 'platform-utils', 'plugins-codeartifact'];

        let updated = false;
        servers.forEach((server) => {
            if (server.id && serverIds.includes(server.id[0])) {
                server.password = [authToken];
                updated = true;
            }
        });

        if (updated) {
            const builder = new Builder();
            const xml = builder.buildObject(result);
            writeFileSync(settingsPath, xml);
        } else {
            throw new Error("No matching server configurations found in Maven settings.xml.");
        }
    }
};

export const updateNpmConfig = async (authToken) => {

    const execAsync = promisify(exec);
    const registry = 'https://nice-devops-369498121101.d.codeartifact.us-west-2.amazonaws.com/npm/cxone-npm/';
    const authTokenKey = '//nice-devops-369498121101.d.codeartifact.us-west-2.amazonaws.com/npm/cxone-npm/:_authToken';

    await execAsync(`npm config set registry "${registry}"`);
    await execAsync(`npm config set "${authTokenKey}" "${authToken}"`);
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




