import * as vscode from 'vscode';
import { GitCommand } from './types';
import { GitCommandManager } from './gitCommandManager';

/**
 * Git 命令树项
 */
export class GitCommandTreeItem extends vscode.TreeItem {
    constructor(
        public readonly gitCommand: GitCommand,
        public readonly isFavorite: boolean = false
    ) {
        super(gitCommand.name, vscode.TreeItemCollapsibleState.None);

        // 设置提示信息
        this.tooltip = `${gitCommand.command}\n\n${gitCommand.description || ''}`;
        // 设置描述（显示在树项右侧）
        this.description = gitCommand.command;

        // 设置上下文值（用于菜单显示）
        if (isFavorite) {
            this.contextValue = 'favoriteGitCommand';
        } else {
            this.contextValue = gitCommand.isCustom ? 'customGitCommand' : 'presetGitCommand';
        }

        // 使用图标：收藏的显示星星，否则显示 Git 图标
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

        // 点击执行 Git 命令
        // 注意：这里的 this.command 是 TreeItem 的 command 属性
        // gitCommand 是我们的 GitCommand 对象
        this.command = {
            command: 'scriptButler.runGitCommand',  // VS Code 命令 ID
            title: '执行 Git 命令',
            arguments: [this.gitCommand]  // 传递 GitCommand 对象
        };
    }
}

/**
 * 提供 Git 命令树视图数据
 */
export class GitCommandTreeProvider implements vscode.TreeDataProvider<GitCommandTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<GitCommandTreeItem | undefined | null | void> = 
        new vscode.EventEmitter<GitCommandTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<GitCommandTreeItem | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    constructor(
        private gitCommandManager: GitCommandManager
    ) {}

    /**
     * 刷新树视图
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * 获取树项
     */
    getTreeItem(element: GitCommandTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * 获取子项
     */
    async getChildren(element?: GitCommandTreeItem): Promise<GitCommandTreeItem[]> {
        if (element) {
            return [];
        }

        const commands = this.gitCommandManager.getAllCommands();

        if (commands.length === 0) {
            return [];
        }

        return commands.map(cmd => new GitCommandTreeItem(cmd));
    }
}

