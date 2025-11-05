import * as vscode from 'vscode';
import { NpmScript } from './types';

/**
 * 历史记录项
 */
export interface HistoryItem {
    script: NpmScript;
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
        const stored = this.context.globalState.get<HistoryItem[]>(HISTORY_STORAGE_KEY, []);
        this.history = stored;
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

    /**
     * 添加脚本到历史记录
     */
    async addToHistory(script: NpmScript): Promise<void> {
        const scriptKey = this.getScriptKey(script);
        
        // 查找是否已存在
        const existingIndex = this.history.findIndex(item => 
            this.getScriptKey(item.script) === scriptKey
        );

        if (existingIndex !== -1) {
            // 已存在，更新时间戳和执行次数
            const existingItem = this.history[existingIndex];
            existingItem.timestamp = Date.now();
            existingItem.executionCount++;
            
            // 移到开头
            this.history.splice(existingIndex, 1);
            this.history.unshift(existingItem);
        } else {
            // 不存在，添加新记录
            const newItem: HistoryItem = {
                script: script,
                timestamp: Date.now(),
                executionCount: 1
            };
            
            this.history.unshift(newItem);
        }

        // 限制历史记录数量
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }

        await this.saveHistory();
    }

    /**
     * 获取所有历史记录
     */
    getHistory(): HistoryItem[] {
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
     * 清理无效的历史记录（脚本已不存在）
     */
    async cleanupInvalidHistory(allScripts: NpmScript[]): Promise<number> {
        const validKeys = new Set(allScripts.map(script => this.getScriptKey(script)));
        const originalLength = this.history.length;
        
        this.history = this.history.filter(item => 
            validKeys.has(this.getScriptKey(item.script))
        );

        const removedCount = originalLength - this.history.length;
        
        if (removedCount > 0) {
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
            this.history = this.history.slice(0, size);
            this.saveHistory();
        }
    }

    /**
     * 获取最大历史记录数量
     */
    getMaxHistorySize(): number {
        return this.maxHistorySize;
    }
}

