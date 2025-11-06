# NPM Script Manager

A powerful VS Code extension for managing and executing NPM scripts with ease.

## Features

### 📋 Script Discovery
- Automatically detects all `package.json` files in your workspace
- Displays all NPM scripts in a dedicated sidebar panel
- Supports monorepo structures with multiple `package.json` files
- Auto-refreshes when `package.json` files are modified

### ⭐ Favorites
- Mark frequently-used scripts as favorites
- Dedicated "Favorites" view for quick access
- Favorites are persisted across VS Code sessions
- Visual indicators (star icons) for favorite scripts

### 🔍 Search & Filter
- Filter scripts by name or command
- Real-time filtering as you type
- Clear filter button for easy reset
- Filter state is maintained until cleared

### ▶️ Script Execution
- Run scripts directly from the extension UI
- Scripts execute in VS Code's integrated terminal
- Each script runs in its own named terminal
- Terminal reuse for repeated script executions
- Visual feedback when scripts are launched

### 🎨 User Interface
- Clean, intuitive tree view interface
- Contextual menus for quick actions
- Inline action buttons for common operations
- Collapsible workspace folders in monorepos
- Tooltips showing full script commands and paths

## Installation

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new VS Code window with the extension loaded
4. The extension will activate when it detects a `package.json` file

### Building VSIX Package

```bash
npm install -g @vscode/vsce
vsce package
```

Then install the `.vsix` file in VS Code.

## Usage

### Viewing Scripts

1. Open a project with a `package.json` file
2. Click on the NPM icon in the Activity Bar (left sidebar)
3. View all available scripts in the "Scripts" panel

### Running Scripts

- **Click** on any script to run it
- **Right-click** and select "Run Script"
- Scripts execute in the integrated terminal

### Managing Favorites

- **Add to Favorites**: Right-click a script → "Add to Favorites"
- **Remove from Favorites**: Right-click a favorite → "Remove from Favorites"
- View all favorites in the "Favorites" panel

### Filtering Scripts

1. Click the filter icon (🔍) in the Scripts panel toolbar
2. Enter search text (searches both script names and commands)
3. Click the clear icon (✖) to remove the filter

### Refreshing

- Click the refresh icon (🔄) to manually reload scripts
- Scripts auto-refresh when `package.json` files change

## Monorepo Support

The extension automatically detects multiple `package.json` files in your workspace:

- Scripts are grouped by their `package.json` location
- Each group shows the relative path to its `package.json`
- Expand/collapse groups as needed
- Single `package.json` projects show a flat list

## Commands

| Command | Description |
|---------|-------------|
| `NPM Script Manager: Refresh Scripts` | Reload all scripts from package.json files |
| `NPM Script Manager: Run Script` | Execute the selected script |
| `NPM Script Manager: Add to Favorites` | Mark a script as favorite |
| `NPM Script Manager: Remove from Favorites` | Unmark a favorite script |
| `NPM Script Manager: Filter Scripts` | Filter scripts by name/command |
| `NPM Script Manager: Clear Filter` | Remove active filter |

## Requirements

- VS Code 1.85.0 or higher
- Node.js and NPM installed on your system

## Extension Settings

This extension stores the following data:

- **Favorites**: List of favorite scripts (persisted globally)
- **Filter State**: Current filter text (session-based)

## Development

### Project Structure

```
.
├── src/
│   ├── extension.ts              # Main extension entry point
│   ├── types.ts                  # TypeScript interfaces and types
│   ├── packageScanner.ts         # Package.json detection and parsing
│   ├── favoritesManager.ts       # Favorites persistence logic
│   ├── scriptsTreeProvider.ts    # Scripts tree view provider
│   ├── favoritesTreeProvider.ts  # Favorites tree view provider
│   └── scriptExecutor.ts         # Script execution in terminal
├── resources/
│   └── npm-icon.svg              # Extension icon
├── package.json                  # Extension manifest
└── tsconfig.json                 # TypeScript configuration
```

### Building

```bash
npm install          # Install dependencies
npm run compile      # Compile TypeScript
npm run watch        # Watch mode for development
npm run lint         # Run ESLint
```

### Debugging

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Set breakpoints in the TypeScript source files
4. Test the extension in the new window

## Known Issues

- None at this time

## Release Notes

### 0.0.1

Initial release with core features:
- Script detection and display
- Favorites management
- Search/filter functionality
- Script execution
- Monorepo support

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

