import * as vscode from 'vscode';
import { NpmScript, NpmScriptTreeItem } from './types';
import { FavoritesManager } from './favoritesManager';
import { ScriptsTreeProvider } from './scriptsTreeProvider';
import { GitCommandTreeItem } from './gitCommandTreeProvider';
import { GitCommandManager } from './gitCommandManager';

/**
 * Tree data provider for favorites view
 */
export class FavoritesTreeProvider implements vscode.TreeDataProvider<NpmScriptTreeItem | GitCommandTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NpmScriptTreeItem | GitCommandTreeItem | undefined | null | void> =
        new vscode.EventEmitter<NpmScriptTreeItem | GitCommandTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NpmScriptTreeItem | GitCommandTreeItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    constructor(
        private favoritesManager: FavoritesManager,
        private scriptsTreeProvider: ScriptsTreeProvider,
        private gitCommandManager: GitCommandManager
    ) {}

    /**
     * Refresh the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: NpmScriptTreeItem | GitCommandTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: NpmScriptTreeItem | GitCommandTreeItem): Promise<(NpmScriptTreeItem | GitCommandTreeItem)[]> {
        if (element) {
            return [];
        }

        const items: (NpmScriptTreeItem | GitCommandTreeItem)[] = [];

        // Get all scripts and filter favorites
        const allScripts = this.scriptsTreeProvider.getAllScripts();
        const favoriteScripts = this.favoritesManager.getFavoriteScripts(allScripts);
        items.push(...favoriteScripts.map(script => new NpmScriptTreeItem(script, true)));

        // Get all Git commands and filter favorites
        const allGitCommands = this.gitCommandManager.getAllCommands();
        const favoriteGitCommands = this.favoritesManager.getFavoriteGitCommands(allGitCommands);
        items.push(...favoriteGitCommands.map(gitCommand => new GitCommandTreeItem(gitCommand, true)));

        return items;
    }
}

