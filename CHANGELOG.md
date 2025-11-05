# Change Log

All notable changes to the "NPM Script Manager" extension will be documented in this file.

## [0.0.1] - 2025-01-04

### Added

- **Script Detection**: Automatically detect and parse all package.json files in workspace
- **Tree View UI**: Display scripts in a dedicated sidebar panel with tree view
- **Script Execution**: Run NPM scripts directly from the UI in integrated terminal
- **Favorites System**: Mark frequently-used scripts as favorites with persistence
- **Search & Filter**: Filter scripts by name or command with real-time updates
- **Monorepo Support**: Handle multiple package.json files with grouped display
- **Auto-refresh**: Automatically reload scripts when package.json files change
- **Manual Refresh**: Refresh button to manually reload all scripts
- **Contextual Menus**: Right-click menus for quick actions
- **Visual Indicators**: Icons and tooltips for better UX
- **Terminal Management**: Smart terminal reuse for repeated script executions
- **Persistent Storage**: Save favorites across VS Code sessions

### Features

#### Core Functionality
- Package.json detection in workspace root and subdirectories
- NPM script parsing and validation
- Dedicated activity bar icon and panel

#### User Interface
- Scripts panel showing all available scripts
- Favorites panel for quick access to favorite scripts
- Collapsible workspace folders in monorepo setups
- Inline action buttons (play, star)
- Toolbar buttons (refresh, filter, clear filter)

#### Script Management
- One-click script execution
- Named terminals for each script
- Terminal reuse for efficiency
- Execution feedback notifications

#### Favorites
- Add/remove scripts to/from favorites
- Visual star indicators
- Separate favorites view
- Global persistence across sessions

#### Search & Filter
- Filter by script name
- Filter by script command
- Real-time filter updates
- Clear filter button
- Filter state indicator

#### Monorepo Support
- Detect multiple package.json files
- Group scripts by location
- Show relative paths
- Flat list for single package.json

### Technical Details
- Built with TypeScript
- Uses VS Code TreeView API
- File system watcher for auto-refresh
- Global state for persistence
- Modular architecture with separation of concerns

### Known Limitations
- None at this time

---

## Future Enhancements (Planned)

### Version 0.1.0
- [ ] Script history tracking
- [ ] Recently run scripts section
- [ ] Custom script aliases
- [ ] Script output capture and display

### Version 0.2.0
- [ ] Script dependencies visualization
- [ ] Parallel script execution
- [ ] Script templates
- [ ] Export/import favorites

### Version 0.3.0
- [ ] Script performance metrics
- [ ] Custom terminal profiles per script
- [ ] Script scheduling
- [ ] Workspace-specific favorites

---

## Contributing

See [README.md](README.md) for contribution guidelines.

## License

MIT

