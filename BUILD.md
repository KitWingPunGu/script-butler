# 快速构建指南

## 🚀 快速开始

### Windows 用户

双击运行：
```
build.bat
```

### Linux/Mac 用户

```bash
chmod +x build.sh
./build.sh
```

---

## 📦 手动构建

### 1. 安装依赖

```bash
npm install
```

### 2. 编译

```bash
npm run compile
```

### 3. 打包

```bash
npm run package
```

这会生成一个 `.vsix` 文件，例如 `script-butler-1.0.0.vsix`

### 4. 安装

```bash
code --install-extension script-butler-1.0.0.vsix
```

---

## 🔧 可用的 npm 脚本

```bash
# 编译 TypeScript
npm run compile

# 监听文件变化并自动编译
npm run watch

# 打包扩展
npm run package

# 发布到 Marketplace
npm run publish

# 一键构建（编译 + 打包）
npm run build

# 运行 ESLint
npm run lint

# 运行测试
npm run test
```

---

## 📋 构建前准备

### 1. 安装 vsce

```bash
npm install -g @vscode/vsce
```

### 2. 修改 package.json

更新以下字段：

```json
{
  "publisher": "your-publisher-name",
  "author": "Your Name",
  "repository": {
    "url": "https://github.com/your-username/script-butler"
  }
}
```

### 3. 准备图标（可选）

将 128x128 的 PNG 图标放在：
```
resources/icon.png
```

---

## 🐛 常见问题

### vsce 命令找不到

```bash
npm install -g @vscode/vsce
```

### 编译错误

```bash
# 清理并重新安装依赖
rm -rf node_modules
npm install
npm run compile
```

### 打包失败

确保：
- ✅ TypeScript 编译成功（`out` 目录存在）
- ✅ `package.json` 中的信息完整
- ✅ 项目根目录有 `README.md`

---

## 📚 更多信息

查看完整的构建和发布指南：
- [docs/构建和发布指南.md](docs/构建和发布指南.md)

