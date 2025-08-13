




import { ipcRenderer } from "electron";
import { createRoot } from "react-dom/client";
import { useState, useRef, useEffect, memo, useMemo } from "react";
import { CheckmarkCircleRegular, BoxRegular } from "@fluentui/react-icons";
import { DialogSurface, createDarkTheme } from "@fluentui/react-components";
import { PlayRegular, StopRegular, CloudRegular } from "@fluentui/react-icons";
import { FluentProvider, webLightTheme, Label } from "@fluentui/react-components";
import { Text, makeStyles, Tooltip, Dialog, DialogBody } from "@fluentui/react-components";
import { DialogContent, Field, Input, Dropdown, Option, } from "@fluentui/react-components";
import { WeatherMoonRegular, SubtractRegular, DocumentRegular } from "@fluentui/react-icons";
import { ErrorCircleRegular, SettingsRegular, WeatherSunnyRegular } from "@fluentui/react-icons";







const playAudioFile = async (type) => {

    try {
        const fileName = type === 'success' ? 'llveNotification' : 'xpErrorHere';
        const audioModule = await import(`../assets/audio/${fileName}.mp3`);
        const audio = new Audio(audioModule.default);
        audio.volume = 0.9;
        await audio.play();

    } catch (error) {
        console.error(`Failed to Play audio !`, error + ' ...');
    }
};


const getSettingsFromStorage = () => {

    const xmlUpdate = localStorage.getItem('enableXmlUpdate');
    const npmUpdate = localStorage.getItem('enableNpmUpdate');
    const soundEnabled = localStorage.getItem('enableSound');

    return {
        username: localStorage.getItem('username'),
        mfaSecret: localStorage.getItem('mfaSecret'),
        enableXmlUpdate: xmlUpdate ? xmlUpdate === 'true' : false,
        enableNpmUpdate: npmUpdate ? npmUpdate === 'true' : false,
        enableSound: soundEnabled ? soundEnabled === 'true' : true,
    };
};


const shouldUseDarkColors = () =>

    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const useTheme = () => {

    const mediaQuery = useMemo(() => window.matchMedia("(prefers-color-scheme: dark)"), []);
    const [manualThemeOverride, setManualThemeOverride] = useState(null);
    const [theme, setTheme] = useState(getTheme());
    const isDarkMode = manualThemeOverride !== null ? manualThemeOverride : shouldUseDarkColors();

    const toggleTheme = () => {
        const newIsDark = manualThemeOverride !== null ? !manualThemeOverride : !shouldUseDarkColors();
        setManualThemeOverride(newIsDark);
        setTheme(getTheme(newIsDark));
    };

    useEffect(() => {
        if (manualThemeOverride === null) {
            const handleThemeChange = () => setTheme(getTheme());

            mediaQuery.addEventListener('change', handleThemeChange);

            if (ipcRenderer) {
                ipcRenderer.on("nativeThemeChanged", handleThemeChange);
            }

            return () => {
                mediaQuery.removeEventListener('change', handleThemeChange);
                if (ipcRenderer) {
                    ipcRenderer.removeAllListeners("nativeThemeChanged");
                }
            };
        }
    }, [manualThemeOverride]);

    return { theme, isDarkMode, toggleTheme };
};

const getTheme = (isDarkMode) => {

    const modernDarkTheme = {
        ...createDarkTheme({
            10: "#0c1c2c",
            20: "#142d42",
            30: "#1e3f5a",
            40: "#2a5073",
            50: "#37628c",
            60: "#4675a6",
            70: "#5689c0",
            80: "#689edb",
            90: "#7cb3f6",
            100: "#92c9ff",
            110: "#a9dfff",
            120: "#c1f5ff",
            130: "#daffff",
            140: "#f4ffff",
            150: "#ffffff",
            160: "#ffffff"
        }),
        colorBrandBackground: "#0078d4",
        colorBrandBackgroundHover: "#106ebe",
        colorBrandBackgroundPressed: "#005a9e",
        colorNeutralBackground1: "#1e1e1e",
        colorNeutralBackground2: "#252526",
        colorNeutralBackground3: "#2d2d30",
        colorNeutralForeground1: "#ffffff",
        colorNeutralForeground2: "#cccccc",
        colorNeutralForeground3: "#969696",
        colorNeutralStroke1: "#3c3c3c",
        colorNeutralStroke2: "#484848",
    };


    if (isDarkMode !== undefined) {
        return isDarkMode ? modernDarkTheme : webLightTheme;
    }
    return shouldUseDarkColors() ? modernDarkTheme : webLightTheme;
};

const Header = memo(({ styles, themeStyles }) => {
    return (
        <div className={`${styles.header} draggable`} style={themeStyles.header}>
            <div className="header-content-center">
                <div className={styles.headerLogo} style={themeStyles.text}>
                    <span>Aws Credential Manager</span>
                </div>
            </div>
        </div>
    );
});

Header.displayName = 'Header';

const MainContent = memo(({ styles, themeStyles, isRunning, isDarkMode }) => {
    const statusDotClass = useMemo(() => {
        return isRunning ? styles.statusDotRunning : styles.statusDotReady;
    }, [isRunning, styles.statusDotRunning, styles.statusDotReady]);

    // פונקציה להפקת מיקום אקראי בטווח הבטוח
    const getRandomPosition = () => {
        const minTop = 12;
        const maxTop = 78;
        const minLeft = 6;
        const maxLeft = 85;
        
        return {
            top: Math.random() * (maxTop - minTop) + minTop,
            left: Math.random() * (maxLeft - minLeft) + minLeft
        };
    };

    // אפקט פיצוץ עדין בסגנון Bubble Pop
    const handleExplodeEffect = (orbElement) => {
        // שלב 1: הכנה לפיצוץ - Juicy Squeeze
        orbElement.classList.add('pre-explode');
        
        setTimeout(() => {
            orbElement.classList.remove('pre-explode');
            
            // שלב 2: פיצוץ עדין עם חלקיקים כחולים
            orbElement.classList.add('mega-exploding');
            
            // יצירת חלקיקי פיצוץ עדינים
            createExplosionParticles(orbElement);
            
            setTimeout(() => {
                // שלב 3: ניקוי והתחדשות
                orbElement.style.opacity = '0';
                orbElement.classList.remove('mega-exploding');
                
                setTimeout(() => {
                    // שלב 4: מיקום חדש ואפקט התחדשות עדין
                    const newPosition = getRandomPosition();
                    orbElement.style.top = `${newPosition.top}%`;
                    orbElement.style.left = `${newPosition.left}%`;
                    orbElement.style.opacity = '1';
                    orbElement.classList.add('epic-regenerating');
                    
                    setTimeout(() => {
                        orbElement.classList.remove('epic-regenerating');
                    }, 700);
                }, 150);
            }, 600);
        }, 120);
    };

    // פונקציה לקבלת מספר אקראי בין min ל-max
    const rand = (min, max) => {
        return Math.floor(Math.random() * (max + 1)) + min;
    };

    // יצירת אפקט פיצוץ חלק כמו בקוד המקורי
    const createExplosionParticles = (orbElement) => {
        const rect = orbElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const particles = 15;
        
        // יצירת מכולה לפיצוץ
        const explosion = document.createElement('div');
        explosion.className = 'orb-explosion';
        
        // מיקום המכולה במרכז הכדור
        explosion.style.left = `${centerX - 300}px`; // מחצית מ-600px
        explosion.style.top = `${centerY - 300}px`;
        
        document.body.appendChild(explosion);
        
        for (let i = 0; i < particles; i++) {
            // חישוב מיקום החלקיק על מעגל עם רדיוס מעט אקראי - בדיוק כמו בקוד המקורי
            const x = explosion.offsetWidth / 2 + 
                     rand(80, 150) * Math.cos((2 * Math.PI * i) / rand(particles - 10, particles + 10));
            const y = explosion.offsetHeight / 2 + 
                     rand(80, 150) * Math.sin((2 * Math.PI * i) / rand(particles - 10, particles + 10));
            
            // צבעים כחולים תכלת אקראיים פשוטים
            const r = rand(0, 100);
            const g = rand(150, 255);
            const b = 255;
            const color = `rgb(${r}, ${g}, ${b})`;
            
            // יצירת חלקיק פשוט
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.backgroundColor = color;
            particle.style.top = `${y}px`;
            particle.style.left = `${x}px`;
            
            if (i === 0) {
                // הסרת המכולה כשהאנימציה מסתיימת - בדיוק כמו בקוד המקורי
                particle.addEventListener('animationend', () => {
                    if (explosion.parentNode) {
                        explosion.parentNode.removeChild(explosion);
                    }
                });
            }
            
            explosion.appendChild(particle);
        }
    };

    // טיפול בלחיצה על כדור
    const handleOrbClick = (event) => {
        event.stopPropagation();
        const orbElement = event.currentTarget;
        
        // בדיקה שהכדור לא כבר באמצע אפקט
        if (orbElement.classList.contains('pre-explode') ||
            orbElement.classList.contains('mega-exploding') || 
            orbElement.classList.contains('epic-regenerating')) {
            return;
        }

        handleExplodeEffect(orbElement);
    };

    return (
        <div className={styles.mainContent} style={themeStyles.mainContent}>
            <div className={`glassmorphism-background ${isRunning ? 'running active' : 'ready active'}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(num => (
                    <div 
                        key={num}
                        className={`glass-orb glass-orb-${num}`}
                        onClick={handleOrbClick}
                        title="לחץ לפיצוץ חלק! 💙"
                    />
                ))}
            </div>

            <div className="main-status-container">
                {/* <CloudRegular className="cloud-icon-large" /> */}
                <div className="status-indicator-row">
                    <div className={statusDotClass} />
                    <Text size={300} style={{
                        fontWeight: '700',
                        color: isDarkMode ? "#ffffff" : "#323130",
                        fontSize: '18px'
                    }}>
                        {isRunning ? 'Running' : 'Ready'}
                    </Text>
                    <div className={statusDotClass} />
                </div>
            </div>

        </div>
    );
});

MainContent.displayName = 'MainContent';

const useStyles = makeStyles({

    container: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
        overflow: "hidden",
    },

    header: {
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        zIndex: 100,
        position: "relative",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid transparent",
    },



    headerLogo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: "600",
        padding: "8px 12px",
        borderRadius: "6px",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
    },





    mainContent: {
        display: "flex",
        flexGrow: 1,
        minHeight: 0,
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
    },

    statusBar: {
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 25px",
        borderTop: "1px solid transparent",
        backdropFilter: "blur(10px)",
        position: "relative",
    },

    statusLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },



    statusDotReady: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#107c10",
        animation: "pulse 2s infinite",
    },

    statusDotRunning: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#0078d4",
        animation: "pulse 1s infinite",
    },

    statusRight: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },



    iconButton: {
        width: "32px",
        height: "32px",
        borderRadius: "4px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            transform: "none",
        },
        "&:active": {
            transform: "scale(0.95)",
        },
    },

    dialogSurface: {
        height: "220px",
        width: "300px",
        borderRadius: "8px",
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
        border: "1px solid transparent",
    },

    dialogContent: {
    },

    formField: {
        marginBottom: "6px",
    },

    formInput: {
        fontSize: "11px",
        fontWeight: "500",
        height: "24px",
        borderRadius: "4px",
        border: "1px solid transparent",
        transition: "all 0.15s ease",
        "&:focus": {
            boxShadow: "0 0 0 2px rgba(0, 120, 212, 0.3)",
        },
    },

    formLabel: {
        fontSize: "10px",
        fontWeight: "600",
        marginBottom: "2px",
        display: "block",
    },
});






const AwsCredentialManager = () => {

    const styles = useStyles();
    const { theme, isDarkMode, toggleTheme } = useTheme();

    const mfaIntervalRef = useRef(null);
    const processRef = useRef({ abort: null, autoRenewal: null });


    const [settings, setSettings] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [accountList, setAccountList] = useState([]);
    const [isStarting, setIsStarting] = useState(false);
    const [localUsername, setLocalUsername] = useState('');
    const [localMfaSecret, setLocalMfaSecret] = useState('');
    const [canGenerateMfa, setCanGenerateMfa] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [mfaTimeRemaining, setMfaTimeRemaining] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState({ name: '', accountId: '' });


    useEffect(() => {

        const handleLogOnWebConsole = (_, msg) => {
            console.log("From node :", msg);
        };

        ipcRenderer.on("logOnWebConsole", handleLogOnWebConsole);

        const loadAccounts = async () => {

            const accounts = await ipcRenderer.invoke("loadAccountList");
            setAccountList(accounts);
            setSelectedAccount(accounts[0]);
        };

        loadAccounts();

        const loadedSettings = getSettingsFromStorage();
        setSettings(loadedSettings);

        console.log("Loaded settings from storage : ", loadedSettings);

        setLocalUsername(loadedSettings.username || '');
        setLocalMfaSecret(loadedSettings.mfaSecret || '');

        return () => {
            ipcRenderer.removeListener("logOnWebConsole", handleLogOnWebConsole);
        };

    }, []);

    useEffect(() => {

        // Cleanup any running processes when the component unmounts form any reason ..
        return () => {

            if (processRef.current.abort) {
                processRef.current.abort.abort();
            }

            if (processRef.current.autoRenewal) {
                clearTimeout(processRef.current.autoRenewal);
            }

            if (mfaIntervalRef.current) {
                clearInterval(mfaIntervalRef.current);
            }
        };
    }, []);


    const startMfaCooldown = () => {

        const currentTime = Date.now();
        setCanGenerateMfa(false);
        setMfaTimeRemaining(30);

        mfaIntervalRef.current = setInterval(() => {

            const timeSince = Math.floor((Date.now() - currentTime) / 1000);
            const canGenerate = timeSince >= 30;
            const timeRemaining = canGenerate ? 0 : 30 - timeSince;

            setMfaTimeRemaining(timeRemaining);

            if (canGenerate) {
                setCanGenerateMfa(true);
                setMfaTimeRemaining(0);
                clearInterval(mfaIntervalRef.current);
                mfaIntervalRef.current = null;
            }
        }, 1000);
    };

    const themeStyles = useMemo(() => ({


        container: {
            background: isDarkMode ?
                "linear-gradient(to bottom, #1a2332 0%, #253448 25%, #2f3f50 50%, #1f2937 75%, #0f1a2a 100%)" :
                "linear-gradient(to bottom, #f0f4f8 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)",
            color: isDarkMode ? "#ffffff" : "#000000",
        },
        header: {
            // backgroundColor: isDarkMode ? "rgba(37, 37, 38, 0.95)" : "rgba(248, 248, 248, 0.95)",
            // borderBottomColor: isDarkMode ? "#3c3c3c" : "#e1dfdd",
            // boxShadow: isDarkMode ? "0 1px 3px rgba(0, 0, 0, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)",

        },
        mainContent: {
            backgroundColor: "transparent",
        },
        statusBar: {
            // backgroundColor: isDarkMode ? "rgba(37, 37, 38, 0.95)" : "rgba(248, 248, 248, 0.95)",
            // borderTopColor: isDarkMode ? "#3c3c3c" : "#e1dfdd",
            // boxShadow: isDarkMode ? "0 -1px 3px rgba(0, 0, 0, 0.3)" : "0 -1px 3px rgba(0, 0, 0, 0.1)",
        },
        iconButton: {
            color: isDarkMode ? "#ffffff" : "#323130",
            "&:hover": {
                backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
            },
        },
        text: {
            color: isDarkMode ? "#ffffff" : "#323130",
            backgroundColor: "transparent",
        },
    }), [isDarkMode]);


    const scheduleAutoRenewal = () => {

        if (processRef.current.autoRenewal) {
            clearTimeout(processRef.current.autoRenewal);
        };

        console.log("Autorenewal credentials scheduled in 58 minutes from now ...");

        processRef.current.autoRenewal = setTimeout(() => {

            console.log("Auto-renewal triggered after 58 minutes - restarting credential process ...");
            handleStartFlow();

        }, 58 * 60 * 1000);

    };

    const handleStartFlow = async () => {

        const abortController = new AbortController();
        processRef.current.abort = abortController;

        try {

            setIsStarting(true);

            ipcRenderer.send("setProgressBarWin", 1.1, 'indeterminate');
            const mfaCode = await ipcRenderer.invoke("getMfaCodeValidation", settings.mfaSecret);
            console.log(`Got MFA code for user ${settings.username} using his shared secret ..`);


            if (abortController.signal.aborted) return;

            const mfaCredentials = await ipcRenderer.invoke("getSessionTokenWithMFA", mfaCode, settings.username);
            console.log("Received MFA session credentials under existing profile : nice-identity-mfa-session ..");

            if (abortController.signal.aborted) return;

            await ipcRenderer.invoke("updateCredentialsFile", "nice-identity-mfa-session", mfaCredentials);
            console.log("Stored temporary MFA token on aws credentials file under profile : nice-identity-mfa-session ..");
            console.log("Continuing now with assuming role to default account ..");
            startMfaCooldown();


            if (abortController.signal.aborted) return;

            const { accountId } = selectedAccount;
            const roleResponse = await ipcRenderer.invoke("assumeRole", accountId, false, settings.username);
            await ipcRenderer.invoke("updateCredentialsFile", "default", roleResponse);
            console.log("Updated credentials file under profile: default ...");



            const needsCodeArtifact = settings.enableXmlUpdate || settings.enableNpmUpdate;
            if (needsCodeArtifact) {

                if (abortController.signal.aborted) return;

                const codeArtifactCredentials = await ipcRenderer.invoke("assumeRole", null, true, settings.username);
                console.log("Assumed CodeArtifact role and received temporary AWS credentials ..");


                if (abortController.signal.aborted) return;

                await ipcRenderer.invoke("updateCredentialsFile", "default-codeartifact", codeArtifactCredentials);
                console.log("Stored AWS credentials under profile : default-codeartifact ..");


                if (abortController.signal.aborted) return;

                const codeArtifactResult = await ipcRenderer.invoke("updateCodeArtifactToken", codeArtifactCredentials);
                console.log("Received CodeArtifact authorization token for registry authentication ..");


                if (settings.enableXmlUpdate) {

                    if (abortController.signal.aborted) return;
                    await ipcRenderer.invoke("updateXmlConfiguration", codeArtifactResult.authToken);
                    console.log("Updated Maven settings.xml with CodeArtifact token ..");

                }


                if (settings.enableNpmUpdate) {

                    if (abortController.signal.aborted) return;
                    await ipcRenderer.invoke("updateNpmConfiguration", codeArtifactResult.authToken);
                    console.log("Updated npm config ( .npmrc file ) with CodeArtifact token ..");
                }
            };

            if (abortController.signal.aborted) return;

            console.log("Credential process finished successfully !");

            if (settings.enableSound) {

                playAudioFile('success');
                scheduleAutoRenewal();
                setIsRunning(true);
                return;

            };


            const notificationObj = {
                iconType: "info", sound: false, timeout: 5000,
                title: "✅ Credentials Updated Successfully !",
                message: "All done ! Credentials are ready to use !",
            };

            await ipcRenderer.invoke("trayNotification", notificationObj);

            scheduleAutoRenewal();
            setIsRunning(true);

        } catch (error) {

            console.log(`Error on flow of credential process : ${error} ..`);

            if (settings.enableSound) {
                playAudioFile('error');
                return;
            };

            const notificationObj = {
                title: "An error occurred ..",
                iconType: "error", sound: false, timeout: 5000,
                message: "Click on this message for more details..",
            };

            const resEvent = await ipcRenderer.invoke("trayNotification", notificationObj);

            if (resEvent === 'balloonClick') ipcRenderer.send("openDevTools");

        } finally {

            if (processRef.current.abort === abortController) {
                processRef.current.abort = null;
            };

            setIsStarting(false);
            ipcRenderer.send("setProgressBarWin", -1);
        }
    };


    const handleStopFlow = async () => {

        if (!isRunning) return;

        console.log("Trying to stop credential process via abort controller ...");

        if (processRef.current.abort) {
            processRef.current.abort.abort();
            processRef.current.abort = null;
        };

        if (processRef.current.autoRenewal) {
            clearTimeout(processRef.current.autoRenewal);
            processRef.current.autoRenewal = null;
        };

        setIsRunning(false);
        setIsStarting(false);
    };

    const toggleXmlUpdate = async () => {

        const newValue = !settings.enableXmlUpdate;
        const updatedSettings = { ...settings, enableXmlUpdate: newValue };
        localStorage.setItem('enableXmlUpdate', newValue);
        setSettings(updatedSettings);
        console.log(`XML update ${newValue ? 'enabled' : 'disabled'}`);
    };

    const toggleNpmUpdate = async () => {

        const newValue = !settings.enableNpmUpdate;
        const updatedSettings = { ...settings, enableNpmUpdate: newValue };
        localStorage.setItem('enableNpmUpdate', newValue);
        setSettings(updatedSettings);
        console.log(`NPM update ${newValue ? 'enabled' : 'disabled'}`);

        const isNpmUpdateNowDisabled = !newValue;

        if (isNpmUpdateNowDisabled) {

            await ipcRenderer.invoke("removeNpmConfigFile");
        }
    };

    const toggleSoundNotifications = async () => {

        const newValue = !settings.enableSound;
        const updatedSettings = { ...settings, enableSound: newValue };
        localStorage.setItem('enableSound', newValue);
        setSettings(updatedSettings);
        console.log(`Sound notifications ${newValue ? 'enabled !' : 'muted !'}`);
    };

    const saveSettings = async () => {

        try {
            const updatedSettings = {
                ...settings,
                username: localUsername,
                mfaSecret: localMfaSecret
            };
            localStorage.setItem('username', localUsername);
            localStorage.setItem('mfaSecret', localMfaSecret);
            setSettings(updatedSettings);
            console.log('Settings saved successfully');
        } catch (error) {
            console.log(`Error saving settings: ${error}`);
        }
    };

    const handleSettingsClose = async () => {

        const isSettingsChanged = localUsername !== settings.username || localMfaSecret !== settings.mfaSecret;
        if (isSettingsChanged) await saveSettings();

        setIsSettingsOpen(false);
    };

    const isActive = isRunning || isStarting;
    const hasSettings = settings.username && settings.mfaSecret;
    const isDisabled = !hasSettings || !canGenerateMfa;

    const getButtonTooltip = () => {
        if (isActive) return "Stop";
        if (!hasSettings) return "Configure Settings required!";
        if (!canGenerateMfa) return `${mfaTimeRemaining} Sec to generate new code`;
        return "Start";
    };

    const getButtonStyle = () => {
        if (isActive) return { bg: "#d13438", border: "#d13438", color: "#ffffff" };
        if (isDisabled) return {
            bg: isDarkMode ? "rgba(60, 60, 60, 0.5)" : "rgba(243, 242, 241, 0.5)",
            border: isDarkMode ? "#3c3c3c" : "#d1d1d1",
            color: isDarkMode ? "#666666" : "#a19f9d"
        };
        return { bg: "#0078d4", border: "#0078d4", color: "#ffffff" };
    };

    return (
        <FluentProvider
            theme={theme}
            style={{
                height: "100vh",
                width: "100vw",
                background: "transparent",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"
            }}
        >
            <div className={styles.container} style={themeStyles.container}>
                <Header styles={styles} themeStyles={themeStyles} />

                <MainContent
                    styles={styles}
                    themeStyles={themeStyles}
                    isRunning={isRunning}
                    isDarkMode={isDarkMode}
                />

                <div className={`${styles.statusBar} status-bar-container`} style={themeStyles.statusBar}>
                    <div className={styles.statusLeft}>
                        <div className="dropdown-container">

                            <Dropdown
                                value={selectedAccount.name}
                                selectedOptions={[selectedAccount.name]}
                                onOptionSelect={(_, { optionValue }) => {

                                    if (optionValue) {

                                        const account = accountList.find(acc => acc.name === optionValue);
                                        setSelectedAccount(account);
                                    }
                                }}
                                disabled={isRunning || isStarting}
                                className="no-drag"
                                style={{
                                    height: "32px",
                                    minWidth: "140px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    borderRadius: "4px",
                                    backgroundColor: isDarkMode ? "rgba(45, 45, 48, 0.6)" : "rgba(255, 255, 255, 0.8)",
                                    border: `1px solid ${isDarkMode ? "#3c3c3c" : "#d1d1d1"}`,
                                    color: isDarkMode ? "#ffffff" : "#323130",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {accountList.map((account) => (
                                    <Option key={account.name} value={account.name} text={account.name}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CloudRegular style={{ fontSize: '12px', color: '#0078d4' }} />
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '12px' }}>{account.name}</div>
                                                <div style={{ fontSize: '10px', color: '#969696' }}>{account.accountId}</div>
                                            </div>
                                        </div>
                                    </Option>
                                ))}
                            </Dropdown>

                            <Tooltip
                                withArrow
                                positioning="above"
                                content={getButtonTooltip()}
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={{
                                        ...themeStyles.iconButton,
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: getButtonStyle().bg,
                                        color: getButtonStyle().color,
                                        border: `1px solid ${getButtonStyle().border}`,
                                        cursor: isDisabled && !isActive ? "wait" : "pointer",
                                    }}
                                    onClick={isActive ? handleStopFlow : handleStartFlow}
                                    disabled={isDisabled && !isActive}
                                >
                                    {isActive ?
                                        <StopRegular style={{ fontSize: '14px' }} /> :
                                        <PlayRegular style={{ fontSize: '14px' }} />
                                    }
                                </button>
                            </Tooltip>

                            <Tooltip
                                withArrow
                                positioning="above"
                                content={`XML: ${settings.enableXmlUpdate ? 'Enabled' : 'Disabled'} `}
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={{
                                        ...themeStyles.iconButton,
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: settings.enableXmlUpdate ?
                                            "#107c10" :
                                            (isDarkMode ? "rgba(60, 60, 60, 0.6)" : "rgba(243, 242, 241, 0.6)"),
                                        color: settings.enableXmlUpdate ?
                                            "#ffffff" :
                                            (isDarkMode ? "#969696" : "#8a8886"),
                                        border: settings.enableXmlUpdate ?
                                            "1px solid #107c10" :
                                            `1px solid ${isDarkMode ? "#3c3c3c" : "#d1d1d1"}`,
                                        opacity: settings.enableXmlUpdate ? 1 : 0.7,
                                    }}
                                    onClick={toggleXmlUpdate}
                                >
                                    <DocumentRegular style={{ fontSize: '14px' }} />
                                </button>
                            </Tooltip>

                            <Tooltip
                                withArrow
                                positioning="above"
                                content={`NPM: ${settings.enableNpmUpdate ? 'Enabled' : 'Disabled'} `}
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={{
                                        ...themeStyles.iconButton,
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: settings.enableNpmUpdate ?
                                            "#107c10" :
                                            (isDarkMode ? "rgba(60, 60, 60, 0.6)" : "rgba(243, 242, 241, 0.6)"),
                                        color: settings.enableNpmUpdate ?
                                            "#ffffff" :
                                            (isDarkMode ? "#969696" : "#8a8886"),
                                        border: settings.enableNpmUpdate ?
                                            "1px solid #107c10" :
                                            `1px solid ${isDarkMode ? "#3c3c3c" : "#d1d1d1"}`,
                                        opacity: settings.enableNpmUpdate ? 1 : 0.7,
                                    }}
                                    onClick={toggleNpmUpdate}
                                >
                                    <BoxRegular style={{ fontSize: '14px' }} />
                                </button>
                            </Tooltip>

                            <Tooltip
                                withArrow
                                positioning="above"
                                content={`Sound: ${settings.enableSound ? 'Enabled' : 'Muted'}`}
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={{
                                        ...themeStyles.iconButton,
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: settings.enableSound ?
                                            "#107c10" :
                                            (isDarkMode ? "rgba(60, 60, 60, 0.6)" : "rgba(243, 242, 241, 0.6)"),
                                        color: settings.enableSound ?
                                            "#ffffff" :
                                            (isDarkMode ? "#969696" : "#8a8886"),
                                        border: settings.enableSound ?
                                            "1px solid #107c10" :
                                            `1px solid ${isDarkMode ? "#3c3c3c" : "#d1d1d1"}`,
                                        opacity: settings.enableSound ? 1 : 0.7,
                                    }}
                                    onClick={toggleSoundNotifications}
                                >
                                    {settings.enableSound ?
                                        <CheckmarkCircleRegular style={{ fontSize: '14px' }} /> :
                                        <ErrorCircleRegular style={{ fontSize: '14px' }} />
                                    }
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className={styles.statusRight}>
                        <div className="settings-controls-row">
                            <Tooltip
                                withArrow
                                positioning="above"
                                content="Hide to system tray .."
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={themeStyles.iconButton}
                                    onClick={() => ipcRenderer.send("minimizeWindow")}
                                >
                                    <SubtractRegular style={{ fontSize: '16px' }} />
                                </button>
                            </Tooltip>
                            <Tooltip
                                withArrow
                                positioning="above"
                                content={`${isDarkMode ? 'light' : 'dark'}`}
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={themeStyles.iconButton}
                                    onClick={toggleTheme}
                                >
                                    {isDarkMode ? <WeatherSunnyRegular style={{ fontSize: '16px' }} /> : <WeatherMoonRegular style={{ fontSize: '16px' }} />}
                                </button>
                            </Tooltip>
                            <Tooltip
                                withArrow
                                positioning="above"
                                content={hasSettings ? "Settings" : "Settings (Required)"}
                                relationship="label"
                            >
                                <button
                                    className={`${styles.iconButton} no-drag`}
                                    style={{
                                        ...themeStyles.iconButton,
                                        backgroundColor: hasSettings ? "transparent" :
                                            (isDarkMode ? "rgba(255, 140, 0, 0.2)" : "rgba(255, 140, 0, 0.1)")
                                    }}
                                    onClick={() => setIsSettingsOpen(true)}
                                >
                                    <SettingsRegular style={{
                                        fontSize: '16px',
                                        color: hasSettings ? "inherit" : "#ff8c00"
                                    }} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <Dialog open={isSettingsOpen} onOpenChange={(_, data) => {

                    if (!data.open) {
                        handleSettingsClose();
                        return;
                    };

                    setIsSettingsOpen(true);
                }}>
                    <DialogSurface className={styles.dialogSurface} style={{
                        backgroundColor: isDarkMode
                            ? "rgba(45, 45, 48, 0.95)"
                            : "rgba(255, 255, 255, 0.95)",
                        color: isDarkMode ? "#ffffff" : "#323130",
                        borderColor: isDarkMode ? "#3c3c3c" : "#e1dfdd",
                        width: "450px",
                        height: "260px",
                        padding: "20px",
                        borderRadius: "12px",
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                        boxShadow: isDarkMode
                            ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
                            : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)",
                    }}>
                        <DialogBody className={styles.dialogContent} style={{
                            padding: '0',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        }}>
                            <h4 style={{
                                margin: '0 0 20px 0',
                                textAlign: 'center',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: isDarkMode ? "#ffffff" : "#323130",
                                letterSpacing: '0.01em',
                            }}>App Settings</h4>
                            <DialogContent style={{
                                padding: '0',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                            }}>
                                <Field className={styles.formField} style={{ marginBottom: '0' }}>
                                    <Label className={styles.formLabel} style={{
                                        color: isDarkMode ? "#ffffff" : "#323130",
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        marginBottom: '6px',
                                        display: 'block',
                                    }}>Username</Label>
                                    <Input
                                        className={styles.formInput}
                                        value={localUsername}
                                        onChange={(_, data) => setLocalUsername(data.value)}
                                        placeholder="Enter your username"
                                        required
                                        style={{
                                            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                                            border: `1px solid ${isDarkMode ? '#3c3c3c' : '#d1d1d1'}`,
                                            color: isDarkMode ? '#ffffff' : '#323130',
                                            width: "100%",
                                            fontSize: "12px",
                                            borderRadius: "6px",
                                            transition: "0.2s",
                                        }}
                                    />
                                </Field>
                                <Field className={styles.formField} style={{ marginBottom: '0' }}>
                                    <Label className={styles.formLabel} style={{
                                        color: isDarkMode ? "#ffffff" : "#323130",
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        marginBottom: '6px',
                                        display: 'block',
                                    }}>MFA Secret</Label>
                                    <Input
                                        className={styles.formInput}
                                        value={localMfaSecret}
                                        onChange={(_, data) => setLocalMfaSecret(data.value)}
                                        placeholder="Enter your MFA secret key"
                                        required
                                        style={{
                                            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                                            border: `1px solid ${isDarkMode ? '#3c3c3c' : '#d1d1d1'}`,
                                            color: isDarkMode ? '#ffffff' : '#323130',
                                            fontFamily: "Consolas, 'Courier New', monospace",
                                            width: "100%",
                                            fontSize: "12px",
                                            borderRadius: "6px",
                                            transition: "0.2s",
                                            letterSpacing: "0.5px",
                                        }}
                                    />
                                </Field>
                                <div style={{
                                    fontSize: '11px',
                                    color: isDarkMode ? "#969696" : "#8a8886",
                                    textAlign: 'center',
                                    marginTop: 'auto',
                                    fontStyle: 'italic',
                                    padding: '10px 0 0 0',
                                    borderTop: `1px solid ${isDarkMode ? '#3c3c3c' : '#e1dfdd'}`,
                                }}>
                                    ✓  Settings are saved automatically ✓
                                </div>
                            </DialogContent>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            </div>
        </FluentProvider>
    );
};















document.addEventListener("DOMContentLoaded", () => {
    createRoot(document.getElementById("react-app")).render(
        <AwsCredentialManager />
    );
}); 