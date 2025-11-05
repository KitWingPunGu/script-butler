# Features Guide

## Visual Overview

This document describes what you'll see when using the NPM Script Manager extension.

## Extension Layout

```
┌─────────────────────────────────────────────────────────────┐
│  VS Code Window                                              │
│                                                               │
│  ┌──────┐  ┌─────────────────────────────────────────────┐  │
│  │      │  │  Editor Area                                 │  │
│  │  📦  │  │                                               │  │
│  │ NPM  │  │  Your code files...                          │  │
│  │      │  │                                               │  │
│  │ ▼    │  │                                               │  │
│  │      │  └─────────────────────────────────────────────┘  │
│  │ NPM  │                                                    │
│  │Scripts│  ┌─────────────────────────────────────────────┐  │
│  │      │  │  Terminal                                    │  │
│  │ 🔄 🔍│  │  $ npm run dev                               │  │
│  │      │  │  > Running development server...             │  │
│  │ ▼ dev│  └─────────────────────────────────────────────┘  │
│  │ ▼ build                                                  │
│  │ ▼ test│                                                   │
│  │      │                                                    │
│  │Favorites                                                 │
│  │      │                                                    │
│  │ ⭐dev│                                                    │
│  │ ⭐test│                                                   │
│  └──────┘                                                    │
└─────────────────────────────────────────────────────────────┘
```

## 1. Scripts Panel

### Single Package.json View

```
NPM Scripts                    🔄 🔍
├─ 📄 dev                      ▶️
├─ 📄 build                    ▶️
├─ 📄 test                     ▶️
├─ 📄 test:ui                  ▶️
├─ 📄 lint                     ▶️
└─ 📄 format                   ▶️
```

**Features**:
- 🔄 Refresh button - Reload all scripts
- 🔍 Filter button - Search scripts
- ▶️ Play button - Run script (inline)
- 📄 Terminal icon - Indicates runnable script

### Monorepo View (Multiple package.json)

```
NPM Scripts                    🔄 🔍
├─ 📁 package.json
│  ├─ 📄 dev                   ▶️
│  └─ 📄 build                 ▶️
├─ 📁 apps/frontend/package.json
│  ├─ 📄 dev                   ▶️
│  ├─ 📄 build                 ▶️
│  └─ 📄 test                  ▶️
└─ 📁 apps/backend/package.json
   ├─ 📄 start                 ▶️
   └─ 📄 test                  ▶️
```

**Features**:
- 📁 Folder grouping by package.json location
- Expandable/collapsible groups
- Relative paths shown

## 2. Favorites Panel

```
Favorites
├─ ⭐ dev                      ▶️
├─ ⭐ test                     ▶️
└─ ⭐ build                    ▶️
```

**Features**:
- ⭐ Star icon indicates favorite
- Quick access to frequently used scripts
- Same execution capabilities as main panel

## 3. Context Menus

### Right-click on Script (Scripts Panel)

```
┌─────────────────────────┐
│ ▶️  Run Script          │
│ ⭐  Add to Favorites    │
└─────────────────────────┘
```

### Right-click on Favorite (Favorites Panel)

```
┌─────────────────────────┐
│ ▶️  Run Script          │
│ ⭐  Remove from Favorites│
└─────────────────────────┘
```

## 4. Toolbar Actions

### Scripts Panel Toolbar

```
NPM Scripts    [🔄] [🔍] [✖️]
```

- **🔄 Refresh**: Reload all scripts from package.json files
- **🔍 Filter**: Open search input to filter scripts
- **✖️ Clear Filter**: Remove active filter (only visible when filtering)

## 5. Filter Feature

### Before Filtering

```
NPM Scripts                    🔄 🔍
├─ 📄 dev
├─ 📄 build
├─ 📄 test
├─ 📄 test:ui
├─ 📄 test:coverage
├─ 📄 lint
├─ 📄 lint:fix
└─ 📄 format
```

### Filter Input

```
┌─────────────────────────────────────┐
│ Filter scripts by name or command   │
│ test                                │
└─────────────────────────────────────┘
```

### After Filtering (search: "test")

```
NPM Scripts                    🔄 🔍 ✖️
├─ 📄 test
├─ 📄 test:ui
└─ 📄 test:coverage
```

## 6. Script Execution

### Click on Script

```
1. User clicks "dev" script
   ↓
2. Terminal opens/focuses
   ↓
3. Command executes: npm run dev
   ↓
4. Notification appears: "Running: dev"
```

### Terminal Output

```
┌─────────────────────────────────────┐
│ NPM: dev                      ✖️ ▼  │
├─────────────────────────────────────┤
│ $ npm run dev                       │
│                                     │
│ > test-project@1.0.0 dev           │
│ > vite                              │
│                                     │
│ VITE v5.0.0  ready in 234 ms       │
│                                     │
│ ➜  Local:   http://localhost:5173/ │
│ ➜  Network: use --host to expose   │
└─────────────────────────────────────┘
```

**Features**:
- Named terminal: "NPM: {script-name}"
- Terminal reuse for same script
- Automatic focus on execution

## 7. Tooltips

### Hover over Script

```
┌─────────────────────────────────────┐
│ dev                                 │
│                                     │
│ vite                                │
│                                     │
│ Path: /path/to/package.json        │
└─────────────────────────────────────┘
```

Shows:
- Script name
- Full command
- Path to package.json

### Hover over Folder (Monorepo)

```
┌─────────────────────────────────────┐
│ apps/frontend/package.json          │
│                                     │
│ 5 script(s) in apps/frontend/...   │
└─────────────────────────────────────┘
```

## 8. Notifications

### Success Messages

```
ℹ️  Running: dev
ℹ️  Added "dev" to favorites
ℹ️  Removed "test" from favorites
ℹ️  NPM scripts refreshed
ℹ️  Filter cleared
```

### Error Messages (if any)

```
❌ Failed to read package.json
❌ Invalid JSON in package.json
```

## 9. Empty States

### No Scripts Found

```
NPM Scripts                    🔄 🔍

No NPM scripts found.
Make sure your workspace contains
a package.json file with scripts.
```

### No Favorites

```
Favorites

No favorite scripts yet.
Right-click any script and select
"Add to Favorites" to get started.
```

### No Results After Filtering

```
NPM Scripts                    🔄 🔍 ✖️

No scripts match "xyz"
Try a different search term.
```

## 10. Icon Legend

| Icon | Meaning |
|------|---------|
| 📦 | NPM Script Manager (Activity Bar) |
| 📄 | Runnable script |
| 📁 | Package.json location (folder) |
| ⭐ | Favorite script |
| ▶️ | Run/Execute action |
| 🔄 | Refresh |
| 🔍 | Filter/Search |
| ✖️ | Clear filter |

## 11. Keyboard Navigation

- **Arrow Keys**: Navigate through scripts
- **Enter**: Run selected script
- **Tab**: Move between panels
- **Ctrl+R**: Refresh (when panel focused)

## 12. Color Coding

- **Favorites**: Yellow star icon
- **Regular Scripts**: Default terminal icon
- **Folders**: Default folder icon
- **Active Filter**: Clear button appears

## 13. Workflow Examples

### Example 1: Quick Run

```
1. Open NPM Scripts panel
2. Click "dev"
3. Script runs in terminal
```

### Example 2: Add to Favorites

```
1. Right-click "test" script
2. Select "Add to Favorites"
3. Script appears in Favorites panel
4. Star icon appears next to script
```

### Example 3: Filter and Run

```
1. Click filter icon
2. Type "build"
3. See only build-related scripts
4. Click desired script to run
5. Click clear filter to see all
```

### Example 4: Monorepo Navigation

```
1. See grouped package.json files
2. Expand "apps/frontend/package.json"
3. Click "dev" under frontend
4. Frontend dev server starts
```

## 14. Best Practices

### Organizing Scripts

Group related scripts with prefixes:
```json
{
  "scripts": {
    "dev": "...",
    "dev:watch": "...",
    "build": "...",
    "build:prod": "...",
    "test": "...",
    "test:watch": "..."
  }
}
```

### Using Favorites

Add frequently used scripts:
- Development server (dev)
- Test runner (test)
- Build command (build)
- Deployment scripts

### Filtering Tips

- Use partial matches: "test" finds "test", "test:ui", "pretest"
- Search by command: "vite" finds all scripts using vite
- Clear filter to see all scripts again

## 15. Integration with VS Code

### Activity Bar

The NPM icon appears in the Activity Bar alongside:
- Explorer
- Search
- Source Control
- Run and Debug
- Extensions

### Terminal Integration

- Scripts run in VS Code's integrated terminal
- Terminal tabs are named for easy identification
- Multiple scripts can run simultaneously
- Terminal history is preserved

### Command Palette

Access commands via `Ctrl+Shift+P`:
- "NPM Script Manager: Refresh Scripts"
- "NPM Script Manager: Filter Scripts"
- etc.

---

**Tip**: Press `F5` in VS Code to see all these features in action!

