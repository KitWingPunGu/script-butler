import * as vscode from 'vscode';
import { NpmScript, NpmScriptTreeItem, GitCommand } from './types';
import { HistoryManager, HistoryItem } from './historyManager';
import { TerminalMonitor } from './terminalMonitor';

/**
 * 历史记录树项
 */
class HistoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly historyItem: HistoryItem,
        private historyManager: HistoryManager
    ) {
        const isGit = historyItem.type === 'git';
        const name = isGit
            ? historyItem.gitCommand?.name || '未知命令'
            : historyItem.script?.name || '未知脚本';
        
        super(name, vscode.TreeItemCollapsibleState.None);
        
        const relativeTime = historyManager.formatRelativeTime(historyItem.timestamp);
        const execCount = historyItem.executionCount;
        
        if (isGit && historyItem.gitCommand) {
            this.tooltip = `${historyItem.gitCommand.command}\n\n` +
                          `类型: Git 命令\n` +
                          `执行时间: ${relativeTime}\n` +
                          `执行次数: ${execCount}`;
            
            this.description = `${relativeTime} (${execCount}次)`;
            this.contextValue = 'historyGitCommand';
            this.iconPath = new vscode.ThemeIcon('git-commit');
            
            this.command = {
                command: 'scriptButler.runGitCommand',
                title: '运行 Git 命令',
                arguments: [historyItem.gitCommand]
            };
        } else if (historyItem.script) {
            this.tooltip = `${historyItem.script.command}\n\n` +
                          `路径: ${historyItem.script.packageJsonPath}\n` +
                          `执行时间: ${relativeTime}\n` +
                          `执行次数: ${execCount}`;
            
            this.description = `${relativeTime} (${execCount}次)`;
            this.contextValue = 'historyScript';
            this.iconPath = new vscode.ThemeIcon('history');
            
            this.command = {
                command: 'npmScriptManager.runScript',
                title: '运行脚本',
                arguments: [historyItem.script]
            };
        }
    }
}

/**
 * 终端监听状态树项
 */
class TerminalMonitorStatusItem extends vscode.TreeItem {
    constructor(terminalMonitor: TerminalMonitor | undefined) {
        const isEnabled = terminalMonitor !== undefined;
        const label = isEnabled ? '终端监听' : '终端监听（已禁用）';

        super(label, vscode.TreeItemCollapsibleState.None);

        if (isEnabled) {
            const stats = terminalMonitor.getStats();
            const statusDesc = terminalMonitor.getStatusDescription();

            this.description = `${stats.integratedTerminals}/${stats.totalTerminals} 终端`;
            this.tooltip = `${statusDesc}\n\n` +
                          `总终端数: ${stats.totalTerminals}\n` +
                          `支持监听: ${stats.integratedTerminals}\n` +
                          `已捕获命令: ${stats.commandsCaptured}`;

            if (stats.integratedTerminals > 0) {
                this.iconPath = new vscode.ThemeIcon(
                    'eye',
                    new vscode.ThemeColor('charts.green')
                );
            } else {
                this.iconPath = new vscode.ThemeIcon(
                    'eye-closed',
                    new vscode.ThemeColor('charts.yellow')
                );
            }
        } else {
            this.description = '点击启用';
            this.tooltip = '终端监听功能已禁用\n\n点击以启用终端命令监听功能';
            this.iconPath = new vscode.ThemeIcon(
                'eye-closed',
                new vscode.ThemeColor('descriptionForeground')
            );

            // 点击启用
            this.command = {
                command: 'scriptButler.toggleTerminalMonitoring',
                title: '启用终端监听'
            };
        }

        this.contextValue = 'terminalMonitorStatus';
    }
}

/**
 * 提供历史记录树视图数据
 */
export class HistoryTreeProvider implements vscode.TreeDataProvider<HistoryTreeItem | TerminalMonitorStatusItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryTreeItem | TerminalMonitorStatusItem | undefined | null | void> =
        new vscode.EventEmitter<HistoryTreeItem | TerminalMonitorStatusItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryTreeItem | TerminalMonitorStatusItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    private terminalMonitor: TerminalMonitor | undefined;

    constructor(
        private historyManager: HistoryManager
    ) {}

    /**
     * 设置 TerminalMonitor 实例
     */
    setTerminalMonitor(terminalMonitor: TerminalMonitor | undefined): void {
        this.terminalMonitor = terminalMonitor;
        this.refresh();
    }

    /**
     * 刷新树视图
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * 获取树项
     */
    getTreeItem(element: HistoryTreeItem | TerminalMonitorStatusItem): vscode.TreeItem {
        return element;
    }

    /**
     * 获取子项
     */
    async getChildren(element?: HistoryTreeItem | TerminalMonitorStatusItem): Promise<(HistoryTreeItem | TerminalMonitorStatusItem)[]> {
        if (element) {
            return [];
        }

        const items: (HistoryTreeItem | TerminalMonitorStatusItem)[] = [];

        // 添加终端监听状态项（始终显示在顶部）
        items.push(new TerminalMonitorStatusItem(this.terminalMonitor));

        // 添加历史记录项
        const history = this.historyManager.getHistory();
        if (history.length > 0) {
            items.push(...history.map(item => new HistoryTreeItem(item, this.historyManager)));
        }

        return items;
    }
}

