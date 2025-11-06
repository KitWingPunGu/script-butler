import * as vscode from 'vscode';
import { NpmScript, StorageKeys, GitCommand } from './types';

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

/**
 * 收藏项数据结构
 */
export interface FavoriteData {
    type: FavoriteType;
    key: string;
}

/**
 * Manages favorite scripts and Git commands with persistence
 */
export class FavoritesManager {
    private favorites: Set<string>;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.favorites = new Set(this.loadFavorites());
    }

    /**
     * Load favorites from storage
     */
    private loadFavorites(): string[] {
        return this.context.globalState.get<string[]>(StorageKeys.FAVORITES, []);
    }

    /**
     * Save favorites to storage
     */
    private async saveFavorites(): Promise<void> {
        await this.context.globalState.update(
            StorageKeys.FAVORITES,
            Array.from(this.favorites)
        );
    }

    /**
     * Generate a unique key for a script
     */
    private getScriptKey(script: NpmScript): string {
        return `script::${script.packageJsonPath}::${script.name}`;
    }

    /**
     * Generate a unique key for a Git command
     */
    private getGitCommandKey(gitCommand: GitCommand): string {
        return `gitCommand::${gitCommand.id}`;
    }

    /**
     * Generate a unique key for any favorite item
     */
    private getItemKey(item: FavoriteItem): string {
        if ('packageJsonPath' in item) {
            // It's a NpmScript
            return this.getScriptKey(item as NpmScript);
        } else {
            // It's a GitCommand
            return this.getGitCommandKey(item as GitCommand);
        }
    }

    /**
     * Check if a script is a favorite
     */
    isFavorite(script: NpmScript): boolean {
        return this.favorites.has(this.getScriptKey(script));
    }

    /**
     * Check if a Git command is a favorite
     */
    isGitCommandFavorite(gitCommand: GitCommand): boolean {
        return this.favorites.has(this.getGitCommandKey(gitCommand));
    }

    /**
     * Add a script to favorites
     */
    async addToFavorites(script: NpmScript): Promise<void> {
        const key = this.getScriptKey(script);
        if (!this.favorites.has(key)) {
            this.favorites.add(key);
            await this.saveFavorites();
            console.log(`[FavoritesManager] Added script "${script.name}" to favorites`);
        }
    }

    /**
     * Remove a script from favorites
     */
    async removeFromFavorites(script: NpmScript): Promise<void> {
        const key = this.getScriptKey(script);
        if (this.favorites.has(key)) {
            this.favorites.delete(key);
            await this.saveFavorites();
            console.log(`[FavoritesManager] Removed script "${script.name}" from favorites`);
        }
    }

    /**
     * Add a Git command to favorites
     */
    async addGitCommandToFavorites(gitCommand: GitCommand): Promise<void> {
        const key = this.getGitCommandKey(gitCommand);
        if (!this.favorites.has(key)) {
            this.favorites.add(key);
            await this.saveFavorites();
            console.log(`[FavoritesManager] Added Git command "${gitCommand.name}" to favorites`);
        }
    }

    /**
     * Remove a Git command from favorites
     */
    async removeGitCommandFromFavorites(gitCommand: GitCommand): Promise<void> {
        const key = this.getGitCommandKey(gitCommand);
        if (this.favorites.has(key)) {
            this.favorites.delete(key);
            await this.saveFavorites();
            console.log(`[FavoritesManager] Removed Git command "${gitCommand.name}" from favorites`);
        }
    }

    /**
     * Get all favorite scripts from a list of scripts
     */
    getFavoriteScripts(allScripts: NpmScript[]): NpmScript[] {
        return allScripts.filter(script => this.isFavorite(script));
    }

    /**
     * Get all favorite Git commands from a list of Git commands
     */
    getFavoriteGitCommands(allGitCommands: GitCommand[]): GitCommand[] {
        return allGitCommands.filter(gitCommand => this.isGitCommandFavorite(gitCommand));
    }

    /**
     * Get all favorites (both scripts and Git commands)
     */
    getAllFavorites(): string[] {
        return Array.from(this.favorites);
    }

    /**
     * 清理失效的收藏（脚本已被删除）
     */
    async cleanupInvalidFavorites(allScripts: NpmScript[], allGitCommands: GitCommand[]): Promise<number> {
        const validKeys = new Set([
            ...allScripts.map(script => this.getScriptKey(script)),
            ...allGitCommands.map(gitCommand => this.getGitCommandKey(gitCommand))
        ]);
        const invalidKeys: string[] = [];

        // 找出所有失效的收藏
        for (const key of this.favorites) {
            if (!validKeys.has(key)) {
                invalidKeys.push(key);
            }
        }

        // 移除失效的收藏
        if (invalidKeys.length > 0) {
            for (const key of invalidKeys) {
                this.favorites.delete(key);
            }
            await this.saveFavorites();
        }

        return invalidKeys.length;
    }

    /**
     * 获取所有失效的收藏（用于显示）
     */
    getInvalidFavorites(allScripts: NpmScript[], allGitCommands: GitCommand[]): string[] {
        const validKeys = new Set([
            ...allScripts.map(script => this.getScriptKey(script)),
            ...allGitCommands.map(gitCommand => this.getGitCommandKey(gitCommand))
        ]);
        const invalidFavorites: string[] = [];

        for (const key of this.favorites) {
            if (!validKeys.has(key)) {
                // 解析 key 获取名称
                const parts = key.split('::');
                if (parts.length >= 2) {
                    if (parts[0] === 'script') {
                        invalidFavorites.push(`脚本: ${parts[2]}`); // 脚本名称
                    } else if (parts[0] === 'gitCommand') {
                        invalidFavorites.push(`Git 命令: ${parts[1]}`); // Git 命令 ID
                    }
                }
            }
        }

        return invalidFavorites;
    }

    /**
     * Clear all favorites
     */
    async clearAllFavorites(): Promise<void> {
        this.favorites.clear();
        await this.saveFavorites();
    }
}

