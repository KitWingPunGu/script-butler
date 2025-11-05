import * as vscode from 'vscode';

/**
 * Represents an NPM script from package.json
 */
export interface NpmScript {
    name: string;
    command: string;
    packageJsonPath: string;
    workspaceFolder: string;
}

/**
 * Represents a tree item for NPM scripts
 */
export class NpmScriptTreeItem extends vscode.TreeItem {
    constructor(
        public readonly script: NpmScript,
        public readonly isFavorite: boolean = false
    ) {
        super(script.name, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `${script.command}\n\nPath: ${script.packageJsonPath}`;
        this.description = script.command;
        this.contextValue = isFavorite ? 'favoriteScript' : 'script';
        
        // Add icon
        this.iconPath = new vscode.ThemeIcon(
            isFavorite ? 'star-full' : 'terminal',
            isFavorite ? new vscode.ThemeColor('charts.yellow') : undefined
        );
        
        // Make it clickable
        this.command = {
            command: 'npmScriptManager.runScript',
            title: 'Run Script',
            arguments: [this.script]
        };
    }
}

/**
 * Represents a workspace folder tree item
 */
export class WorkspaceFolderTreeItem extends vscode.TreeItem {
    constructor(
        public readonly folderPath: string,
        public readonly scripts: NpmScript[]
    ) {
        super(folderPath, vscode.TreeItemCollapsibleState.Expanded);
        
        this.tooltip = `${scripts.length} script(s) in ${folderPath}`;
        this.description = `${scripts.length} script(s)`;
        this.contextValue = 'workspaceFolder';
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}

/**
 * Storage keys for persisting data
 */
export enum StorageKeys {
    FAVORITES = 'npmScriptManager.favorites',
    FILTER = 'npmScriptManager.filter'
}

/**
 * 脚本执行状态
 */
export enum ScriptStatus {
    IDLE = 'idle',           // 未运行
    RUNNING = 'running',     // 运行中
    SUCCESS = 'success',     // 成功
    FAILED = 'failed'        // 失败
}

/**
 * 脚本执行信息
 */
export interface ScriptExecutionInfo {
    status: ScriptStatus;
    startTime?: number;
    endTime?: number;
    exitCode?: number;
}

/**
 * 工作流步骤类型
 */
export type WorkflowStepType = 'script' | 'command';

/**
 * 工作流步骤
 */
export interface WorkflowStep {
    type?: WorkflowStepType;       // 步骤类型：script（NPM脚本）或 command（任意命令）
    scriptName?: string;           // NPM 脚本名称（type=script 时使用）
    packageJsonPath?: string;      // package.json 路径（type=script 时使用）
    command?: string;              // 任意命令（type=command 时使用）
    mode: 'serial' | 'parallel';   // 串行或并行
    continueOnError?: boolean;     // 失败后是否继续
}

/**
 * 工作流定义
 */
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
}

/**
 * Git 命令定义
 */
export interface GitCommand {
    id: string;
    name: string;
    command: string;
    description?: string;
    isCustom?: boolean;  // 是否为用户自定义命令
}

