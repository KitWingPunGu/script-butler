import * as vscode from 'vscode';
import { NpmScript, NpmScriptTreeItem, WorkspaceFolderTreeItem, ScriptStatus } from './types';
import { PackageScanner } from './packageScanner';
import { FavoritesManager } from './favoritesManager';
import { ScriptExecutor } from './scriptExecutor';

/**
 * 带状态的脚本树项
 */
class ScriptTreeItemWithStatus extends NpmScriptTreeItem {
    constructor(
        script: NpmScript,
        isFavorite: boolean,
        private scriptExecutor: ScriptExecutor
    ) {
        super(script, isFavorite);
        this.updateStatus();
    }

    /**
     * 更新状态显示
     */
    private updateStatus(): void {
        const status = this.scriptExecutor.getStatus(this.script);

        // 根据状态更新图标和描述
        switch (status.status) {
            case ScriptStatus.RUNNING:
                this.iconPath = new vscode.ThemeIcon('loading~spin');
                this.description = `${this.script.command} (运行中...)`;
                break;
            case ScriptStatus.SUCCESS:
                if (status.startTime && status.endTime) {
                    const duration = this.formatDuration(status.endTime - status.startTime);
                    this.description = `${this.script.command} (✅ ${duration})`;
                } else {
                    this.description = `${this.script.command} (✅)`;
                }
                break;
            case ScriptStatus.FAILED:
                if (status.startTime && status.endTime) {
                    const duration = this.formatDuration(status.endTime - status.startTime);
                    this.description = `${this.script.command} (❌ ${duration})`;
                } else {
                    this.description = `${this.script.command} (❌)`;
                }
                break;
            default:
                // IDLE 状态保持默认
                break;
        }
    }

    /**
     * 格式化时长
     */
    private formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);

        if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
}

/**
 * Tree data provider for NPM scripts view
 */
export class ScriptsTreeProvider implements vscode.TreeDataProvider<NpmScriptTreeItem | WorkspaceFolderTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NpmScriptTreeItem | WorkspaceFolderTreeItem | undefined | null | void> =
        new vscode.EventEmitter<NpmScriptTreeItem | WorkspaceFolderTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NpmScriptTreeItem | WorkspaceFolderTreeItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    private allScripts: NpmScript[] = [];
    private filterText: string = '';
    private packageScanner: PackageScanner;
    private favoritesManager: FavoritesManager;
    private scriptExecutor: ScriptExecutor;

    constructor(
        private context: vscode.ExtensionContext,
        packageScanner: PackageScanner,
        favoritesManager: FavoritesManager,
        scriptExecutor: ScriptExecutor
    ) {
        this.packageScanner = packageScanner;
        this.favoritesManager = favoritesManager;
        this.scriptExecutor = scriptExecutor;

        // 监听状态变化
        scriptExecutor.onStatusChange(() => {
            this._onDidChangeTreeData.fire();
        });
    }

    /**
     * Refresh the tree view
     */
    async refresh(): Promise<void> {
        this.allScripts = await this.packageScanner.scanAllScripts();
        this._onDidChangeTreeData.fire();
    }

    /**
     * Set filter text
     */
    setFilter(filterText: string): void {
        this.filterText = filterText.toLowerCase();
        this._onDidChangeTreeData.fire();
        
        // Update context for showing/hiding clear filter button
        vscode.commands.executeCommand(
            'setContext',
            'npmScriptManager.filterActive',
            this.filterText.length > 0
        );
    }

    /**
     * Clear filter
     */
    clearFilter(): void {
        this.setFilter('');
    }

    /**
     * Get filtered scripts
     */
    private getFilteredScripts(): NpmScript[] {
        if (!this.filterText) {
            return this.allScripts;
        }

        return this.allScripts.filter(script => 
            script.name.toLowerCase().includes(this.filterText) ||
            script.command.toLowerCase().includes(this.filterText)
        );
    }

    /**
     * Group scripts by package.json location
     */
    private groupScriptsByLocation(scripts: NpmScript[]): Map<string, NpmScript[]> {
        const grouped = new Map<string, NpmScript[]>();
        
        for (const script of scripts) {
            const key = script.packageJsonPath;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(script);
        }

        return grouped;
    }

    getTreeItem(element: NpmScriptTreeItem | WorkspaceFolderTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: NpmScriptTreeItem | WorkspaceFolderTreeItem): Promise<(NpmScriptTreeItem | WorkspaceFolderTreeItem)[]> {
        if (!element) {
            // Root level - show workspace folders or scripts
            const filteredScripts = this.getFilteredScripts();
            
            if (filteredScripts.length === 0) {
                return [];
            }

            const grouped = this.groupScriptsByLocation(filteredScripts);
            
            // If only one package.json, show scripts directly
            if (grouped.size === 1) {
                const scripts = Array.from(grouped.values())[0];
                return scripts.map(script =>
                    new ScriptTreeItemWithStatus(script, this.favoritesManager.isFavorite(script), this.scriptExecutor)
                );
            }

            // Multiple package.json files - show folders
            const folders: WorkspaceFolderTreeItem[] = [];
            for (const [packageJsonPath, scripts] of grouped) {
                const relativePath = vscode.workspace.asRelativePath(packageJsonPath);
                folders.push(new WorkspaceFolderTreeItem(relativePath, scripts));
            }

            return folders.sort((a, b) => a.folderPath.localeCompare(b.folderPath));
        } else if (element instanceof WorkspaceFolderTreeItem) {
            // Show scripts for this folder
            return element.scripts.map(script =>
                new ScriptTreeItemWithStatus(script, this.favoritesManager.isFavorite(script), this.scriptExecutor)
            );
        }

        return [];
    }

    /**
     * Get all scripts (for external use)
     */
    getAllScripts(): NpmScript[] {
        return this.allScripts;
    }
}

