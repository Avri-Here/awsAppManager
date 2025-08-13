



import { join } from "path";
import { homedir } from "os";
import { authenticator } from 'otplib';
import { readFileSync, existsSync } from "fs";




const DEFAULT_ACCOUNT_LIST = [
    { accountId: 730335479582, name: "rec-dev" },
    { accountId: 211125581625, name: "rec-test" },
    { accountId: 339712875220, name: "rec-perf" },
    { accountId: 891377049518, name: "rec-staging" },
    { accountId: 934137132601, name: "dev-test-perf" },
];


export const getMfaCodeValidation = (secret) => {

    authenticator.options = { digits: 6, step: 30, window: 1 };
    return authenticator.generate(secret);

};


const parseAccountListFile = (content) => {

    const accounts = [];
    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const match = line.match(/accountId:\s*(\d+)\s*,\s*name:\s*(.+)/);
        if (match) {
            const accountId = parseInt(match[1]);
            const name = match[2].trim();

            if (!isNaN(accountId) && name) {
                accounts.push({ accountId, name });
            }
        }
    }

    return accounts;
};


export const loadAccountList = () => {

    try {
        const filePath = join(homedir(), 'awsListAccount.txt');

        if (!existsSync(filePath)) {
            console.log('No .awsListAccount file found - using defaults for account list ..');
            return DEFAULT_ACCOUNT_LIST;
        }

        const content = readFileSync(filePath, 'utf8');
        const accounts = parseAccountListFile(content);

        if (!accounts.length) {
            console.warn('No valid accounts found in .awsListAccount file - using default list ..');
            return DEFAULT_ACCOUNT_LIST;
        };

        console.log(`Loaded ${accounts.length} accounts from  - awsListAccount file !`);
        return accounts;

    } catch (error) {
        console.error('Error loading account list :', error);
        return DEFAULT_ACCOUNT_LIST;
    }
};
