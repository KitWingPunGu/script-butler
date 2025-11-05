# Troubleshooting Guide

## Common Issues and Solutions

### Extension Not Appearing

#### Problem
The NPM Script Manager icon doesn't appear in the Activity Bar.

#### Solutions

1. **Check Extension is Loaded**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Type "Extensions: Show Installed Extensions"
   - Look for "NPM Script Manager"

2. **Verify Workspace Has package.json**
   - The extension only activates when a package.json file is present
   - Check your workspace root for package.json
   - If in a subdirectory, make sure it's within the workspace

3. **Reload VS Code**
   - Press `Ctrl+Shift+P`
   - Type "Developer: Reload Window"
   - Or restart VS Code completely

4. **Check Extension Development Host**
   - If testing in development, ensure you pressed `F5`
   - Look for "Extension Development Host" in the window title

---

### No Scripts Showing

#### Problem
The Scripts panel is empty even though package.json has scripts.

#### Solutions

1. **Verify package.json Format**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build"
     }
   }
   ```
   - Ensure "scripts" is a top-level property
   - Check JSON is valid (no trailing commas, proper quotes)

2. **Check for Syntax Errors**
   - Open package.json
   - Look for red squiggly lines indicating errors
   - Fix any JSON syntax issues

3. **Manual Refresh**
   - Click the refresh button (🔄) in the Scripts panel
   - Or use Command Palette: "NPM Script Manager: Refresh Scripts"

4. **Check File Location**
   - Ensure package.json is not in node_modules
   - Extension excludes node_modules by default

5. **View Output Logs**
   - Open Output panel: View → Output
   - Select "NPM Script Manager" from dropdown
   - Look for error messages

---

### Scripts Not Executing

#### Problem
Clicking a script doesn't run it or terminal doesn't open.

#### Solutions

1. **Check Node.js Installation**
   ```bash
   node --version
   npm --version
   ```
   - Ensure Node.js and npm are installed
   - Add to PATH if necessary

2. **Verify Terminal Settings**
   - Check VS Code terminal settings
   - Try opening terminal manually: `Ctrl+` `
   - Ensure terminal can run npm commands

3. **Check Script Syntax**
   - Open package.json
   - Verify the script command is valid
   - Test manually: `npm run <script-name>`

4. **Look for Error Notifications**
   - Check bottom-right corner for error messages
   - Review terminal output for errors

5. **Restart Terminal**
   - Close all terminals
   - Try running script again

---

### Favorites Not Persisting

#### Problem
Favorites disappear after restarting VS Code.

#### Solutions

1. **Check Storage Permissions**
   - VS Code needs write access to storage
   - Check file permissions in workspace

2. **Verify Extension Context**
   - Favorites use globalState
   - Should persist across all workspaces
   - Try adding favorite again

3. **Clear and Re-add**
   - Remove all favorites
   - Restart VS Code
   - Add favorites again

4. **Check for Extension Conflicts**
   - Disable other extensions temporarily
   - Test if favorites persist
   - Re-enable extensions one by one

---

### Filter Not Working

#### Problem
Filter doesn't show expected results.

#### Solutions

1. **Check Search Term**
   - Filter is case-insensitive
   - Searches both script name and command
   - Try partial matches

2. **Clear and Retry**
   - Click clear filter button (✖️)
   - Try filtering again

3. **Refresh Scripts**
   - Click refresh button
   - Then apply filter again

4. **Check for Typos**
   - Verify spelling of search term
   - Try simpler search terms

---

### Monorepo Not Showing Multiple Folders

#### Problem
Multiple package.json files exist but only one shows.

#### Solutions

1. **Check File Locations**
   - Ensure package.json files are in workspace
   - Not in node_modules directories
   - Within workspace root

2. **Verify Workspace Setup**
   - Open folder containing all packages
   - Not individual package folders

3. **Refresh Extension**
   - Click refresh button
   - Or reload VS Code window

4. **Check Glob Pattern**
   - Extension searches `**/package.json`
   - Excludes `**/node_modules/**`

---

### Terminal Not Reusing

#### Problem
New terminal opens for each script execution.

#### Solutions

1. **This is Expected Behavior**
   - Different scripts get different terminals
   - Same script reuses its terminal

2. **Check Terminal Name**
   - Look for "NPM: <script-name>" in terminal tabs
   - Each script has its own named terminal

3. **Close Unused Terminals**
   - Manually close terminals you don't need
   - Extension will create new ones as needed

---

### Extension Crashes or Freezes

#### Problem
Extension becomes unresponsive or crashes VS Code.

#### Solutions

1. **Check for Large Workspaces**
   - Very large monorepos may be slow
   - Consider excluding directories in settings

2. **Review package.json Size**
   - Extremely large package.json files may cause issues
   - Consider splitting into multiple files

3. **Disable and Re-enable**
   - Disable extension
   - Reload VS Code
   - Re-enable extension

4. **Check VS Code Version**
   - Ensure VS Code is version 1.85.0 or higher
   - Update if necessary

5. **Report Issue**
   - If problem persists, report on GitHub
   - Include VS Code version and error logs

---

### Development Issues

#### Problem
Changes to source code not reflecting in Extension Development Host.

#### Solutions

1. **Recompile TypeScript**
   ```bash
   npm run compile
   ```
   - Or use watch mode: `npm run watch`

2. **Reload Extension Host**
   - In Extension Development Host window
   - Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)

3. **Check Compilation Errors**
   ```bash
   npm run compile
   ```
   - Fix any TypeScript errors
   - Ensure compilation succeeds

4. **Verify Output Files**
   - Check `out/` directory exists
   - Contains compiled .js files
   - Files are up to date

5. **Restart Debugging**
   - Stop debugging (Shift+F5)
   - Start again (F5)

---

### Build/Package Issues

#### Problem
Cannot create .vsix package or build fails.

#### Solutions

1. **Install vsce**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Check package.json**
   - Ensure all required fields are present
   - Verify version format (e.g., "0.0.1")

3. **Compile First**
   ```bash
   npm run compile
   vsce package
   ```

4. **Check for Missing Files**
   - Ensure all referenced files exist
   - Check .vscodeignore isn't excluding needed files

5. **Review Error Messages**
   - vsce provides detailed error messages
   - Follow suggestions in output

---

## Diagnostic Commands

### Check Extension Status

```bash
# In VS Code terminal
code --list-extensions | grep npm-script-manager
```

### View Extension Logs

1. Open Output panel: `View → Output`
2. Select "NPM Script Manager" from dropdown
3. Review log messages

### Test npm Manually

```bash
# Navigate to directory with package.json
cd /path/to/project

# List available scripts
npm run

# Run a specific script
npm run dev
```

### Check File Watcher

```javascript
// Add to extension.ts for debugging
console.log('File watcher created');
watcher.onDidChange(uri => {
    console.log('File changed:', uri.fsPath);
});
```

---

## Getting Help

### Before Reporting Issues

1. ✅ Check this troubleshooting guide
2. ✅ Review documentation (README.md, QUICKSTART.md)
3. ✅ Test with a simple package.json
4. ✅ Try in a new workspace
5. ✅ Check VS Code and Node.js versions

### Information to Include

When reporting issues, provide:

- **VS Code Version**: Help → About
- **Extension Version**: From package.json
- **Node.js Version**: `node --version`
- **npm Version**: `npm --version`
- **Operating System**: Windows/Mac/Linux
- **Error Messages**: From Output panel
- **Steps to Reproduce**: Detailed steps
- **Sample package.json**: If relevant

### Where to Get Help

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check all .md files in project
- **VS Code Docs**: https://code.visualstudio.com/api
- **Stack Overflow**: Tag with `vscode-extension`

---

## Quick Fixes

### Reset Everything

```bash
# Close VS Code
# Delete node_modules
rm -rf node_modules

# Delete compiled output
rm -rf out

# Reinstall dependencies
npm install

# Recompile
npm run compile

# Restart VS Code and press F5
```

### Clear Extension Storage

```javascript
// Add to extension.ts activate() function temporarily
context.globalState.update('npmScriptManager.favorites', undefined);
```

### Force Refresh

1. Click refresh button multiple times
2. Or close and reopen workspace
3. Or reload VS Code window

---

## Performance Tips

### For Large Monorepos

1. **Exclude Unnecessary Directories**
   - Add to .gitignore
   - Extension respects gitignore patterns

2. **Limit Depth**
   - Keep package.json files at reasonable depth
   - Avoid deeply nested structures

3. **Close Unused Terminals**
   - Terminals consume resources
   - Close when not needed

### For Slow Filtering

1. **Use Specific Search Terms**
   - More specific = faster results
   - Avoid single-character searches

2. **Clear Filter When Done**
   - Reduces processing overhead
   - Click clear button (✖️)

---

## Known Limitations

1. **Node Modules Excluded**
   - package.json in node_modules are ignored
   - This is intentional

2. **JSON Parsing**
   - Invalid JSON will be skipped
   - Check for syntax errors

3. **Terminal Limits**
   - VS Code has terminal limits
   - Close unused terminals

4. **File Watching**
   - Some file systems may not support watching
   - Use manual refresh if needed

---

**Still Having Issues?**

Create a GitHub issue with:
- Detailed description
- Steps to reproduce
- Error messages
- System information

We're here to help! 🚀

