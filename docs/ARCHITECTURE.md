# Architecture Overview

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     VS Code Extension Host                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   extension.ts                         │  │
│  │              (Main Entry Point)                        │  │
│  │  - Activates extension                                 │  │
│  │  - Registers commands                                  │  │
│  │  - Initializes components                              │  │
│  │  - Sets up file watchers                               │  │
│  └─────────────┬──────────────────────────────────────────┘  │
│                │                                              │
│                ├──────────────┬──────────────┬───────────┐   │
│                │              │              │           │   │
│  ┌─────────────▼────┐  ┌──────▼──────┐  ┌───▼────┐  ┌───▼───┐
│  │ PackageScanner   │  │  Favorites  │  │ Script │  │ Tree  │
│  │                  │  │  Manager    │  │ Exec   │  │ Provs │
│  └─────────────┬────┘  └──────┬──────┘  └───┬────┘  └───┬───┘
│                │               │             │           │   │
└────────────────┼───────────────┼─────────────┼───────────┼───┘
                 │               │             │           │
                 │               │             │           │
    ┌────────────▼──────┐  ┌─────▼──────┐  ┌──▼────┐  ┌───▼────┐
    │  File System      │  │  Global    │  │ Term  │  │ Tree   │
    │  (package.json)   │  │  State     │  │ inal  │  │ View   │
    └───────────────────┘  └────────────┘  └───────┘  └────────┘
```

## Core Components

### 1. extension.ts
**Purpose**: Main extension entry point and orchestrator

**Responsibilities**:
- Extension activation/deactivation
- Component initialization
- Command registration
- Event handler setup
- File watcher management

**Key Functions**:
- `activate()`: Initialize all components and register commands
- `deactivate()`: Clean up resources

### 2. PackageScanner
**Purpose**: Detect and parse package.json files

**Responsibilities**:
- Find all package.json files in workspace
- Parse JSON and extract scripts
- Watch for file system changes
- Provide script metadata

**Key Methods**:
- `findPackageJsonFiles()`: Locate all package.json files
- `parsePackageJson()`: Extract scripts from a file
- `scanAllScripts()`: Get all scripts from all files
- `createFileWatcher()`: Set up file change monitoring

### 3. FavoritesManager
**Purpose**: Manage favorite scripts with persistence

**Responsibilities**:
- Track favorite scripts
- Persist favorites to global state
- Add/remove favorites
- Query favorite status

**Key Methods**:
- `isFavorite()`: Check if script is favorited
- `addToFavorites()`: Mark script as favorite
- `removeFromFavorites()`: Unmark favorite
- `getFavoriteScripts()`: Get all favorites from a list

**Storage**: Uses VS Code's `globalState` API

### 4. ScriptExecutor
**Purpose**: Execute NPM scripts in VS Code terminal

**Responsibilities**:
- Create and manage terminals
- Execute npm run commands
- Reuse terminals when possible
- Clean up closed terminals

**Key Methods**:
- `executeScript()`: Run a script in terminal
- `dispose()`: Clean up all terminals

**Terminal Strategy**:
- One terminal per script name
- Terminal reuse for efficiency
- Automatic cleanup on close

### 5. ScriptsTreeProvider
**Purpose**: Provide data for the Scripts tree view

**Responsibilities**:
- Display all scripts in tree format
- Handle filtering
- Group scripts by location (monorepo)
- Refresh on changes

**Key Methods**:
- `refresh()`: Reload all scripts
- `setFilter()`: Apply search filter
- `clearFilter()`: Remove filter
- `getChildren()`: Provide tree items
- `getTreeItem()`: Convert data to tree item

**Tree Structure**:
```
Single package.json:
├─ script1
├─ script2
└─ script3

Multiple package.json (monorepo):
├─ package.json (root)
│  ├─ script1
│  └─ script2
└─ apps/frontend/package.json
   ├─ dev
   └─ build
```

### 6. FavoritesTreeProvider
**Purpose**: Provide data for the Favorites tree view

**Responsibilities**:
- Display favorite scripts
- Refresh when favorites change
- Delegate to FavoritesManager for data

**Key Methods**:
- `refresh()`: Update view
- `getChildren()`: Get favorite scripts
- `getTreeItem()`: Convert to tree item

## Data Flow

### Script Discovery Flow
```
User Opens Workspace
        ↓
extension.ts activates
        ↓
PackageScanner.scanAllScripts()
        ↓
Find all package.json files
        ↓
Parse each file
        ↓
Extract scripts
        ↓
ScriptsTreeProvider.refresh()
        ↓
Display in Tree View
```

### Script Execution Flow
```
User Clicks Script
        ↓
Command: npmScriptManager.runScript
        ↓
ScriptExecutor.executeScript()
        ↓
Get/Create Terminal
        ↓
Send "npm run <script>" command
        ↓
Show Terminal
        ↓
Display Notification
```

### Favorites Flow
```
User Adds to Favorites
        ↓
Command: npmScriptManager.addToFavorites
        ↓
FavoritesManager.addToFavorites()
        ↓
Update in-memory Set
        ↓
Persist to globalState
        ↓
Refresh both tree views
        ↓
Update UI with star icons
```

### Filter Flow
```
User Clicks Filter Icon
        ↓
Show Input Box
        ↓
User Enters Text
        ↓
ScriptsTreeProvider.setFilter()
        ↓
Store filter text
        ↓
Fire tree data change event
        ↓
getChildren() filters scripts
        ↓
Display filtered results
```

## Type System

### Core Types

**NpmScript**
```typescript
{
    name: string;           // Script name (e.g., "dev")
    command: string;        // Command to run (e.g., "vite")
    packageJsonPath: string; // Full path to package.json
    workspaceFolder: string; // Workspace folder path
}
```

**NpmScriptTreeItem**
- Extends `vscode.TreeItem`
- Represents a script in the tree view
- Contains script data and favorite status

**WorkspaceFolderTreeItem**
- Extends `vscode.TreeItem`
- Represents a group of scripts from one package.json
- Used in monorepo scenarios

## Extension Points

### Commands
- `npmScriptManager.refresh`
- `npmScriptManager.runScript`
- `npmScriptManager.addToFavorites`
- `npmScriptManager.removeFromFavorites`
- `npmScriptManager.filterScripts`
- `npmScriptManager.clearFilter`

### Views
- `npmScripts`: Main scripts view
- `npmFavorites`: Favorites view

### Context Keys
- `npmScriptManager.filterActive`: True when filter is applied

## Persistence

### Global State
- **Key**: `npmScriptManager.favorites`
- **Type**: `string[]`
- **Format**: `["<packageJsonPath>::<scriptName>", ...]`
- **Scope**: Global (across all workspaces)

## File Watching

**Pattern**: `**/package.json`
**Exclusions**: `**/node_modules/**`

**Events**:
- `onDidChange`: File modified
- `onDidCreate`: New file created
- `onDidDelete`: File deleted

**Action**: Refresh both tree views

## Error Handling

- JSON parsing errors are caught and logged
- Missing package.json files are handled gracefully
- Terminal errors are managed with try-catch
- Invalid scripts are filtered out during parsing

## Performance Considerations

1. **Lazy Loading**: Tree items are created on-demand
2. **Terminal Reuse**: Terminals are reused to avoid proliferation
3. **Efficient Filtering**: In-memory filtering without re-scanning
4. **Debounced Refresh**: File watcher prevents excessive refreshes
5. **Minimal State**: Only favorites are persisted

## Extension Lifecycle

1. **Activation**: When workspace contains package.json
2. **Initialization**: Create all components
3. **Registration**: Register commands and views
4. **Monitoring**: Watch for file changes
5. **Deactivation**: Clean up terminals and watchers

