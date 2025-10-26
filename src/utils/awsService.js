

import { fromIni } from "@aws-sdk/credential-providers";
import { STSClient, GetSessionTokenCommand, AssumeRoleCommand, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { CodeartifactClient, GetAuthorizationTokenCommand } from "@aws-sdk/client-codeartifact";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parse } from "ini";




const defaultConfig = {

    defaultSession: "default",
    defaultRegion: 'us-west-2',
    sourceProfile: 'nice-identity',
    mainIamAcctNum: '736763050260',
    tokenExpirationSeconds: 129600,
    codeartifactDomain: 'nice-devops',
    codeartifactDomainOwner: '369498121101',
    mfaSession: "nice-identity-mfa-session",
    codeartifactSession: "default-codeartifact",
    roleName: 'GroupAccess-Developers-Recording',
    targetAccountNumCodeartifact: '369498121101',
    targetProfileNameCodeartifact: 'GroupAccess-NICE-Developers',
};



const getCodeArtifactAuthorizationToken = async (credentials) => {

    const { AccessKeyId, SessionToken, SecretAccessKey } = credentials;

    const codeartifactClient = new CodeartifactClient({
        region: defaultConfig.defaultRegion,
        credentials: {
            accessKeyId: AccessKeyId,
            sessionToken: SessionToken,
            secretAccessKey: SecretAccessKey,
        }
    });

    const command = new GetAuthorizationTokenCommand({
        domain: defaultConfig.codeartifactDomain,
        domainOwner: defaultConfig.codeartifactDomainOwner
    });

    const response = await codeartifactClient.send(command);

    if (!response.authorizationToken) {
        throw new Error('No authorization token returned from CodeArtifact !');
    }

    return response.authorizationToken;
};


const createStsClient = (region, profile) => {

    return new STSClient({
        region,
        credentials: fromIni({ profile })
    });
};

const checkMfaSessionValidity = async () => {
    try {
        const credentialsPath = join(homedir(), '.aws', 'credentials');
        
        if (!existsSync(credentialsPath)) {
            return false;
        }

        const credentialsContent = readFileSync(credentialsPath, 'utf-8');
        const configData = parse(credentialsContent);
        
        if (!configData[defaultConfig.mfaSession] || !configData[defaultConfig.mfaSession].aws_session_token) {
            return false;
        }

        const mfaProfile = configData[defaultConfig.mfaSession];
        if (!mfaProfile.aws_access_key_id || !mfaProfile.aws_secret_access_key || !mfaProfile.aws_session_token) {
            return false;
        }

        try {
            const mfaStsClient = createStsClient(defaultConfig.defaultRegion, defaultConfig.mfaSession);
            const command = new GetCallerIdentityCommand({});
            await mfaStsClient.send(command);
            return true;
        } catch (error) {
            if (error.message && (error.message.includes('ExpiredToken') || error.message.includes('InvalidToken') || error.message.includes('expired') || error.message.includes('invalid'))) {
                console.log('MFA session credentials are expired or invalid');
                return false;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error checking MFA session validity:', error);
        return false;
    }
};




const getSessionTokenWithMFA = async (mfaCode, username) => {

    try {
        const mfaDevice = `arn:aws:iam::${defaultConfig.mainIamAcctNum}:mfa/${username}`;
        const stsClient = createStsClient(defaultConfig.defaultRegion, defaultConfig.sourceProfile);

        const command = new GetSessionTokenCommand({
            SerialNumber: mfaDevice, TokenCode: mfaCode,
            DurationSeconds: defaultConfig.tokenExpirationSeconds,
        });

        const response = await stsClient.send(command);

        if (!response.Credentials) {
            throw new Error('No credentials returned from AWS STS ...');
        }

        console.log(`Successfully cached token for ${defaultConfig.tokenExpirationSeconds} seconds`);
        return response.Credentials;
    } catch (error) {
        throw new Error(`Failed to get session token: ${error.message}`);
    }
};



const updateCodeArtifactToken = async (credentials) => {

    const authToken = await getCodeArtifactAuthorizationToken(credentials);
    return { authToken };
};




const assumeRole = async (accountId, isCodeArtifact, username) => {

    const targetAccountId = isCodeArtifact ? defaultConfig.targetAccountNumCodeartifact : accountId;
    const targetRole = `arn:aws:iam::${targetAccountId}:role/${defaultConfig.roleName}`;

    const isValid = await checkMfaSessionValidity();
    if (!isValid) {
        throw new Error('MFA_SESSION_INVALID');
    }

    try {
        const mfaStsClient = createStsClient(defaultConfig.defaultRegion, defaultConfig.mfaSession);

        const assumeRoleCommand = new AssumeRoleCommand({
            RoleArn: targetRole,
            RoleSessionName: username
        });

        const roleResponse = await mfaStsClient.send(assumeRoleCommand);
        if (!roleResponse.Credentials) {
            throw new Error(`No credentials returned from ${isCodeArtifact ? 'CodeArtifact assume role' : 'assume role'}`);
        }

        return roleResponse.Credentials;
    } catch (error) {
        if (error.message && (error.message.includes('ExpiredToken') || error.message.includes('InvalidToken') || error.message.includes('expired') || error.message.includes('invalid'))) {
            throw new Error('MFA_SESSION_EXPIRED');
        }
        throw error;
    }
};






export {
    getSessionTokenWithMFA,
    updateCodeArtifactToken,
    assumeRole,
}



/**
🧭 AWS credential flow summary :

1️⃣ Start with `nice-identity` user using static AccessKey/SecretKey
    → Cannot access anything without MFA !

2️⃣ Call `get-session-token` with MFA (TOTP code)

    → Get temporary credentials with MFA session ( valid up to 12h )

3️⃣ Store the MFA-based credentials under `nice-identity-mfa-session` profile
    → This allows using `assume-role` without repeating MFA

4️⃣ Assume role to target account/role using the MFA session
    → Receive new temporary credentials for that specific role

5️⃣ Save the assumed role credentials under `default` or `default-codeartifact`
    → All tools (npm, mvn, AWS CLI) can now access AWS as that role

🎯 Purpose:
Authenticate securely with AWS, using MFA only once,
and auto-renew assumed-role credentials every hour without needing MFA again.
*/
