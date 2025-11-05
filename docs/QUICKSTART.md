# Quick Start Guide - NPM Script Manager Extension

## Testing the Extension

### Step 1: Open Extension Development Host

1. Open this project in VS Code
2. Press `F5` or go to Run → Start Debugging
3. A new VS Code window will open with the extension loaded (Extension Development Host)

### Step 2: Open Test Workspace

In the Extension Development Host window:

1. Go to File → Open Folder
2. Navigate to the `test-workspace` folder inside this project
3. Click "Select Folder"

### Step 3: View NPM Scripts

1. Look for the NPM icon in the Activity Bar (left sidebar)
2. Click on it to open the NPM Script Manager panel
3. You should see two sections:
   - **Scripts**: All available NPM scripts from package.json
   - **Favorites**: Your favorite scripts (empty initially)

### Step 4: Test Features

#### Running Scripts

- Click on any script (e.g., "dev", "build", "test") to run it
- The script will execute in the integrated terminal
- A notification will appear confirming the script is running

#### Adding Favorites

1. Right-click on a script (e.g., "dev")
2. Select "Add to Favorites"
3. The script will appear in the Favorites panel
4. Notice the star icon next to favorite scripts

#### Filtering Scripts

1. Click the filter icon (🔍) in the Scripts panel toolbar
2. Type "test" to filter scripts
3. Only scripts containing "test" will be shown
4. Click the clear icon (✖) to remove the filter

#### Removing Favorites

1. Go to the Favorites panel
2. Right-click on a favorite script
3. Select "Remove from Favorites"
4. The script will be removed from favorites

#### Refreshing Scripts

1. Modify the `test-workspace/package.json` file
2. Add a new script: `"hello": "echo Hello World"`
3. The extension should auto-refresh
4. Or click the refresh icon (🔄) to manually refresh

## Testing with Your Own Project

1. In the Extension Development Host window, open any of your projects
2. The extension will automatically detect all `package.json` files
3. All NPM scripts will be displayed in the sidebar

## Monorepo Testing

To test monorepo support:

1. Create multiple folders in `test-workspace`
2. Add a `package.json` with scripts to each folder
3. The extension will group scripts by their location
4. Each group will show the relative path to its `package.json`

## Debugging

If you need to debug the extension:

1. Set breakpoints in the TypeScript source files (in `src/`)
2. Press `F5` to start debugging
3. Use the extension in the Development Host window
4. Breakpoints will be hit in the main VS Code window

## Common Issues

### Extension Not Activating

- Make sure you have a `package.json` file in the workspace
- Check the Output panel (View → Output) and select "NPM Script Manager"

### Scripts Not Showing

- Click the refresh button
- Check that your `package.json` has a "scripts" section
- Verify the JSON is valid

### Terminal Not Opening

- Check VS Code's integrated terminal settings
- Make sure Node.js and NPM are installed on your system

## Next Steps

- Customize the extension code in `src/`
- Add new features or modify existing ones
- Run `npm run watch` to automatically recompile on changes
- Test your changes by reloading the Extension Development Host (Ctrl+R)

## Building for Distribution

When ready to share your extension:

```bash
# Install vsce (VS Code Extension Manager)
npm install -g @vscode/vsce

# Package the extension
vsce package

# This creates a .vsix file you can install or publish
```

## Publishing to VS Code Marketplace

1. Create a publisher account at https://marketplace.visualstudio.com/
2. Get a Personal Access Token from Azure DevOps
3. Login with vsce: `vsce login <publisher-name>`
4. Publish: `vsce publish`

For more details, see: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

