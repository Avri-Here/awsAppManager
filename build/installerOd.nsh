!include "nsDialogs.nsh"
!include "winmessages.nsh"

; Modern Windows 11 installer customization
!define MUI_CUSTOMFUNCTION_GUIINIT myGUIInit

; Custom installer pages for modern experience
Page custom ShowWelcomePage
Page custom ShowOptionsPage
Page custom ShowProgressPage

; Variables for custom UI
Var WelcomeText
Var OptionsText
Var ShortcutChecked
Var StartMenuChecked
Var AutoStartChecked
Var ProgressBar

; Modern Welcome Page
Function ShowWelcomePage
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ; Welcome title with Windows 11 styling
  ${NSD_CreateLabel} 10% 5% 80% 15u "Welcome to AWS App Manager Setup"
  Pop $0
  CreateFont $1 "Segoe UI" 16 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; Description text
  ${NSD_CreateLabel} 10% 25% 80% 30u "This setup will install AWS App Manager on your computer.$\r$\n$\r$\nAWS App Manager helps you manage your AWS applications efficiently with a modern, intuitive interface designed for Windows 11."
  Pop $WelcomeText
  CreateFont $2 "Segoe UI" 9 400
  SendMessage $WelcomeText ${WM_SETFONT} $2 0

  ; Continue instruction
  ${NSD_CreateLabel} 10% 70% 80% 12u "Click Next to continue with the installation."
  Pop $0
  SendMessage $0 ${WM_SETFONT} $2 0

  nsDialogs::Show
FunctionEnd

; Modern Options Page
Function ShowOptionsPage
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ; Page title
  ${NSD_CreateLabel} 10% 5% 80% 15u "Installation Options"
  Pop $0
  CreateFont $1 "Segoe UI" 14 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; Options description
  ${NSD_CreateLabel} 10% 20% 80% 12u "Choose your preferred installation options:"
  Pop $0
  CreateFont $2 "Segoe UI" 9 400
  SendMessage $0 ${WM_SETFONT} $2 0

  ; Desktop shortcut option
  ${NSD_CreateCheckBox} 15% 35% 80% 12u "Create desktop shortcut"
  Pop $ShortcutChecked
  SendMessage $ShortcutChecked ${WM_SETFONT} $2 0
  ${NSD_SetState} $ShortcutChecked 1

  ; Start menu option
  ${NSD_CreateCheckBox} 15% 50% 80% 12u "Add to Start Menu"
  Pop $StartMenuChecked
  SendMessage $StartMenuChecked ${WM_SETFONT} $2 0
  ${NSD_SetState} $StartMenuChecked 1

  ; Auto-start option
  ${NSD_CreateCheckBox} 15% 65% 80% 12u "Launch AWS App Manager when Windows starts"
  Pop $AutoStartChecked
  SendMessage $AutoStartChecked ${WM_SETFONT} $2 0

  nsDialogs::Show
FunctionEnd

; Modern Progress Page (placeholder for future enhancements)
Function ShowProgressPage
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ; Installing title
  ${NSD_CreateLabel} 10% 30% 80% 15u "Installing AWS App Manager..."
  Pop $0
  CreateFont $1 "Segoe UI" 14 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; Status text
  ${NSD_CreateLabel} 10% 50% 80% 12u "Please wait while the application is being installed."
  Pop $0
  CreateFont $2 "Segoe UI" 9 400
  SendMessage $0 ${WM_SETFONT} $2 0

  nsDialogs::Show
FunctionEnd

; Apply user choices
Function InstallShortcuts
  ; Desktop shortcut
  ${NSD_GetState} $ShortcutChecked $0
  ${If} $0 == 1
    CreateShortCut "$DESKTOP\AWS App Manager.lnk" "$INSTDIR\awsAppManager.exe" "" "$INSTDIR\awsAppManager.exe" 0
  ${EndIf}

  ; Start menu shortcut
  ${NSD_GetState} $StartMenuChecked $0
  ${If} $0 == 1
    CreateDirectory "$SMPROGRAMS\AWS App Manager"
    CreateShortCut "$SMPROGRAMS\AWS App Manager\AWS App Manager.lnk" "$INSTDIR\awsAppManager.exe" "" "$INSTDIR\awsAppManager.exe" 0
    CreateShortCut "$SMPROGRAMS\AWS App Manager\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  ${EndIf}

  ; Auto-start registry entry
  ${NSD_GetState} $AutoStartChecked $0
  ${If} $0 == 1
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "AWSAppManager" "$INSTDIR\awsAppManager.exe"
  ${EndIf}
FunctionEnd

; Custom GUI initialization for Windows 11 styling
Function myGUIInit
  ; Set modern Windows 11 color scheme if possible
  System::Call 'user32::SetWindowLong(i $HWNDPARENT, i -20, i 0x00000001)' ; Enable dark mode hint
FunctionEnd

; Main installation section
Section "Main"
  Call InstallShortcuts
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove shortcuts
  Delete "$DESKTOP\AWS App Manager.lnk"
  Delete "$SMPROGRAMS\AWS App Manager\AWS App Manager.lnk"
  Delete "$SMPROGRAMS\AWS App Manager\Uninstall.lnk"
  RMDir "$SMPROGRAMS\AWS App Manager"
  
  ; Remove auto-start entry
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "AWSAppManager"
SectionEnd
