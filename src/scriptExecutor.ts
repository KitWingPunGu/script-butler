import * as vscode from 'vscode';
import * as path from 'path';
import { NpmScript, ScriptStatus, ScriptExecutionInfo } from './types';
import { PackageManagerDetector } from './packageManagerDetector';

/**
 * Executes NPM scripts in VS Code terminal
 */
export class ScriptExecutor {
    private terminals: Map<string, vscode.Terminal> = new Map();
    private packageManagerDetector: PackageManagerDetector;
    private scriptStatus: Map<string, ScriptExecutionInfo> = new Map();
    private statusChangeEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

    // 状态变化事件
    public readonly onStatusChange: vscode.Event<void> = this.statusChangeEmitter.event;

    constructor() {
        this.packageManagerDetector = new PackageManagerDetector();
    }

    /**
     * 获取脚本的唯一标识
     */
    private getScriptKey(script: NpmScript): string {
        return `${script.packageJsonPath}::${script.name}`;
    }

    /**
     * 设置脚本状态
     */
    private setStatus(script: NpmScript, status: ScriptStatus, exitCode?: number): void {
        const key = this.getScriptKey(script);
        const info = this.scriptStatus.get(key) || { status: ScriptStatus.IDLE };

        info.status = status;

        if (status === ScriptStatus.RUNNING) {
            info.startTime = Date.now();
            info.endTime = undefined;
            info.exitCode = undefined;
        } else if (status === ScriptStatus.SUCCESS || status === ScriptStatus.FAILED) {
            info.endTime = Date.now();
            info.exitCode = exitCode;
        }

        this.scriptStatus.set(key, info);
        this.statusChangeEmitter.fire();
    }

    /**
     * 获取脚本状态
     */
    getStatus(script: NpmScript): ScriptExecutionInfo {
        const key = this.getScriptKey(script);
        return this.scriptStatus.get(key) || { status: ScriptStatus.IDLE };
    }

    /**
     * 格式化执行时长
     */
    private formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    /**
     * 显示完成通知
     */
    private showCompletionNotification(script: NpmScript, duration: number, success: boolean): void {
        const time = this.formatDuration(duration);
        const icon = success ? '✅' : '❌';
        const status = success ? '执行成功' : '执行失败';
        const message = `${icon} "${script.name}" ${status} (${time})`;

        if (success) {
            vscode.window.showInformationMessage(message);
        } else {
            vscode.window.showErrorMessage(message);
        }
    }

    /**
     * Execute an NPM script
     */
    async executeScript(script: NpmScript, sendEnter: boolean = true): Promise<void> {
        const cwd = path.dirname(script.packageJsonPath);

        // 检测包管理器
        const packageManager = await this.packageManagerDetector.detectPackageManager(script.packageJsonPath);
        const pmName = this.packageManagerDetector.getPackageManagerName(packageManager);
        const command = this.packageManagerDetector.getRunCommand(packageManager, script.name);

        const terminalName = `${pmName}: ${script.name}`;

        // 设置为运行中状态
        this.setStatus(script, ScriptStatus.RUNNING);

        // Check if terminal already exists and is still open
        let terminal = this.terminals.get(terminalName);

        if (terminal) {
            try {
                // Check if terminal is still alive by trying to show it
                terminal.show();
            } catch {
                // Terminal was closed, remove from map
                this.terminals.delete(terminalName);
                terminal = undefined;
            }
        }

        // Create new terminal if needed
        if (!terminal) {
            terminal = vscode.window.createTerminal({
                name: terminalName,
                cwd: cwd
            });
            this.terminals.set(terminalName, terminal);

            // Clean up when terminal is closed
            vscode.window.onDidCloseTerminal(closedTerminal => {
                if (closedTerminal === terminal) {
                    this.terminals.delete(terminalName);
                }
            });
        }

        // Show terminal and execute command
        terminal.show();
        terminal.sendText(command, sendEnter);

        // 监听终端退出（注意：VS Code API 限制，无法直接监听进程退出）
        // 这里我们使用一个简化的方法：在一定时间后检查终端是否还存在
        // 实际项目中可能需要更复杂的进程监听机制

        if (sendEnter) {
            console.log(`[ScriptExecutor] Running (${pmName}): ${script.name}`);

            // 注意：由于 VS Code API 限制，我们无法直接获取进程退出码
            // 这里提供一个基础实现，实际使用中可能需要用户手动标记完成
            // 或者使用更复杂的进程监听方案
        } else {
            console.log(`[ScriptExecutor] Command queued: ${script.name}`);
            // Git 命令只上屏，不执行，所以立即设置为 IDLE 状态
            this.setStatus(script, ScriptStatus.IDLE);
        }
    }

    /**
     * 执行 Git 命令（只上屏，不自动执行）
     */
    async executeGitCommand(command: string, name: string): Promise<void> {
        console.log('executeGitCommand called');
        console.log('command type:', typeof command, 'value:', command);
        console.log('name type:', typeof name, 'value:', name);

        if (!command) {
            vscode.window.showErrorMessage('Git 命令不能为空');
            return;
        }

        // 确保 command 是字符串
        const commandStr = String(command);
        const nameStr = String(name);

        const terminalName = `Git: ${nameStr}`;

        // Check if terminal already exists and is still open
        let terminal = this.terminals.get(terminalName);

        if (terminal) {
            try {
                terminal.show();
            } catch {
                this.terminals.delete(terminalName);
                terminal = undefined;
            }
        }

        // Create new terminal if needed
        if (!terminal) {
            terminal = vscode.window.createTerminal({
                name: terminalName
            });
            this.terminals.set(terminalName, terminal);

            vscode.window.onDidCloseTerminal(closedTerminal => {
                if (closedTerminal === terminal) {
                    this.terminals.delete(terminalName);
                }
            });
        }

        // Show terminal and send command (without executing)
        terminal.show();
        terminal.sendText(commandStr, false);  // false = 不发送回车

        console.log(`[ScriptExecutor] Git command queued: ${commandStr}`);
    }

    /**
     * Dispose all terminals
     */
    dispose(): void {
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        this.terminals.clear();
        this.packageManagerDetector.clearCache();
        this.scriptStatus.clear();
        this.statusChangeEmitter.dispose();
    }
}

