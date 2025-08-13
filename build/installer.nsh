; AWS App Manager Custom Installer Configuration
!include "nsDialogs.nsh"

; Variables for shortcut options
Var DesktopShortcut
Var StartMenuShortcut

; Custom page for shortcut selection
Page custom ShowShortcutOptions

; Function to show shortcut selection page
Function ShowShortcutOptions
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ; Page title
  ${NSD_CreateLabel} 0 0 100% 15u "Installation Options"
  Pop $1
  CreateFont $2 "Segoe UI" 12 700
  SendMessage $1 ${WM_SETFONT} $2 0

  ; Description
  ${NSD_CreateLabel} 0 20u 100% 12u "Choose which shortcuts to create:"
  Pop $1

  ; Desktop shortcut checkbox
  ${NSD_CreateCheckBox} 10u 40u 100% 12u "Create Desktop Shortcut"
  Pop $DesktopShortcut
  ${NSD_SetState} $DesktopShortcut 0

  ; Start menu shortcut checkbox  
  ${NSD_CreateCheckBox} 10u 60u 100% 12u "Add to Start Menu"
  Pop $StartMenuShortcut
  ${NSD_SetState} $StartMenuShortcut 1

  nsDialogs::Show
FunctionEnd

; Function to create shortcuts based on user selection
Function CreateCustomShortcuts
  ; Check desktop shortcut option
  ${NSD_GetState} $DesktopShortcut $0
  ${If} $0 == 1
    CreateShortCut "$DESKTOP\AWS App Manager.lnk" "$INSTDIR\awsAppManager.exe"
  ${EndIf}

  ; Check start menu shortcut option
  ${NSD_GetState} $StartMenuShortcut $0
  ${If} $0 == 1
    CreateDirectory "$SMPROGRAMS\AWS App Manager"
    CreateShortCut "$SMPROGRAMS\AWS App Manager\AWS App Manager.lnk" "$INSTDIR\awsAppManager.exe"
    CreateShortCut "$SMPROGRAMS\AWS App Manager\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  ${EndIf}
FunctionEnd

; Main installation section
Section "MainSection" SEC01
  Call CreateCustomShortcuts
SectionEnd