import * as vscode from 'vscode';
import { NpmScript, GitCommand } from './types';

/**
 * 历史记录项
 */
export interface HistoryItem {
    type: 'script' | 'git';
    script?: NpmScript;
    gitCommand?: GitCommand;
    timestamp: number;
    executionCount: number;
}

/**
 * 存储键
 */
const HISTORY_STORAGE_KEY = 'scriptButler.history';

/**
 * 管理脚本执行历史记录
 */
export class HistoryManager {
    private history: HistoryItem[] = [];
    private maxHistorySize: number = 10;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadHistory();
    }

    /**
     * 从持久化存储加载历史记录
     */
    private loadHistory(): void {
        const stored = this.context.globalState.get<any[]>(HISTORY_STORAGE_KEY, []);
        this.history = stored
            .map((item) => {
                const normalized: HistoryItem = {
                    type: item.type ?? 'script',
                    script: item.script,
                    gitCommand: item.gitCommand,
                    timestamp: item.timestamp ?? Date.now(),
                    executionCount: item.executionCount && item.executionCount > 0 ? item.executionCount : 1
                };

                // 兼容旧数据：无 type 或 script 丢失的记录直接丢弃
                if (normalized.type === 'script' && !normalized.script) {
                    return null;
                }
                if (normalized.type === 'git' && !normalized.gitCommand) {
                    return null;
                }

                return normalized;
            })
            .filter((item): item is HistoryItem => item !== null);

        this.sortHistory();
    }

    /**
     * 保存历史记录到持久化存储
     */
    private async saveHistory(): Promise<void> {
        await this.context.globalState.update(HISTORY_STORAGE_KEY, this.history);
    }

    /**
     * 获取脚本的唯一标识
     */
    private getScriptKey(script: NpmScript): string {
        return `${script.packageJsonPath}::${script.name}`;
    }

    private getHistoryKeyForScript(script: NpmScript): string {
        return `script::${this.getScriptKey(script)}`;
    }

    private getHistoryKeyForGitCommand(gitCommand: GitCommand): string {
        return `git::${gitCommand.id}`;
    }

    private getHistoryKey(item: HistoryItem): string {
        if (item.type === 'git' && item.gitCommand) {
            return this.getHistoryKeyForGitCommand(item.gitCommand);
        } else if (item.script) {
            return this.getHistoryKeyForScript(item.script);
        }
        return '';
    }

    /**
     * 按执行次数与最近时间排序历史记录
     */
    private sortHistory(): void {
        this.history.sort((a, b) => {
            if (b.executionCount !== a.executionCount) {
                return b.executionCount - a.executionCount;
            }
            return b.timestamp - a.timestamp;
        });
    }

    /**
     * 添加到历史记录（支持脚本和 Git 命令）
     */
    async addToHistory(target: NpmScript | GitCommand, type: 'script' | 'git' = 'script'): Promise<void> {
        if (type === 'git') {
            await this.addHistoryEntry({ type: 'git', gitCommand: target as GitCommand });
        } else {
            await this.addHistoryEntry({ type: 'script', script: target as NpmScript });
        }
    }

    private async addHistoryEntry(entry: { type: 'script'; script: NpmScript } | { type: 'git'; gitCommand: GitCommand }): Promise<void> {
        const key = entry.type === 'script'
            ? this.getHistoryKeyForScript(entry.script)
            : this.getHistoryKeyForGitCommand(entry.gitCommand);

        const existingIndex = this.history.findIndex(item => this.getHistoryKey(item) === key);

        if (existingIndex !== -1) {
            const existingItem = this.history[existingIndex];
            existingItem.timestamp = Date.now();
            existingItem.executionCount = (existingItem.executionCount || 0) + 1;
            existingItem.type = entry.type;

            if (entry.type === 'script') {
                existingItem.script = entry.script;
            } else {
                existingItem.gitCommand = entry.gitCommand;
            }

            this.history.splice(existingIndex, 1);
            this.history.unshift(existingItem);
        } else {
            const newItem: HistoryItem = {
                type: entry.type,
                script: entry.type === 'script' ? entry.script : undefined,
                gitCommand: entry.type === 'git' ? entry.gitCommand : undefined,
                timestamp: Date.now(),
                executionCount: 1
            };

            this.history.unshift(newItem);
        }

        this.sortHistory();

        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }

        await this.saveHistory();
    }

    /**
     * 获取所有历史记录
     */
    getHistory(): HistoryItem[] {
        this.sortHistory();
        return [...this.history];
    }

    /**
     * 清空历史记录
     */
    async clearHistory(): Promise<void> {
        this.history = [];
        await this.saveHistory();
    }

    /**
     * 清理无效的历史记录（脚本或 Git 命令已不存在）
     */
    async cleanupInvalidHistory(allScripts: NpmScript[], allGitCommands: GitCommand[]): Promise<number> {
        const validScriptKeys = new Set(allScripts.map(script => this.getScriptKey(script)));
        const validGitKeys = new Set(allGitCommands.map(cmd => this.getHistoryKeyForGitCommand(cmd)));
        const originalLength = this.history.length;
        
        this.history = this.history.filter(item => {
            if (item.type === 'git') {
                if (!item.gitCommand) {
                    return false;
                }
                return validGitKeys.has(this.getHistoryKeyForGitCommand(item.gitCommand));
            }

            if (!item.script) {
                return false;
            }

            return validScriptKeys.has(this.getScriptKey(item.script));
        });

        const removedCount = originalLength - this.history.length;
        
        if (removedCount > 0) {
            this.sortHistory();
            await this.saveHistory();
        }

        return removedCount;
    }

    /**
     * 格式化时间戳为相对时间
     */
    formatRelativeTime(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return '刚刚';
        } else if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return new Date(timestamp).toLocaleDateString('zh-CN');
        }
    }

    /**
     * 设置最大历史记录数量
     */
    setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;
        if (this.history.length > size) {
            this.sortHistory();
            this.history = this.history.slice(0, size);
            this.saveHistory();
        } else {
            this.sortHistory();
        }
    }

    /**
     * 获取最大历史记录数量
     */
    getMaxHistorySize(): number {
        return this.maxHistorySize;
    }
}
