# NPM Script Manager - Documentation Index

Welcome to the NPM Script Manager extension documentation! This index will help you find the information you need.

## 🚀 Quick Start

**New to this extension?** Start here:

1. **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes
   - How to test the extension
   - Step-by-step walkthrough
   - Testing with your own projects

2. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Overview of what's been built
   - Complete feature list
   - Project structure
   - Success metrics

## 📖 User Documentation

**For users of the extension:**

1. **[README.md](README.md)** - Main user documentation
   - Features overview
   - Installation instructions
   - Usage guide
   - Commands reference

2. **[FEATURES.md](FEATURES.md)** - Visual features guide
   - UI layout and components
   - Visual examples
   - Workflow demonstrations
   - Best practices

## 🔧 Developer Documentation

**For developers working on the extension:**

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture
   - Component diagram
   - Data flow
   - Type system
   - Extension points

2. **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide
   - Setup instructions
   - Development workflow
   - Adding new features
   - Code style guidelines

## 🐛 Support & Troubleshooting

**Having issues?**

1. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
   - Extension not appearing
   - Scripts not showing
   - Execution problems
   - Performance tips

## 📝 Project Information

**Project history and planning:**

1. **[CHANGELOG.md](CHANGELOG.md)** - Version history
   - Release notes
   - Feature additions
   - Future enhancements

## 📚 Documentation by Topic

### Installation & Setup

- [QUICKSTART.md](QUICKSTART.md) - Testing the extension
- [README.md](README.md#installation) - Installation methods
- [DEVELOPMENT.md](DEVELOPMENT.md#setup) - Development setup

### Features & Usage

- [README.md](README.md#features) - Feature overview
- [FEATURES.md](FEATURES.md) - Visual guide
- [README.md](README.md#usage) - How to use

### Development

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [DEVELOPMENT.md](DEVELOPMENT.md#adding-new-features) - Extending the extension

### Troubleshooting

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md#diagnostic-commands) - Diagnostic tools
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md#getting-help) - How to get help

## 🎯 Documentation by Role

### I'm a User

**I want to use the extension:**

1. Start with [README.md](README.md)
2. Follow [QUICKSTART.md](QUICKSTART.md)
3. Explore [FEATURES.md](FEATURES.md)
4. Reference [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if needed

### I'm a Developer

**I want to modify or extend the extension:**

1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Study [ARCHITECTURE.md](ARCHITECTURE.md)
3. Follow [DEVELOPMENT.md](DEVELOPMENT.md)
4. Reference [TROUBLESHOOTING.md](TROUBLESHOOTING.md#development-issues)

### I'm a Contributor

**I want to contribute to the project:**

1. Review [README.md](README.md#contributing)
2. Read [DEVELOPMENT.md](DEVELOPMENT.md)
3. Check [CHANGELOG.md](CHANGELOG.md) for planned features
4. Follow code style in [DEVELOPMENT.md](DEVELOPMENT.md#code-style-guidelines)

## 📋 Quick Reference

### File Structure

```
NPM-JS/
├── Documentation
│   ├── INDEX.md              ← You are here
│   ├── README.md             ← User guide
│   ├── QUICKSTART.md         ← Getting started
│   ├── FEATURES.md           ← Visual guide
│   ├── ARCHITECTURE.md       ← Technical design
│   ├── DEVELOPMENT.md        ← Developer guide
│   ├── TROUBLESHOOTING.md    ← Problem solving
│   ├── CHANGELOG.md          ← Version history
│   └── PROJECT_SUMMARY.md    ← Project overview
│
├── Source Code
│   └── src/                  ← TypeScript source
│
├── Configuration
│   ├── package.json          ← Extension manifest
│   ├── tsconfig.json         ← TypeScript config
│   └── .vscode/              ← VS Code settings
│
└── Testing
    └── test-workspace/       ← Test environment
```

### Key Commands

| Command | Description | Documentation |
|---------|-------------|---------------|
| `F5` | Launch Extension Development Host | [QUICKSTART.md](QUICKSTART.md#step-1-open-extension-development-host) |
| `Ctrl+R` | Reload extension | [DEVELOPMENT.md](DEVELOPMENT.md#4-reload) |
| `npm run compile` | Compile TypeScript | [DEVELOPMENT.md](DEVELOPMENT.md#2-compile) |
| `npm run watch` | Watch mode | [DEVELOPMENT.md](DEVELOPMENT.md#2-compile) |
| `vsce package` | Create .vsix | [README.md](README.md#building-vsix-package) |

### Extension Commands

| Command | Description | Documentation |
|---------|-------------|---------------|
| Refresh Scripts | Reload all scripts | [README.md](README.md#commands) |
| Run Script | Execute selected script | [FEATURES.md](FEATURES.md#6-script-execution) |
| Add to Favorites | Mark as favorite | [FEATURES.md](FEATURES.md#2-favorites-panel) |
| Remove from Favorites | Unmark favorite | [FEATURES.md](FEATURES.md#2-favorites-panel) |
| Filter Scripts | Search scripts | [FEATURES.md](FEATURES.md#5-filter-feature) |
| Clear Filter | Remove filter | [FEATURES.md](FEATURES.md#5-filter-feature) |

## 🔍 Search by Topic

### Scripts

- [Viewing scripts](README.md#viewing-scripts)
- [Running scripts](README.md#running-scripts)
- [Script execution](FEATURES.md#6-script-execution)
- [Scripts not showing](TROUBLESHOOTING.md#no-scripts-showing)

### Favorites

- [Managing favorites](README.md#managing-favorites)
- [Favorites panel](FEATURES.md#2-favorites-panel)
- [Favorites not persisting](TROUBLESHOOTING.md#favorites-not-persisting)
- [Favorites manager](ARCHITECTURE.md#3-favoritesmanager)

### Filtering

- [Filtering scripts](README.md#filtering-scripts)
- [Filter feature](FEATURES.md#5-filter-feature)
- [Filter not working](TROUBLESHOOTING.md#filter-not-working)

### Monorepo

- [Monorepo support](README.md#monorepo-support)
- [Monorepo view](FEATURES.md#monorepo-view-multiple-packagejson)
- [Multiple folders](TROUBLESHOOTING.md#monorepo-not-showing-multiple-folders)

### Development

- [Project structure](DEVELOPMENT.md#project-structure)
- [Adding features](DEVELOPMENT.md#adding-new-features)
- [Architecture](ARCHITECTURE.md)
- [Development issues](TROUBLESHOOTING.md#development-issues)

## 📊 Documentation Statistics

- **Total Documents**: 9 files
- **Total Lines**: ~2,500 lines
- **Topics Covered**: 50+
- **Code Examples**: 30+
- **Diagrams**: 2

## 🎓 Learning Path

### Beginner Path

1. [README.md](README.md) - Understand what the extension does
2. [QUICKSTART.md](QUICKSTART.md) - Test it yourself
3. [FEATURES.md](FEATURES.md) - Learn all features
4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solve common issues

### Advanced Path

1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete overview
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the design
3. [DEVELOPMENT.md](DEVELOPMENT.md) - Learn to develop
4. [CHANGELOG.md](CHANGELOG.md) - See future plans

## 🔗 External Resources

### VS Code Extension Development

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [TreeView API](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript with VS Code](https://code.visualstudio.com/docs/languages/typescript)

### NPM

- [NPM Scripts Documentation](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [package.json Reference](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

## 💡 Tips

### For Quick Answers

- Use `Ctrl+F` to search within documents
- Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
- Look at [FEATURES.md](FEATURES.md) for visual examples

### For Deep Understanding

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Study source code in `src/` directory
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for patterns

### For Contributing

- Check [CHANGELOG.md](CHANGELOG.md) for planned features
- Follow [DEVELOPMENT.md](DEVELOPMENT.md) guidelines
- Test thoroughly using [QUICKSTART.md](QUICKSTART.md)

## 📞 Getting Help

1. **Check Documentation**: Use this index to find relevant docs
2. **Search Issues**: Look for similar problems on GitHub
3. **Create Issue**: Provide details from [TROUBLESHOOTING.md](TROUBLESHOOTING.md#information-to-include)
4. **Ask Community**: Stack Overflow with `vscode-extension` tag

## ✅ Next Steps

**Ready to get started?**

→ Go to [QUICKSTART.md](QUICKSTART.md) and press `F5`!

**Want to understand the code?**

→ Read [ARCHITECTURE.md](ARCHITECTURE.md) first!

**Need help?**

→ Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)!

---

**Last Updated**: 2025-01-04  
**Version**: 0.0.1  
**Status**: Complete and Ready

---

*This documentation is comprehensive and covers all aspects of the NPM Script Manager extension. Use this index to navigate efficiently!*

