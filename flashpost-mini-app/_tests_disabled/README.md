# ⚠️ TESTS DISABLED FOLDER

**IMPORTANT: These files are NOT part of production app**

This folder contains test files, legacy versions, and development utilities that are **DISABLED** from the main application runtime.

## What's in here:
- `test-*.html` - All test files
- `debug-*.html` - Debug utilities  
- `*-test.html` - Test variations
- `legacy/` - Legacy code versions
- `*-fix.html` - Temporary fix files
- `*-diagnosis.html` - Diagnostic files

## Production Entry Points:
- **ONLY** `../index.html` - Main application entry
- **ONLY** `../src/app.js` - Main JavaScript entry

## DO NOT USE:
- Any files in this folder for production
- Any `app-fixed.js`, `app-stabilized.js` variants
- Any test or debug HTML files

---
**SINGLE SOURCE OF TRUTH: Use only index.html + src/app.js**