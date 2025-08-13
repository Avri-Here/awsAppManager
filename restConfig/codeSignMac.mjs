


import { join } from 'path';
import { execSync } from 'child_process';

export default async function codeSign(context) {
    console.log('macOS Code Signing Hook - Starting...');
    
    const { electronPlatformName, appOutDir } = context;
    
    if (electronPlatformName !== 'darwin') {
        console.log('Not macOS, skipping code signing');
        return;
    }
    
    try {
        const appPath = join(appOutDir, `${context.packager.appInfo.productFilename}.app`);
        
        console.log(`App path: ${appPath}`);
        
        try {
            const identities = execSync('security find-identity -v -p codesigning', { encoding: 'utf8' });
            console.log('Available code signing identities:');
            console.log(identities);
            
            if (identities.includes('0 valid identities found')) {
                console.log('⚠️  No code signing certificates found. App will not be notarized.');
                console.log('For distribution, you need:');
                console.log('1. Apple Developer Certificate');
                console.log('2. App-specific password for notarization');
                return;
            }
            
            console.log('✅ Code signing certificates found');
            
        } catch (error) {
            console.log('⚠️  Could not check code signing certificates:', error.message);
        }
        
        console.log('✅ macOS Code Signing Hook - Completed');
        
    } catch (error) {
        console.error('❌ Error in code signing hook:', error.message);
        console.log('Continuing build without code signing ...');
    }
} 