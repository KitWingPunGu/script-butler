import * as vscode from 'vscode';
import { NpmScript } from './types';
import { HistoryManager } from './historyManager';
import { PackageScanner } from './packageScanner';

/**
 * 终端监听统计信息
 */
export interface TerminalMonitorStats {
    totalTerminals: number;
    integratedTerminals: number;
    commandsCaptured: number;
}

/**
 * 监听终端命令执行并记录到历史
 * 
 * 使用 VS Code Shell Integration API 监听终端中的命令执行
 * 仅支持启用了 shell integration 的终端（bash, zsh, fish, pwsh）
 */
export class TerminalMonitor {
    private disposables: vscode.Disposable[] = [];
    private monitoredTerminals = new Set<vscode.Terminal>();
    private stats: TerminalMonitorStats = {
        totalTerminals: 0,
        integratedTerminals: 0,
        commandsCaptured: 0
    };
    private statsChangeEmitter = new vscode.EventEmitter<TerminalMonitorStats>();
    
    // 统计信息变化事件
    public readonly onStatsChange: vscode.Event<TerminalMonitorStats> = this.statsChangeEmitter.event;

    constructor(
        private historyManager: HistoryManager,
        private packageScanner: PackageScanner
    ) {
        this.initialize();
    }

    /**
     * 初始化终端监听
     */
    private initialize(): void {
        console.log('[TerminalMonitor] Initializing terminal monitoring...');

        // 监听 Shell Integration 激活
        this.disposables.push(
            vscode.window.onDidChangeTerminalShellIntegration((event) => {
                this.onShellIntegrationActivated(event);
            })
        );

        // 监听命令执行开始
        this.disposables.push(
            vscode.window.onDidStartTerminalShellExecution((event) => {
                this.onCommandStarted(event);
            })
        );

        // 监听命令执行结束
        this.disposables.push(
            vscode.window.onDidEndTerminalShellExecution((event) => {
                this.onCommandEnded(event);
            })
        );

        // 监听终端打开
        this.disposables.push(
            vscode.window.onDidOpenTerminal((terminal) => {
                this.stats.totalTerminals++;
                this.emitStatsChange();
                console.log(`[TerminalMonitor] Terminal opened: ${terminal.name}`);
            })
        );

        // 监听终端关闭
        this.disposables.push(
            vscode.window.onDidCloseTerminal((terminal) => {
                this.monitoredTerminals.delete(terminal);
                this.stats.totalTerminals = Math.max(0, this.stats.totalTerminals - 1);
                if (this.stats.integratedTerminals > 0) {
                    this.stats.integratedTerminals--;
                }
                this.emitStatsChange();
                console.log(`[TerminalMonitor] Terminal closed: ${terminal.name}`);
            })
        );

        // 统计现有终端
        this.stats.totalTerminals = vscode.window.terminals.length;
        this.emitStatsChange();
    }

    /**
     * Shell Integration 激活时的处理
     */
    private onShellIntegrationActivated(
        event: vscode.TerminalShellIntegrationChangeEvent
    ): void {
        const { terminal, shellIntegration } = event;
        
        if (!this.monitoredTerminals.has(terminal)) {
            this.monitoredTerminals.add(terminal);
            this.stats.integratedTerminals++;
            this.emitStatsChange();
            console.log(`[TerminalMonitor] Shell integration activated for: ${terminal.name}`);
        }
    }

    /**
     * 命令开始执行时的处理
     */
    private onCommandStarted(
        event: vscode.TerminalShellExecutionStartEvent
    ): void {
        const { execution, terminal } = event;
        const commandLine = execution.commandLine.value;
        const confidence = execution.commandLine.confidence;
        
        console.log(`[TerminalMonitor] Command started in ${terminal.name}:`);
        console.log(`  Command: ${commandLine}`);
        console.log(`  Confidence: ${confidence}`);
    }

    /**
     * 命令执行结束时的处理
     */
    private onCommandEnded(
        event: vscode.TerminalShellExecutionEndEvent
    ): void {
        const { execution, exitCode, terminal } = event;
        const commandLine = execution.commandLine.value;
        const confidence = execution.commandLine.confidence;
        
        console.log(`[TerminalMonitor] Command ended in ${terminal.name}:`);
        console.log(`  Command: ${commandLine}`);
        console.log(`  Exit code: ${exitCode}`);
        console.log(`  Confidence: ${confidence}`);

        // 只处理高置信度的命令
        if (confidence === vscode.TerminalShellExecutionCommandLineConfidence.High) {
            this.parseAndRecordCommand(commandLine, exitCode, terminal);
        } else {
            console.log(`[TerminalMonitor] Skipping low confidence command`);
        }
    }

    /**
     * 解析并记录命令
     */
    private async parseAndRecordCommand(
        commandLine: string,
        exitCode: number | undefined,
        terminal: vscode.Terminal
    ): Promise<void> {
        const trimmedCommand = commandLine.trim();
        
        // 检查是否是包管理器脚本命令
        const scriptMatch = await this.matchScriptCommand(trimmedCommand);
        if (scriptMatch) {
            this.stats.commandsCaptured++;
            this.emitStatsChange();
            await this.recordScriptExecution(scriptMatch);
            return;
        }

        // 可以在这里添加 Git 命令的处理
        // const gitMatch = this.matchGitCommand(trimmedCommand);
        // if (gitMatch) { ... }
    }

    /**
     * 匹配脚本命令
     */
    private async matchScriptCommand(command: string): Promise<NpmScript | null> {
        // 匹配 npm run xxx, pnpm xxx, yarn xxx 等
        const patterns = [
            { regex: /^npm\s+run\s+([^\s]+)/, manager: 'npm' },
            { regex: /^pnpm\s+(?:run\s+)?([^\s]+)/, manager: 'pnpm' },
            { regex: /^yarn\s+(?:run\s+)?([^\s]+)/, manager: 'yarn' }
        ];

        for (const pattern of patterns) {
            const match = command.match(pattern.regex);
            if (match) {
                const scriptName = match[1];
                
                // 跳过一些常见的非脚本命令
                const nonScriptCommands = ['install', 'add', 'remove', 'update', 'init', 'create'];
                if (nonScriptCommands.includes(scriptName)) {
                    continue;
                }
                
                // 查找对应的 NpmScript
                const script = await this.findScriptByName(scriptName);
                if (script) {
                    console.log(`[TerminalMonitor] Matched script: ${scriptName} (${pattern.manager})`);
                    return script;
                }
            }
        }

        return null;
    }

    /**
     * 根据脚本名称查找脚本
     */
    private async findScriptByName(scriptName: string): Promise<NpmScript | null> {
        // 扫描所有脚本
        const allScripts = await this.packageScanner.scanAllScripts();
        
        // 查找匹配的脚本
        const matchedScript = allScripts.find(script => script.name === scriptName);
        
        return matchedScript || null;
    }

    /**
     * 记录脚本执行
     */
    private async recordScriptExecution(script: NpmScript): Promise<void> {
        await this.historyManager.addToHistory(script);
        console.log(`[TerminalMonitor] Recorded script execution: ${script.name}`);
        
        // 显示通知（可选）
        const config = vscode.workspace.getConfiguration('scriptButler');
        const showNotifications = config.get<boolean>('terminalMonitoring.showNotifications', false);
        
        if (showNotifications) {
            vscode.window.showInformationMessage(
                `已记录脚本执行: ${script.name}`,
                { modal: false }
            );
        }
    }

    /**
     * 获取监听统计信息
     */
    getStats(): TerminalMonitorStats {
        return { ...this.stats };
    }

    /**
     * 触发统计信息变化事件
     */
    private emitStatsChange(): void {
        this.statsChangeEmitter.fire(this.getStats());
    }

    /**
     * 检查是否有任何终端支持 shell integration
     */
    hasIntegratedTerminals(): boolean {
        return this.stats.integratedTerminals > 0;
    }

    /**
     * 获取状态描述
     */
    getStatusDescription(): string {
        if (this.stats.integratedTerminals === 0) {
            return '终端监听: ⏳ 等待 Shell Integration 激活';
        }
        
        return `终端监听: ✅ 已启用 (${this.stats.integratedTerminals}/${this.stats.totalTerminals} 终端支持)`;
    }

    /**
     * 清理资源
     */
    dispose(): void {
        console.log('[TerminalMonitor] Disposing terminal monitor...');
        this.disposables.forEach(d => d.dispose());
        this.monitoredTerminals.clear();
        this.statsChangeEmitter.dispose();
    }
}

