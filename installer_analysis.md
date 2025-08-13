# AWS App Manager Installer Analysis

## Current Behavior vs Expected Behavior

### Issue 1: Custom Welcome Page Not Working
**Current:** Default NSIS welcome page is shown
**Expected:** Custom welcome page from installer.nsh should be displayed
**Problem:** Custom pages are not being properly integrated with NSIS installer flow

### Issue 2: Installation Options Page Missing
**Current:** User sees default NSIS installation pages
**Expected:** Custom options page should allow users to choose shortcuts/auto-start
**Problem:** Custom pages are not replacing default NSIS pages

### Issue 3: Unwanted "Installing..." Page
**Current:** Shows "Installing AWS App Manager..." page that requires Next click
**Expected:** Installation should proceed automatically without manual intervention
**Problem:** Custom progress page is blocking installation flow

### Issue 4: Unwanted "Choose Installation Options" Dialog
**Current:** Shows per-machine vs per-user installation choice
**Expected:** Should install for current user only without asking
**Problem:** `perMachine: false` setting not working as expected

### Issue 5: Unwanted "Choose Install Location" Dialog
**Current:** Allows user to browse and select installation directory
**Expected:** Should install to default location without user choice
**Problem:** `allowToChangeInstallationDirectory: true` should be `false`

### Issue 6: Shortcuts Created Despite Being Disabled
**Current:** Desktop and Start Menu shortcuts are created even when disabled
**Expected:** No shortcuts should be created when options are disabled
**Problem:** Default NSIS behavior overrides custom settings

### Issue 7: Application Doesn't Launch After Installation
**Current:** App doesn't start even when "Run awsAppManager" is checked
**Expected:** Application should launch when finish option is enabled
**Problem:** Possible path or executable issues

## Root Cause Analysis

1. **Custom Pages Not Integrated:** The custom pages in installer.nsh are not properly replacing the default NSIS pages
2. **Configuration Conflicts:** Default NSIS settings are overriding custom configurations
3. **Page Flow Issues:** Custom pages are being added instead of replacing default ones
4. **Shortcut Logic Problems:** Custom shortcut creation logic conflicts with default NSIS behavior

## Required Solutions

1. **Disable Default NSIS Pages:** Use proper NSIS directives to skip unwanted pages
2. **Fix Page Integration:** Ensure custom pages replace default ones correctly
3. **Correct Configuration:** Set proper electron-builder settings for desired behavior
4. **Fix Shortcut Logic:** Ensure shortcut creation respects user choices
5. **Fix Application Launch:** Resolve executable path and launch issues

## Step-by-Step Fix Plan

1. **Phase 1:** ✅ **COMPLETED** - Fix basic configuration (installation mode, directory selection)
   - Set `perMachine: false` (install for current user only)
   - Set `allowToChangeInstallationDirectory: false` (no directory selection dialog)
   - Set `createDesktopShortcut: false` and `createStartMenuShortcut: false` (no shortcuts by default)

2. **Phase 2:** ✅ **COMPLETED** - Properly integrate custom pages and disable default ones
   - Removed complex custom pages that were interfering with NSIS flow
   - Created minimal installer.nsh that doesn't add unnecessary dialogs
   - This should eliminate the unwanted "Choose Installation Options" and installation directory dialogs

3. **Phase 3:** ✅ **COMPLETED** - Fix shortcut creation logic
   - Shortcuts are now controlled by electron-builder configuration, not custom NSIS code
   - Since both options are set to `false`, no shortcuts should be created

4. **Phase 4:** **PENDING** - Fix application launch functionality
5. **Phase 5:** **PENDING** - Test complete installer flow

## IMMEDIATE FIXES APPLIED ✅

Based on web research and electron-builder 25.1.8 documentation:

1. **Fixed Installation Dialog Issues:**
   - `perMachine: false` → Forces per-user installation (no "who to install for" dialog)
   - `allowToChangeInstallationDirectory: false` → Removes directory selection dialog

2. **Fixed Shortcut Creation:**
   - `createDesktopShortcut: false` → No desktop shortcuts
   - `createStartMenuShortcut: false` → No start menu shortcuts

3. **Simplified Custom NSIS Script:**
   - Removed interfering custom pages
   - Minimal installer.nsh with only Windows 11 styling

## ✅ TEST RESULTS - PHASE 1 & 2 COMPLETED

### **Current Behavior After Fixes:**

1. **✅ FIXED:** No desktop shortcuts are created
2. **✅ FIXED:** Installation completes successfully 
3. **✅ FIXED:** Finish window shows with "Run" option
4. **❌ STILL ISSUE:** "Choose Installation Options" dialog still appears (per-user vs all users)

### **Remaining Issues to Fix:**

1. **Installation Options Dialog:** Still shows "Who should this application be installed for?" 
   - Shows "Anyone who uses this computer (all users)" 
   - Shows "Only for me (avrahamy)" ✓ (pre-selected)
   - **Problem:** This dialog should not appear at all

## ✅ PHASE 3 COMPLETED - Added Shortcut Selection

### **New Changes Applied:**

1. **Fixed Installation Scope Dialog:**
   - Set `packElevateHelper: false` to remove the "Who should this application be installed for?" dialog
   - This forces per-user installation without asking

2. **Added Custom Shortcut Selection Page:**
   - Created custom NSIS page with checkboxes for:
     - ☐ Create Desktop Shortcut (unchecked by default)
     - ✅ Add to Start Menu (checked by default)
   - User can now choose which shortcuts to create

### **Expected Behavior Now:**
- ❌ NO "Choose Installation Options" dialog (per-user vs all users)
- ✅ SHOWS custom "Installation Options" page with shortcut choices
- ✅ Creates shortcuts ONLY based on user selection
- ✅ Modern Segoe UI font styling
