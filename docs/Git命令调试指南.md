# Git 命令调试指南

## 🐛 当前问题

**症状：** 点击 Git 命令后，通知显示 "Git 命令已上屏: [object Object]"

**说明：** 这表明传递给 `showInformationMessage` 的参数是一个对象而不是字符串。

---

## 🔍 调试步骤

### **步骤 1：启动调试环境**

1. **在主 VS Code 窗口中按 `F5`** 启动扩展开发主机
2. **在扩展开发主机窗口中按 `Ctrl+Shift+I`** 打开开发者工具
3. **切换到 Console 标签**
4. **打开 test-workspace 文件夹**
5. **打开脚本管家侧边栏**（点击 NPM 图标 📦）

### **步骤 2：触发问题并查看日志**

1. **在"Git 命令"面板中点击 "Git Status"**

2. **在控制台中查找以下日志：**

```javascript
// 应该看到这些日志：
runGitCommand called with: {id: "git-status", name: "Git Status", command: "git status", ...}
gitCommand.command: git status
gitCommand.name: Git Status
executeGitCommand called
command type: string value: git status
name type: string value: Git Status
```

3. **分析日志输出：**

| 日志内容 | 说明 | 问题诊断 |
|---------|------|---------|
| `command type: string` | ✅ 正常 | 参数类型正确 |
| `command type: object` | ❌ 错误 | 传递了整个对象而不是字符串 |
| `command value: git status` | ✅ 正常 | 参数值正确 |
| `command value: [object Object]` | ❌ 错误 | 参数是对象 |
| `command value: undefined` | ❌ 错误 | 属性访问失败 |

### **步骤 3：根据日志定位问题**

#### **情况 A：`command type: object`**

**问题：** `extension.ts` 中传递了整个 `gitCommand` 对象而不是 `gitCommand.command`

**检查：** `src/extension.ts` 第 289 行
```typescript
// ❌ 错误
await scriptExecutor.executeGitCommand(gitCommand, gitCommand.name);

// ✅ 正确
await scriptExecutor.executeGitCommand(gitCommand.command, gitCommand.name);
```

#### **情况 B：`command value: undefined`**

**问题：** `gitCommand` 对象没有 `command` 属性

**检查：** `src/gitCommandManager.ts` 中的预置命令定义
```typescript
// 确保每个命令都有 command 属性
{
    id: 'git-status',
    name: 'Git Status',
    command: 'git status',  // ← 必须存在
    description: '查看工作区状态',
    isCustom: false
}
```

#### **情况 C：日志没有输出**

**问题：** 命令没有被触发

**检查：**
1. `package.json` 中是否注册了 `scriptButler.runGitCommand` 命令
2. `gitCommandTreeProvider.ts` 中 TreeItem 的 command 配置是否正确

---

## ✅ 已实施的修复

### **修复 1：添加调试日志**

**文件：** `src/extension.ts`

```typescript
const runGitCommandCommand = vscode.commands.registerCommand(
    'scriptButler.runGitCommand',
    async (gitCommand: GitCommand) => {
        console.log('runGitCommand called with:', gitCommand);
        console.log('gitCommand.command:', gitCommand.command);
        console.log('gitCommand.name:', gitCommand.name);
        
        if (!gitCommand || !gitCommand.command) {
            vscode.window.showErrorMessage('无效的 Git 命令对象');
            return;
        }
        
        await scriptExecutor.executeGitCommand(gitCommand.command, gitCommand.name);
    }
);
```

### **修复 2：添加类型转换和调试**

**文件：** `src/scriptExecutor.ts`

```typescript
async executeGitCommand(command: string, name: string): Promise<void> {
    console.log('executeGitCommand called');
    console.log('command type:', typeof command, 'value:', command);
    console.log('name type:', typeof name, 'value:', name);
    
    if (!command) {
        vscode.window.showErrorMessage('Git 命令不能为空');
        return;
    }
    
    // 强制类型转换，确保是字符串
    const commandStr = String(command);
    const nameStr = String(name);

    const terminalName = `Git: ${nameStr}`;
    
    // ... 终端创建逻辑 ...
    
    terminal.show();
    terminal.sendText(commandStr, false);
    
    vscode.window.showInformationMessage(`Git 命令已上屏: ${commandStr}`);
}
```

### **修复 3：添加注释说明**

**文件：** `src/gitCommandTreeProvider.ts`

```typescript
// 点击执行 Git 命令
// 注意：这里的 this.command 是 TreeItem 的 command 属性
// gitCommand 是我们的 GitCommand 对象
this.command = {
    command: 'scriptButler.runGitCommand',  // VS Code 命令 ID
    title: '执行 Git 命令',
    arguments: [this.gitCommand]  // 传递 GitCommand 对象
};
```

---

## 🧪 测试验证

### **预期结果：**

1. **控制台日志：**
   ```
   runGitCommand called with: {id: "git-status", name: "Git Status", command: "git status", ...}
   gitCommand.command: git status
   gitCommand.name: Git Status
   executeGitCommand called
   command type: string value: git status
   name type: string value: Git Status
   ```

2. **通知消息：**
   ```
   Git 命令已上屏: git status
   ```

3. **终端显示：**
   ```bash
   git status
   ```
   （光标在命令后面，等待用户按回车）

### **如果仍然显示 "[object Object]"：**

请将控制台的完整日志输出发送给我，包括：
- `runGitCommand called with:` 后面的对象内容
- `gitCommand.command:` 的值
- `command type:` 和 `command value:` 的值

这将帮助我们精确定位问题所在。

---

## 📝 可能的根本原因

### **原因 1：参数传递错误**

```typescript
// ❌ 错误：传递了整个对象
await scriptExecutor.executeGitCommand(gitCommand, gitCommand.name);

// ✅ 正确：传递字符串属性
await scriptExecutor.executeGitCommand(gitCommand.command, gitCommand.name);
```

### **原因 2：对象属性不存在**

```typescript
// 如果 gitCommand.command 是 undefined
console.log(gitCommand.command);  // undefined
String(undefined);  // "undefined"
```

### **原因 3：TreeItem 参数传递问题**

```typescript
// ❌ 错误：传递了 TreeItem 而不是 GitCommand
arguments: [this]

// ✅ 正确：传递 GitCommand 对象
arguments: [this.gitCommand]
```

---

## 🎯 下一步行动

1. **按 F5 启动扩展**
2. **打开开发者工具（Ctrl+Shift+I）**
3. **点击 Git Status 命令**
4. **查看控制台日志**
5. **根据日志输出判断问题**

如果问题仍然存在，请提供：
- ✅ 完整的控制台日志
- ✅ 通知消息的截图
- ✅ 终端的截图

这将帮助我们快速定位并解决问题！

---

**编译状态：** ✅ 已编译成功，可以开始调试

