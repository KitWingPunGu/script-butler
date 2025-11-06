import * as vscode from 'vscode';
import { GitCommand } from './types';

/**
 * 存储键
 */
const GIT_COMMANDS_STORAGE_KEY = 'scriptButler.gitCommands';

/**
 * 预置的 Git 命令
 */
const PRESET_GIT_COMMANDS: GitCommand[] = [
    // === 核心常用命令 ===
    {
        id: 'git-status',
        name: 'Git Status',
        command: 'git status',
        description: '查看工作区状态 - 显示已修改、已暂存和未跟踪的文件',
        isCustom: false
    },
    {
        id: 'git-add-all',
        name: 'Git Add (全部)',
        command: 'git add .',
        description: '暂存所有更改 - 将当前目录下所有修改添加到暂存区',
        isCustom: false
    },
    {
        id: 'git-commit',
        name: 'Git Commit',
        command: 'git commit -m "update"',
        description: '提交更改 - 将暂存区的修改提交到本地仓库',
        isCustom: false
    },
    {
        id: 'git-commit-amend',
        name: 'Git Commit (修改)',
        command: 'git commit --amend --no-edit',
        description: '修改最后一次提交 - 将暂存区的修改合并到上次提交',
        isCustom: false
    },
    {
        id: 'git-pull',
        name: 'Git Pull',
        command: 'git pull',
        description: '拉取远程更新 - 获取并合并远程分支的最新代码',
        isCustom: false
    },
    {
        id: 'git-pull-rebase',
        name: 'Git Pull (Rebase)',
        command: 'git pull --rebase',
        description: '拉取并变基 - 使用 rebase 方式合并远程更新',
        isCustom: false
    },
    {
        id: 'git-push',
        name: 'Git Push',
        command: 'git push',
        description: '推送到远程仓库 - 将本地提交推送到远程分支',
        isCustom: false
    },
    {
        id: 'git-fetch',
        name: 'Git Fetch',
        command: 'git fetch --all --prune',
        description: '获取远程更新 - 下载所有远程分支并清理已删除的引用',
        isCustom: false
    },
    {
        id: 'git-log',
        name: 'Git Log (简洁)',
        command: 'git log --oneline -10',
        description: '查看最近 10 条提交记录 - 单行简洁格式',
        isCustom: false
    },
    {
        id: 'git-diff',
        name: 'Git Diff (工作区)',
        command: 'git diff',
        description: '查看工作区未暂存的修改 - 对比工作区与暂存区',
        isCustom: false
    },

    // === 历史与对比 ===
    {
        id: 'git-log-graph',
        name: 'Git Log (图形)',
        command: 'git log --oneline --graph --all -20',
        description: '查看提交历史图形 - 显示分支合并关系',
        isCustom: false
    },
    {
        id: 'git-diff-staged',
        name: 'Git Diff (暂存区)',
        command: 'git diff --staged',
        description: '查看已暂存的修改 - 对比暂存区与最新提交',
        isCustom: false
    },
    {
        id: 'git-show',
        name: 'Git Show',
        command: 'git show HEAD',
        description: '查看最新提交详情 - 显示最后一次提交的完整信息',
        isCustom: false
    },
    {
        id: 'git-reflog',
        name: 'Git Reflog',
        command: 'git reflog -10',
        description: '查看引用日志 - 显示最近 10 次 HEAD 的变化记录',
        isCustom: false
    },

    // === 分支与协作 ===
    {
        id: 'git-branch',
        name: 'Git Branch (所有)',
        command: 'git branch -a',
        description: '查看所有分支 - 包括本地和远程分支',
        isCustom: false
    },
    {
        id: 'git-branch-verbose',
        name: 'Git Branch (详细)',
        command: 'git branch -vv',
        description: '查看分支详细信息 - 显示最新提交和跟踪关系',
        isCustom: false
    },
    {
        id: 'git-checkout-main',
        name: 'Checkout Main',
        command: 'git checkout main',
        description: '切换到 main 分支 - 切换工作区到主分支',
        isCustom: false
    },
    {
        id: 'git-checkout-master',
        name: 'Checkout Master',
        command: 'git checkout master',
        description: '切换到 master 分支 - 切换工作区到主分支',
        isCustom: false
    },
    {
        id: 'git-merge',
        name: 'Git Merge',
        command: 'git merge --no-ff',
        description: '合并分支 - 使用非快进方式合并分支',
        isCustom: false
    },
    {
        id: 'git-push-upstream',
        name: 'Git Push (设置上游)',
        command: 'git push -u origin master',
        description: '推送并设置上游分支 - 首次推送 master 分支到远程',
        isCustom: false
    },
    {
        id: 'git-push-force',
        name: 'Git Push (强制)',
        command: 'git push --force-with-lease',
        description: '强制推送 - 安全的强制推送，避免覆盖他人提交',
        isCustom: false
    },
    {
        id: 'git-remote',
        name: 'Git Remote',
        command: 'git remote -v',
        description: '查看远程仓库 - 显示所有远程仓库的 URL',
        isCustom: false
    },
    {
        id: 'git-tag',
        name: 'Git Tag',
        command: 'git tag',
        description: '查看所有标签 - 列出仓库中的所有 tag',
        isCustom: false
    },

    // === Stash 操作 ===
    {
        id: 'git-stash',
        name: 'Git Stash (保存)',
        command: 'git stash',
        description: '暂存当前更改 - 保存工作区和暂存区的修改到堆栈',
        isCustom: false
    },
    {
        id: 'git-stash-save',
        name: 'Git Stash (带说明)',
        command: 'git stash save "临时保存"',
        description: '暂存并添加说明 - 保存修改并添加描述信息',
        isCustom: false
    },
    {
        id: 'git-stash-pop',
        name: 'Git Stash Pop',
        command: 'git stash pop',
        description: '恢复暂存的更改 - 应用最近的 stash 并从堆栈中删除',
        isCustom: false
    },
    {
        id: 'git-stash-list',
        name: 'Git Stash List',
        command: 'git stash list',
        description: '查看 stash 列表 - 显示所有已保存的 stash',
        isCustom: false
    },
    {
        id: 'git-stash-clear',
        name: 'Git Stash Clear',
        command: 'git stash clear',
        description: '清空 stash 堆栈 - 删除所有已保存的 stash',
        isCustom: false
    },

    // === 清理与撤销 ===
    {
        id: 'git-reset-soft',
        name: 'Git Reset (软重置)',
        command: 'git reset --soft HEAD~1',
        description: '撤销最后一次提交 - 保留修改在暂存区',
        isCustom: false
    },
    {
        id: 'git-reset-hard',
        name: 'Git Reset (硬重置)',
        command: 'git reset --hard HEAD',
        description: '重置到最新提交 - 丢弃所有未提交的修改（危险操作）',
        isCustom: false
    },
    {
        id: 'git-clean',
        name: 'Git Clean',
        command: 'git clean -fd',
        description: '清理未跟踪文件 - 删除工作区中未被 Git 跟踪的文件和目录',
        isCustom: false
    }
];

/**
 * 管理 Git 命令
 */
export class GitCommandManager {
    private customCommands: GitCommand[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadCustomCommands();
    }

    /**
     * 从持久化存储加载自定义命令
     */
    private loadCustomCommands(): void {
        const stored = this.context.globalState.get<GitCommand[]>(GIT_COMMANDS_STORAGE_KEY, []);
        this.customCommands = stored;
    }

    /**
     * 保存自定义命令到持久化存储
     */
    private async saveCustomCommands(): Promise<void> {
        await this.context.globalState.update(GIT_COMMANDS_STORAGE_KEY, this.customCommands);
    }

    /**
     * 获取所有 Git 命令（预置 + 自定义）
     */
    getAllCommands(): GitCommand[] {
        return [...PRESET_GIT_COMMANDS, ...this.customCommands];
    }

    /**
     * 获取预置命令
     */
    getPresetCommands(): GitCommand[] {
        return [...PRESET_GIT_COMMANDS];
    }

    /**
     * 获取自定义命令
     */
    getCustomCommands(): GitCommand[] {
        return [...this.customCommands];
    }

    /**
     * 添加自定义命令
     */
    async addCustomCommand(name: string, command: string, description?: string): Promise<GitCommand> {
        const id = `custom-${Date.now()}`;
        const newCommand: GitCommand = {
            id,
            name,
            command,
            description,
            isCustom: true
        };

        this.customCommands.push(newCommand);
        await this.saveCustomCommands();

        return newCommand;
    }

    /**
     * 删除自定义命令
     */
    async removeCustomCommand(id: string): Promise<boolean> {
        const index = this.customCommands.findIndex(cmd => cmd.id === id);
        
        if (index !== -1) {
            this.customCommands.splice(index, 1);
            await this.saveCustomCommands();
            return true;
        }

        return false;
    }

    /**
     * 更新自定义命令
     */
    async updateCustomCommand(id: string, updates: Partial<GitCommand>): Promise<boolean> {
        const command = this.customCommands.find(cmd => cmd.id === id);
        
        if (command) {
            Object.assign(command, updates);
            await this.saveCustomCommands();
            return true;
        }

        return false;
    }

    /**
     * 根据 ID 获取命令
     */
    getCommandById(id: string): GitCommand | undefined {
        return this.getAllCommands().find(cmd => cmd.id === id);
    }

    /**
     * 清空所有自定义命令
     */
    async clearCustomCommands(): Promise<void> {
        this.customCommands = [];
        await this.saveCustomCommands();
    }
}

