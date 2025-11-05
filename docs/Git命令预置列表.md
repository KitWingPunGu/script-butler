# Git 命令预置列表

## 📋 概述

"脚本管家"扩展提供了 **30+ 个常用 Git 命令预置**，涵盖日常开发中的各种场景。所有命令都只会上屏到终端，不会自动执行，确保安全性。

---

## 📚 命令分类

### 🔍 基础查看命令 (7 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Git Status** | `git status` | 查看工作区状态 - 显示已修改、已暂存和未跟踪的文件 |
| **Git Log (简洁)** | `git log --oneline -10` | 查看最近 10 条提交记录 - 单行简洁格式 |
| **Git Log (图形)** | `git log --oneline --graph --all -20` | 查看提交历史图形 - 显示分支合并关系 |
| **Git Diff (工作区)** | `git diff` | 查看工作区未暂存的修改 - 对比工作区与暂存区 |
| **Git Diff (暂存区)** | `git diff --staged` | 查看已暂存的修改 - 对比暂存区与最新提交 |
| **Git Branch (所有)** | `git branch -a` | 查看所有分支 - 包括本地和远程分支 |
| **Git Branch (详细)** | `git branch -vv` | 查看分支详细信息 - 显示最新提交和跟踪关系 |

**使用场景：**
- 查看当前工作状态
- 检查提交历史
- 对比代码差异
- 查看分支信息

---

### 🌐 远程操作命令 (6 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Git Pull** | `git pull` | 拉取远程更新 - 获取并合并远程分支的最新代码 |
| **Git Pull (Rebase)** | `git pull --rebase` | 拉取并变基 - 使用 rebase 方式合并远程更新 |
| **Git Push** | `git push` | 推送到远程仓库 - 将本地提交推送到远程分支 |
| **Git Push (设置上游)** | `git push -u origin master` | 推送并设置上游分支 - 首次推送 master 分支到远程 ⭐ |
| **Git Push (强制)** | `git push --force-with-lease` | 强制推送 - 安全的强制推送，避免覆盖他人提交 |
| **Git Fetch** | `git fetch --all --prune` | 获取远程更新 - 下载所有远程分支并清理已删除的引用 |

**使用场景：**
- 同步远程代码
- 推送本地提交
- 首次推送新分支
- 强制更新远程分支

**⭐ 新增命令：**
- `git push -u origin master` - 首次推送 master 分支时使用，自动设置上游跟踪关系

---

### 💾 暂存和提交命令 (3 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Git Add (全部)** | `git add .` | 暂存所有更改 - 将当前目录下所有修改添加到暂存区 |
| **Git Commit** | `git commit -m "update"` | 提交更改 - 将暂存区的修改提交到本地仓库 |
| **Git Commit (修改)** | `git commit --amend --no-edit` | 修改最后一次提交 - 将暂存区的修改合并到上次提交 |

**使用场景：**
- 暂存文件修改
- 提交代码
- 修正最后一次提交

---

### 📦 Stash 命令 (5 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Git Stash (保存)** | `git stash` | 暂存当前更改 - 保存工作区和暂存区的修改到堆栈 |
| **Git Stash (带说明)** | `git stash save "临时保存"` | 暂存并添加说明 - 保存修改并添加描述信息 |
| **Git Stash Pop** | `git stash pop` | 恢复暂存的更改 - 应用最近的 stash 并从堆栈中删除 |
| **Git Stash List** | `git stash list` | 查看 stash 列表 - 显示所有已保存的 stash |
| **Git Stash Clear** | `git stash clear` | 清空 stash 堆栈 - 删除所有已保存的 stash |

**使用场景：**
- 临时保存未完成的工作
- 切换分支前保存修改
- 恢复之前保存的工作
- 管理 stash 堆栈

---

### 🌿 分支操作命令 (3 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Checkout Master** | `git checkout master` | 切换到 master 分支 - 切换工作区到主分支 |
| **Checkout Main** | `git checkout main` | 切换到 main 分支 - 切换工作区到主分支 |
| **Git Merge** | `git merge --no-ff` | 合并分支 - 使用非快进方式合并分支 |

**使用场景：**
- 切换到主分支
- 合并功能分支
- 保留分支历史

---

### ↩️ 撤销和重置命令 (3 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Git Reset (软重置)** | `git reset --soft HEAD~1` | 撤销最后一次提交 - 保留修改在暂存区 |
| **Git Reset (硬重置)** | `git reset --hard HEAD` | 重置到最新提交 - 丢弃所有未提交的修改（危险操作）⚠️ |
| **Git Clean** | `git clean -fd` | 清理未跟踪文件 - 删除工作区中未被 Git 跟踪的文件和目录 ⚠️ |

**使用场景：**
- 撤销错误的提交
- 重置工作区
- 清理临时文件

**⚠️ 危险操作：**
- `git reset --hard` 会永久删除未提交的修改
- `git clean -fd` 会永久删除未跟踪的文件
- 使用前请确认！

---

### 🔧 其他常用命令 (4 个)

| 命令名称 | Git 命令 | 说明 |
|---------|---------|------|
| **Git Remote** | `git remote -v` | 查看远程仓库 - 显示所有远程仓库的 URL |
| **Git Tag** | `git tag` | 查看所有标签 - 列出仓库中的所有 tag |
| **Git Show** | `git show HEAD` | 查看最新提交详情 - 显示最后一次提交的完整信息 |
| **Git Reflog** | `git reflog -10` | 查看引用日志 - 显示最近 10 次 HEAD 的变化记录 |

**使用场景：**
- 查看远程仓库配置
- 管理版本标签
- 查看提交详情
- 恢复误删的提交

---

## 🎯 常用工作流示例

### 工作流 1：日常开发流程

```bash
# 1. 查看当前状态
git status

# 2. 拉取最新代码
git pull

# 3. 暂存所有修改
git add .

# 4. 提交更改
git commit -m "update"

# 5. 推送到远程
git push
```

### 工作流 2：首次推送新分支

```bash
# 1. 查看当前分支
git branch -vv

# 2. 暂存并提交
git add .
git commit -m "initial commit"

# 3. 推送并设置上游分支 ⭐
git push -u origin master
```

### 工作流 3：临时切换分支

```bash
# 1. 保存当前工作
git stash save "临时保存"

# 2. 切换分支
git checkout main

# 3. 处理紧急任务...

# 4. 切换回原分支
git checkout feature-branch

# 5. 恢复工作
git stash pop
```

### 工作流 4：查看和对比代码

```bash
# 1. 查看工作区修改
git diff

# 2. 查看暂存区修改
git diff --staged

# 3. 查看提交历史
git log --oneline --graph --all -20

# 4. 查看最新提交详情
git show HEAD
```

### 工作流 5：撤销和重置

```bash
# 1. 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 2. 修改提交信息后重新提交
git commit -m "correct message"

# 3. 如果需要完全重置（危险！）
git reset --hard HEAD
```

---

## 💡 使用技巧

### 1. 命令只上屏不执行

所有 Git 命令都只会上屏到终端，不会自动执行。你可以：
- ✅ 查看命令内容
- ✅ 修改命令参数
- ✅ 按 Enter 手动执行
- ✅ 按 Ctrl+C 取消

### 2. 自定义命令

除了预置命令，你还可以添加自己的 Git 命令：
1. 点击 "Git 命令" 视图标题栏的 "+" 图标
2. 输入命令名称、命令和说明
3. 保存后即可使用

### 3. 快速访问

- 点击命令行本身：上屏到终端
- 点击右边的 ▶️ 图标：上屏到终端
- 两种方式效果相同

### 4. 查看命令说明

将鼠标悬停在命令上，可以看到完整的说明信息。

---

## 📊 命令统计

| 分类 | 命令数量 |
|------|---------|
| 基础查看命令 | 7 |
| 远程操作命令 | 6 |
| 暂存和提交命令 | 3 |
| Stash 命令 | 5 |
| 分支操作命令 | 3 |
| 撤销和重置命令 | 3 |
| 其他常用命令 | 4 |
| **总计** | **31** |

---

## 🆕 更新日志

### v1.1.0 (最新)

**新增命令：**
- ⭐ `git push -u origin master` - 推送并设置上游分支

**增强功能：**
- ✅ 所有命令添加详细说明
- ✅ 命令按功能分类
- ✅ 新增 Git Log (图形) 命令
- ✅ 新增 Git Diff (暂存区) 命令
- ✅ 新增 Git Branch (详细) 命令
- ✅ 新增 Git Pull (Rebase) 命令
- ✅ 新增 Git Push (强制) 命令
- ✅ 新增 Git Fetch 命令
- ✅ 新增 Git Add (全部) 命令
- ✅ 新增 Git Commit (修改) 命令
- ✅ 新增 Git Stash (带说明) 命令
- ✅ 新增 Git Stash List 命令
- ✅ 新增 Git Stash Clear 命令
- ✅ 新增 Checkout Main 命令
- ✅ 新增 Git Merge 命令
- ✅ 新增 Git Reset (软重置) 命令
- ✅ 新增 Git Reset (硬重置) 命令
- ✅ 新增 Git Clean 命令
- ✅ 新增 Git Remote 命令
- ✅ 新增 Git Tag 命令
- ✅ 新增 Git Show 命令
- ✅ 新增 Git Reflog 命令

**优化：**
- ✅ 命令说明更加详细和友好
- ✅ 添加使用场景说明
- ✅ 标注危险操作

---

## 📚 相关文档

- [Git 命令功能修复说明](./Git命令功能修复说明.md)
- [Git 命令 Inline 按钮修复说明](./Git命令Inline按钮修复说明.md)
- [扩展功能说明](./扩展功能说明.md)

---

## 🤝 贡献

如果你有常用的 Git 命令想要添加到预置列表，欢迎提出建议！

