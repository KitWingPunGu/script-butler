import * as vscode from 'vscode';
import { Workflow, WorkflowStep, NpmScript } from './types';
import { ScriptExecutor } from './scriptExecutor';

/**
 * 执行工作流
 */
export class WorkflowExecutor {
    constructor(
        private scriptExecutor: ScriptExecutor
    ) {}

    /**
     * 执行工作流
     */
    async executeWorkflow(workflow: Workflow, allScripts: NpmScript[]): Promise<void> {
        // 验证工作流数据
        if (!workflow) {
            vscode.window.showErrorMessage('工作流数据无效：工作流对象为空');
            return;
        }

        if (!workflow.name) {
            vscode.window.showErrorMessage('工作流数据无效：缺少工作流名称');
            return;
        }

        if (!workflow.steps || !Array.isArray(workflow.steps)) {
            vscode.window.showErrorMessage(`工作流 "${workflow.name}" 数据无效：缺少步骤列表`);
            return;
        }

        if (workflow.steps.length === 0) {
            vscode.window.showWarningMessage(`工作流 "${workflow.name}" 没有任何步骤`);
            return;
        }

        // 验证 allScripts
        if (!allScripts || !Array.isArray(allScripts)) {
            vscode.window.showErrorMessage('无法获取脚本列表，请刷新后重试');
            return;
        }

        // 移除提示消息，避免影响体验
        // vscode.window.showInformationMessage(`开始执行工作流: ${workflow.name}`);

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            const stepNumber = i + 1;

            // 验证步骤数据
            if (!step) {
                vscode.window.showErrorMessage(
                    `工作流 "${workflow.name}" 步骤 ${stepNumber} 数据无效：步骤对象为空`
                );
                failedCount++;
                break;
            }

            try {
                // 根据步骤类型执行
                if (step.type === 'command' && step.command) {
                    // 执行任意命令
                    await this.executeCommand(workflow.name, stepNumber, workflow.steps.length, step);
                    successCount++;
                } else {
                    // 执行 NPM 脚本（兼容旧格式）

                    // 验证脚本步骤数据
                    if (!step.scriptName) {
                        vscode.window.showErrorMessage(
                            `工作流 "${workflow.name}" 步骤 ${stepNumber} 数据无效：缺少脚本名称`
                        );
                        failedCount++;
                        if (!step.continueOnError) {
                            break;
                        }
                        continue;
                    }

                    const script = allScripts.find(s =>
                        s.name === step.scriptName &&
                        s.packageJsonPath === step.packageJsonPath
                    );

                    if (!script) {
                        vscode.window.showWarningMessage(
                            `工作流 "${workflow.name}" 步骤 ${stepNumber}: 找不到脚本 "${step.scriptName}"`
                        );

                        if (!step.continueOnError) {
                            failedCount++;
                            break;
                        }
                        continue;
                    }

                    // 移除步骤提示消息
                    // vscode.window.showInformationMessage(
                    //     `工作流 "${workflow.name}" 步骤 ${stepNumber}/${workflow.steps.length}: ${script.name}`
                    // );

                    if (step.mode === 'serial') {
                        // 串行执行：等待完成
                        await this.executeScriptAndWait(script);
                        successCount++;
                    } else {
                        // 并行执行：不等待
                        await this.scriptExecutor.executeScript(script);
                        successCount++;
                    }
                }

            } catch (error) {
                failedCount++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(
                    `工作流 "${workflow.name}" 步骤 ${stepNumber} 失败: ${errorMessage}`
                );

                if (!step.continueOnError) {
                    break;
                }
            }
        }

        // 移除完成消息，避免影响体验
        // if (failedCount === 0) {
        //     vscode.window.showInformationMessage(
        //         `✅ 工作流 "${workflow.name}" 执行完成！成功: ${successCount}`
        //     );
        // } else {
        //     vscode.window.showWarningMessage(
        //         `⚠️ 工作流 "${workflow.name}" 执行完成。成功: ${successCount}, 失败: ${failedCount}`
        //     );
        // }

        // 只在控制台输出执行结果
        if (failedCount === 0) {
            console.log(`[WorkflowExecutor] ✅ 工作流 "${workflow.name}" 执行完成！成功: ${successCount}`);
        } else {
            console.log(`[WorkflowExecutor] ⚠️ 工作流 "${workflow.name}" 执行完成。成功: ${successCount}, 失败: ${failedCount}`);
        }
    }

    /**
     * 执行任意命令
     */
    private async executeCommand(
        workflowName: string,
        stepNumber: number,
        totalSteps: number,
        step: WorkflowStep
    ): Promise<void> {
        if (!step.command) {
            throw new Error('命令为空');
        }

        // 移除步骤提示消息
        // vscode.window.showInformationMessage(
        //     `工作流 "${workflowName}" 步骤 ${stepNumber}/${totalSteps}: ${step.command}`
        // );

        console.log(`[WorkflowExecutor] 步骤 ${stepNumber}/${totalSteps}: ${step.command}`);

        // 获取或创建终端
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('工作流');
        terminal.show();

        // 发送命令到终端
        terminal.sendText(step.command);

        // 如果是串行模式，等待用户确认
        if (step.mode === 'serial') {
            const result = await vscode.window.showInformationMessage(
                `命令 "${step.command}" 正在执行，完成后请点击"继续"`,
                '继续',
                '取消'
            );

            if (result !== '继续') {
                throw new Error('用户取消了工作流执行');
            }
        }
    }

    /**
     * 执行脚本并等待完成
     * 注意：由于 VS Code API 限制，这里使用简化的等待逻辑
     */
    private async executeScriptAndWait(script: NpmScript): Promise<void> {
        await this.scriptExecutor.executeScript(script);
        
        // 注意：VS Code 终端 API 不提供直接的进程完成通知
        // 这里使用一个简化的实现：显示确认对话框让用户确认完成
        const result = await vscode.window.showInformationMessage(
            `脚本 "${script.name}" 正在执行，完成后请点击"继续"`,
            '继续',
            '取消'
        );

        if (result !== '继续') {
            throw new Error('用户取消了工作流执行');
        }
    }
}

