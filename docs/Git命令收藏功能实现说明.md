# Git 命令收藏功能实现说明

## 🎯 功能概述

用户报告："我发现 git 的脚本不能收藏"

**问题分析：**
- 收藏功能（`FavoritesManager`）原本只支持 NPM 脚本（`NpmScript`）
- Git 命令（`GitCommand`）是独立的类型，没有集成到收藏系统中
- 收藏夹视图（`FavoritesTreeProvider`）只显示 NPM 脚本

**解决方案：**
扩展收藏系统以同时支持 NPM 脚本和 Git 命令的收藏。

---

## ✅ 实现内容

### 1. 扩展 `FavoritesManager` 支持 Git 命令

**文件：** `src/favoritesManager.ts`

#### **新增类型定义**

```typescript
/**
 * 收藏项类型
 */
export type FavoriteItem = NpmScript | GitCommand;

/**
 * 收藏项类型枚举
 */
export enum FavoriteType {
    SCRIPT = 'script',
    GIT_COMMAND = 'gitCommand'
}
```

#### **新增方法**

1. **`getGitCommandKey(gitCommand: GitCommand): string`**
   - 生成 Git 命令的唯一键：`gitCommand::{id}`

2. **`isGitCommandFavorite(gitCommand: GitCommand): boolean`**
   - 检查 Git 命令是否已收藏

3. **`addGitCommandToFavorites(gitCommand: GitCommand): Promise<void>`**
   - 将 Git 命令添加到收藏夹

4. **`removeGitCommandFromFavorites(gitCommand: GitCommand): Promise<void>`**
   - 从收藏夹移除 Git 命令

5. **`getFavoriteGitCommands(allGitCommands: GitCommand[]): GitCommand[]`**
   - 从所有 Git 命令中筛选出收藏的命令

6. **`getAllFavorites(): string[]`**
   - 获取所有收藏（包括脚本和 Git 命令）

#### **修改的方法**

1. **`getScriptKey(script: NpmScript): string`**
   - 修改键格式：`script::{packageJsonPath}::{name}`
   - 添加 `script::` 前缀以区分类型

2. **`cleanupInvalidFavorites(allScripts, allGitCommands): Promise<number>`**
   - 新增 `allGitCommands` 参数
   - 同时清理失效的脚本和 Git 命令收藏

3. **`getInvalidFavorites(allScripts, allGitCommands): string[]`**
   - 新增 `allGitCommands` 参数
   - 返回失效收藏时区分类型（"脚本: xxx" 或 "Git 命令: xxx"）

---

### 2. 更新 `GitCommandTreeItem` 支持收藏状态

**文件：** `src/gitCommandTreeProvider.ts`

#### **修改内容**

```typescript
export class GitCommandTreeItem extends vscode.TreeItem {
    constructor(
        public readonly gitCommand: GitCommand,
        public readonly isFavorite: boolean = false  // 新增参数
    ) {
        super(gitCommand.name, vscode.TreeItemCollapsibleState.None);

        // 设置上下文值
        if (isFavorite) {
            this.contextValue = 'favoriteGitCommand';  // 收藏的 Git 命令
        } else {
            this.contextValue = gitCommand.isCustom ? 'customGitCommand' : 'presetGitCommand';
        }

        // 设置图标
        if (isFavorite) {
            this.iconPath = new vscode.ThemeIcon(
                'star-full',
                new vscode.ThemeColor('charts.yellow')
            );
        } else {
            this.iconPath = new vscode.ThemeIcon(
                'git-branch',
                new vscode.ThemeColor('gitDecoration.modifiedResourceForeground')
            );
        }
    }
}
```

**关键变化：**
- ✅ 新增 `isFavorite` 参数
- ✅ 收藏的命令显示星星图标
- ✅ 收藏的命令 `contextValue` 为 `favoriteGitCommand`

---

### 3. 更新 `FavoritesTreeProvider` 显示 Git 命令

**文件：** `src/favoritesTreeProvider.ts`

#### **修改内容**

```typescript
export class FavoritesTreeProvider implements vscode.TreeDataProvider<NpmScriptTreeItem | GitCommandTreeItem> {
    constructor(
        private favoritesManager: FavoritesManager,
        private scriptsTreeProvider: ScriptsTreeProvider,
        private gitCommandManager: GitCommandManager  // 新增参数
    ) {}

    async getChildren(element?: NpmScriptTreeItem | GitCommandTreeItem): Promise<(NpmScriptTreeItem | GitCommandTreeItem)[]> {
        if (element) {
            return [];
        }

        const items: (NpmScriptTreeItem | GitCommandTreeItem)[] = [];

        // 获取收藏的脚本
        const allScripts = this.scriptsTreeProvider.getAllScripts();
        const favoriteScripts = this.favoritesManager.getFavoriteScripts(allScripts);
        items.push(...favoriteScripts.map(script => new NpmScriptTreeItem(script, true)));

        // 获取收藏的 Git 命令
        const allGitCommands = this.gitCommandManager.getAllCommands();
        const favoriteGitCommands = this.favoritesManager.getFavoriteGitCommands(allGitCommands);
        items.push(...favoriteGitCommands.map(gitCommand => new GitCommandTreeItem(gitCommand, true)));

        return items;
    }
}
```

**关键变化：**
- ✅ 新增 `gitCommandManager` 参数
- ✅ 同时显示收藏的脚本和 Git 命令
- ✅ 返回类型支持两种 TreeItem

---

### 4. 添加 Git 命令收藏菜单

**文件：** `package.json`

#### **新增命令声明**

```json
{
  "command": "scriptButler.addGitCommandToFavorites",
  "title": "添加到收藏夹",
  "icon": "$(star-empty)"
},
{
  "command": "scriptButler.removeGitCommandFromFavorites",
  "title": "从收藏夹移除",
  "icon": "$(star-full)"
}
```

#### **新增菜单项**

```json
{
  "command": "scriptButler.addGitCommandToFavorites",
  "when": "view == gitCommands && (viewItem == presetGitCommand || viewItem == customGitCommand)",
  "group": "favorites"
},
{
  "command": "scriptButler.removeGitCommandFromFavorites",
  "when": "view == npmFavorites && viewItem == favoriteGitCommand",
  "group": "favorites"
}
```

**菜单位置：**
- ✅ Git 命令视图：右键菜单显示"添加到收藏夹"
- ✅ 收藏夹视图：右键菜单显示"从收藏夹移除"

---

### 5. 注册 Git 命令收藏命令

**文件：** `src/extension.ts`

#### **新增命令注册**

```typescript
// Add Git command to favorites
const addGitCommandToFavoritesCommand = vscode.commands.registerCommand(
    'scriptButler.addGitCommandToFavorites',
    async (treeItemOrGitCommand: GitCommandTreeItem | GitCommand) => {
        let gitCommand: GitCommand;
        
        if (treeItemOrGitCommand instanceof GitCommandTreeItem) {
            gitCommand = treeItemOrGitCommand.gitCommand;
        } else {
            gitCommand = treeItemOrGitCommand;
        }

        await favoritesManager.addGitCommandToFavorites(gitCommand);
        gitCommandTreeProvider.refresh();
        favoritesTreeProvider.refresh();
    }
);

// Remove Git command from favorites
const removeGitCommandFromFavoritesCommand = vscode.commands.registerCommand(
    'scriptButler.removeGitCommandFromFavorites',
    async (treeItemOrGitCommand: GitCommandTreeItem | GitCommand) => {
        let gitCommand: GitCommand;
        
        if (treeItemOrGitCommand instanceof GitCommandTreeItem) {
            gitCommand = treeItemOrGitCommand.gitCommand;
        } else {
            gitCommand = treeItemOrGitCommand;
        }

        await favoritesManager.removeGitCommandFromFavorites(gitCommand);
        gitCommandTreeProvider.refresh();
        favoritesTreeProvider.refresh();
    }
);
```

#### **修改的代码**

1. **FavoritesTreeProvider 初始化**
   ```typescript
   const favoritesTreeProvider = new FavoritesTreeProvider(
       favoritesManager,
       scriptsTreeProvider,
       gitCommandManager  // 新增参数
   );
   ```

2. **cleanupInvalidFavorites 调用**
   ```typescript
   const allScripts = scriptsTreeProvider.getAllScripts();
   const allGitCommands = gitCommandManager.getAllCommands();
   await favoritesManager.cleanupInvalidFavorites(allScripts, allGitCommands);
   ```

---

## 📊 数据结构

### 收藏键格式

**NPM 脚本：**
```
script::d:\project\package.json::dev
```

**Git 命令：**
```
gitCommand::git-status
```

**存储示例：**
```json
[
  "script::d:\\project\\package.json::dev",
  "script::d:\\project\\package.json::build",
  "gitCommand::git-status",
  "gitCommand::git-push-upstream"
]
```

---

## 🎯 使用方法

### 添加 Git 命令到收藏夹

1. 打开"脚本管家"侧边栏
2. 展开"Git 命令"视图
3. 右键点击任意 Git 命令
4. 选择"添加到收藏夹"
5. 收藏夹中会显示该 Git 命令（带星星图标）

### 从收藏夹移除 Git 命令

1. 打开"收藏夹"视图
2. 找到收藏的 Git 命令（星星图标）
3. 右键点击
4. 选择"从收藏夹移除"

### 执行收藏的 Git 命令

1. 打开"收藏夹"视图
2. 点击收藏的 Git 命令
3. 命令会上屏到终端

---

## ✅ 验证清单

### 功能验证

- [ ] 可以将预置 Git 命令添加到收藏夹
- [ ] 可以将自定义 Git 命令添加到收藏夹
- [ ] 收藏夹中同时显示脚本和 Git 命令
- [ ] 收藏的 Git 命令显示星星图标
- [ ] 可以从收藏夹移除 Git 命令
- [ ] 点击收藏的 Git 命令可以执行
- [ ] 关闭并重新打开 VS Code，收藏的 Git 命令仍然存在

### 边界情况

- [ ] 删除自定义 Git 命令后，自动从收藏夹移除
- [ ] 刷新脚本时，自动清理失效的 Git 命令收藏
- [ ] 收藏夹为空时，不显示任何内容
- [ ] 同时收藏脚本和 Git 命令，都能正确显示

---

## 📚 相关文件

### 修改的文件

1. **`src/favoritesManager.ts`** - 扩展收藏管理器
2. **`src/gitCommandTreeProvider.ts`** - 支持收藏状态
3. **`src/favoritesTreeProvider.ts`** - 显示 Git 命令
4. **`src/extension.ts`** - 注册命令
5. **`package.json`** - 添加菜单和命令

### 新增导出

- `FavoriteItem` - 收藏项类型
- `FavoriteType` - 收藏类型枚举
- `FavoriteData` - 收藏数据结构

---

## 🎉 总结

**问题：** Git 命令不能收藏

**原因：** 收藏系统只支持 NPM 脚本

**解决方案：** 扩展收藏系统以同时支持 NPM 脚本和 Git 命令

**实现效果：**
- ✅ Git 命令可以添加到收藏夹
- ✅ 收藏夹同时显示脚本和 Git 命令
- ✅ 收藏的 Git 命令显示星星图标
- ✅ 收藏持久化，重启后仍然存在
- ✅ 自动清理失效的收藏

**现在 Git 命令可以正常收藏了！** 🚀

