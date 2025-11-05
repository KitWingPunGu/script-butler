# Development Guide

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- VS Code 1.85.0 or higher
- npm or yarn package manager

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd NPM-JS

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Or run in watch mode
npm run watch
```

## Project Structure

```
NPM-JS/
├── .vscode/              # VS Code configuration
│   ├── launch.json       # Debug configurations
│   ├── tasks.json        # Build tasks
│   └── extensions.json   # Recommended extensions
├── src/                  # TypeScript source files
│   ├── extension.ts      # Main entry point
│   ├── types.ts          # Type definitions
│   ├── packageScanner.ts # Package.json scanner
│   ├── favoritesManager.ts
│   ├── scriptsTreeProvider.ts
│   ├── favoritesTreeProvider.ts
│   └── scriptExecutor.ts
├── out/                  # Compiled JavaScript (generated)
├── resources/            # Static resources
│   └── npm-icon.svg      # Extension icon
├── test-workspace/       # Test workspace for development
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript configuration
└── README.md             # User documentation
```

## Development Workflow

### 1. Make Changes

Edit TypeScript files in the `src/` directory.

### 2. Compile

```bash
# One-time compilation
npm run compile

# Watch mode (auto-compile on save)
npm run watch
```

### 3. Debug

1. Press `F5` in VS Code
2. This launches the Extension Development Host
3. Open a folder with package.json in the new window
4. Test your changes

### 4. Reload

After making changes:
- In the Extension Development Host window
- Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)
- This reloads the extension with your latest changes

## Adding New Features

### Adding a New Command

1. **Register in package.json**:
```json
{
  "contributes": {
    "commands": [
      {
        "command": "npmScriptManager.myNewCommand",
        "title": "My New Command",
        "icon": "$(icon-name)"
      }
    ]
  }
}
```

2. **Implement in extension.ts**:
```typescript
const myNewCommand = vscode.commands.registerCommand(
    'npmScriptManager.myNewCommand',
    async () => {
        // Your implementation
    }
);

context.subscriptions.push(myNewCommand);
```

### Adding a New View

1. **Register in package.json**:
```json
{
  "contributes": {
    "views": {
      "npm-script-manager": [
        {
          "id": "myNewView",
          "name": "My New View"
        }
      ]
    }
  }
}
```

2. **Create TreeDataProvider**:
```typescript
class MyNewTreeProvider implements vscode.TreeDataProvider<MyTreeItem> {
    // Implement required methods
}
```

3. **Register in extension.ts**:
```typescript
const myTreeView = vscode.window.createTreeView('myNewView', {
    treeDataProvider: myNewTreeProvider
});

context.subscriptions.push(myTreeView);
```

### Adding Context Menu Items

In package.json:
```json
{
  "menus": {
    "view/item/context": [
      {
        "command": "npmScriptManager.myCommand",
        "when": "view == npmScripts && viewItem == script",
        "group": "myGroup"
      }
    ]
  }
}
```

### Adding Persistent Settings

1. **Define in package.json**:
```json
{
  "contributes": {
    "configuration": {
      "title": "NPM Script Manager",
      "properties": {
        "npmScriptManager.mySetting": {
          "type": "string",
          "default": "value",
          "description": "My setting description"
        }
      }
    }
  }
}
```

2. **Access in code**:
```typescript
const config = vscode.workspace.getConfiguration('npmScriptManager');
const value = config.get<string>('mySetting');
```

## Testing

### Manual Testing

1. Use the test-workspace folder
2. Modify package.json to test different scenarios
3. Test edge cases:
   - Empty scripts object
   - Invalid JSON
   - Multiple package.json files
   - Very long script names/commands

### Creating Test Scenarios

Add different package.json files to test-workspace:

```bash
# Monorepo structure
test-workspace/
├── package.json
├── apps/
│   ├── frontend/package.json
│   └── backend/package.json
└── packages/
    └── shared/package.json
```

## Debugging Tips

### Enable Extension Logging

In extension.ts:
```typescript
const outputChannel = vscode.window.createOutputChannel('NPM Script Manager');
outputChannel.appendLine('Debug message');
outputChannel.show();
```

### Inspect Extension State

Use VS Code's Developer Tools:
1. In Extension Development Host: Help → Toggle Developer Tools
2. Console tab shows extension logs
3. Use `console.log()` for debugging

### Breakpoints

1. Set breakpoints in TypeScript files
2. Press `F5` to start debugging
3. Breakpoints will hit when code executes

## Common Tasks

### Update Dependencies

```bash
npm update
npm audit fix
```

### Lint Code

```bash
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Build for Production

```bash
npm run compile
```

### Package Extension

```bash
# Install vsce
npm install -g @vscode/vsce

# Create .vsix file
vsce package

# Install locally
code --install-extension npm-script-manager-0.0.1.vsix
```

## Code Style Guidelines

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public methods
- Use meaningful variable names

### Naming Conventions

- Classes: PascalCase (e.g., `PackageScanner`)
- Methods: camelCase (e.g., `scanAllScripts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- Interfaces: PascalCase with 'I' prefix optional

### File Organization

- One class per file
- File name matches class name
- Group related functionality
- Keep files under 300 lines

## Performance Best Practices

1. **Lazy Loading**: Load data only when needed
2. **Caching**: Cache parsed package.json data
3. **Debouncing**: Debounce file watcher events
4. **Async Operations**: Use async/await for I/O
5. **Memory Management**: Dispose resources properly

## Error Handling

Always handle errors gracefully:

```typescript
try {
    const content = await fs.promises.readFile(path, 'utf-8');
    const json = JSON.parse(content);
} catch (error) {
    console.error('Error reading file:', error);
    vscode.window.showErrorMessage('Failed to read package.json');
    return [];
}
```

## VS Code API Resources

- [VS Code API Documentation](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [TreeView API](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Command API](https://code.visualstudio.com/api/references/commands)

## Troubleshooting

### Extension Not Loading

- Check package.json syntax
- Verify activationEvents
- Check Output panel for errors

### TypeScript Errors

- Run `npm run compile` to see errors
- Check tsconfig.json settings
- Ensure all imports are correct

### Changes Not Reflecting

- Reload Extension Development Host (Ctrl+R)
- Check if watch mode is running
- Verify files are being compiled to `out/`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit a pull request

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Commit changes
4. Create git tag
5. Build and package
6. Publish to marketplace

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with details
- Include VS Code version and logs

