import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowStep, NpmScript } from './types';

/**
 * 工作流创建模式
 */
export enum WorkflowCreationMode {
    FROM_LIST = 'fromList',      // 从列表选择
    FROM_TEXT = 'fromText'       // 文本输入
}

/**
 * 工作流创建器
 */
export class WorkflowCreator {
    /**
     * 显示创建工作流对话框
     */
    async createWorkflow(allScripts: NpmScript[]): Promise<{
        name: string;
        description?: string;
        steps: WorkflowStep[];
    } | undefined> {
        // 输入工作流名称
        const name = await vscode.window.showInputBox({
            prompt: '输入工作流名称',
            placeHolder: '例如：完整部署流程'
        });

        if (!name) {
            return undefined;
        }

        // 输入描述（可选）
        const description = await vscode.window.showInputBox({
            prompt: '输入工作流描述（可选）',
            placeHolder: '例如：清理、构建、测试、部署'
        });

        // 选择创建模式
        const modeItems = [
            {
                label: '$(list-unordered) 从列表选择',
                description: '从现有的 NPM 脚本列表中选择',
                mode: WorkflowCreationMode.FROM_LIST
            },
            {
                label: '$(edit) 文本输入',
                description: '直接输入多行命令（支持任意 shell 命令）',
                mode: WorkflowCreationMode.FROM_TEXT
            }
        ];

        const selectedMode = await vscode.window.showQuickPick(modeItems, {
            placeHolder: '选择创建方式'
        });

        if (!selectedMode) {
            return undefined;
        }

        let steps: WorkflowStep[];

        if (selectedMode.mode === WorkflowCreationMode.FROM_LIST) {
            // 模式 1：从列表选择
            const result = await this.createFromList(allScripts);
            if (!result) {
                return undefined;
            }
            steps = result;
        } else {
            // 模式 2：文本输入
            const result = await this.createFromText();
            if (!result) {
                return undefined;
            }
            steps = result;
        }

        return { name, description, steps };
    }

    /**
     * 模式 1：从列表选择脚本
     */
    private async createFromList(allScripts: NpmScript[]): Promise<WorkflowStep[] | undefined> {
        if (allScripts.length === 0) {
            vscode.window.showWarningMessage('没有可用的脚本');
            return undefined;
        }

        const scriptItems = allScripts.map(script => ({
            label: script.name,
            description: script.command,
            detail: script.packageJsonPath,
            script: script
        }));

        const selectedItems = await vscode.window.showQuickPick(scriptItems, {
            canPickMany: true,
            placeHolder: '选择要包含的脚本（可多选）'
        });

        if (!selectedItems || selectedItems.length === 0) {
            return undefined;
        }

        // 创建工作流步骤
        const steps: WorkflowStep[] = selectedItems.map(item => ({
            type: 'script',
            scriptName: item.script.name,
            packageJsonPath: item.script.packageJsonPath,
            mode: 'serial',
            continueOnError: false
        }));

        return steps;
    }

    /**
     * 模式 2：文本输入命令
     */
    private async createFromText(): Promise<WorkflowStep[] | undefined> {
        console.log('[WorkflowCreator] 开始文本输入模式...');

        // 使用临时编辑器提供更好的多行输入体验
        const content = await this.showMultilineInput(
            '在编辑器中输入命令序列（每行一个命令），完成后点击"确定"',
            '# 每行一个命令\n# 以 # 开头的行会被忽略\n\n',
            '# 每行一个命令\n# 以 # 开头的行会被忽略\n# 示例：\nnpm run clean\nnpm run build\nnpm run test\n'
        );

        console.log('[WorkflowCreator] showMultilineInput 返回:', content ? `内容长度 ${content.length}` : 'undefined (用户取消)');

        if (!content) {
            console.log('[WorkflowCreator] 用户取消了文本输入');
            return undefined;
        }

        // 解析命令
        const commands = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));

        if (commands.length === 0) {
            vscode.window.showWarningMessage('没有有效的命令');
            return undefined;
        }

        // 创建工作流步骤
        const steps: WorkflowStep[] = commands.map(command => ({
            type: 'command',
            command: command,
            mode: 'serial',
            continueOnError: false
        }));

        // 显示预览
        const preview = this.generatePreview(steps);
        const confirm = await vscode.window.showInformationMessage(
            `将创建包含 ${steps.length} 个步骤的工作流：\n\n${preview}`,
            { modal: true },
            '确定',
            '取消'
        );

        if (confirm !== '确定') {
            return undefined;
        }

        return steps;
    }

    /**
     * 生成步骤预览
     */
    private generatePreview(steps: WorkflowStep[]): string {
        return steps
            .map((step, index) => {
                if (step.type === 'script') {
                    return `${index + 1}. [脚本] ${step.scriptName}`;
                } else {
                    return `${index + 1}. [命令] ${step.command}`;
                }
            })
            .join('\n');
    }

    /**
     * 显示多行文本输入对话框
     * 使用确认对话框而不是保存事件，因为临时文档无法保存
     */
    async showMultilineInput(
        prompt: string,
        placeHolder: string,
        defaultValue?: string
    ): Promise<string | undefined> {
        console.log('[WorkflowCreator] 打开临时编辑器...');

        // 创建一个临时文档来输入多行文本
        const doc = await vscode.workspace.openTextDocument({
            content: defaultValue || '',
            language: 'shellscript'
        });

        const editor = await vscode.window.showTextDocument(doc, {
            preview: false,
            viewColumn: vscode.ViewColumn.Beside
        });

        console.log('[WorkflowCreator] 临时编辑器已打开');

        // 显示提示信息
        const result = await vscode.window.showInformationMessage(
            '请在编辑器中输入命令序列（每行一个命令），完成后点击"确定"按钮',
            { modal: false },
            '确定',
            '取消'
        );

        console.log('[WorkflowCreator] 用户选择:', result);

        if (result === '确定') {
            // 读取编辑器内容
            const content = doc.getText();
            console.log('[WorkflowCreator] 读取到的内容长度:', content.length);

            // 关闭编辑器
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

            return content;
        } else {
            console.log('[WorkflowCreator] 用户取消，关闭编辑器');
            // 关闭编辑器
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

            return undefined;
        }
    }

    /**
     * 使用临时文档创建工作流（更好的多行输入体验）
     */
    async createFromTextWithEditor(): Promise<WorkflowStep[] | undefined> {
        const content = await this.showMultilineInput(
            '在编辑器中输入命令序列（每行一个命令），完成后点击"确定"',
            '# 每行一个命令\n# 以 # 开头的行会被忽略\nnpm run clean\nnpm run build\nnpm run test',
            '# 每行一个命令\n# 以 # 开头的行会被忽略\n\n'
        );

        if (!content) {
            return undefined;
        }

        // 解析命令
        const commands = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));

        if (commands.length === 0) {
            vscode.window.showWarningMessage('没有有效的命令');
            return undefined;
        }

        // 创建工作流步骤
        const steps: WorkflowStep[] = commands.map(command => ({
            type: 'command',
            command: command,
            mode: 'serial',
            continueOnError: false
        }));

        return steps;
    }

    /**
     * 从文件导入工作流
     */
    async importFromFile(): Promise<{
        name: string;
        description?: string;
        steps: WorkflowStep[];
    } | undefined> {
        console.log('[WorkflowCreator] 开始导入工作流...');

        // 打开文件选择对话框
        const fileUris = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: '选择脚本文件',
            filters: {
                '脚本文件': ['sh', 'bat', 'ps1', 'cmd', 'bash'],
                '所有文件': ['*']
            }
        });

        if (!fileUris || fileUris.length === 0) {
            console.log('[WorkflowCreator] 用户取消了文件选择');
            return undefined;
        }

        const filePath = fileUris[0].fsPath;
        console.log('[WorkflowCreator] 选择的文件:', filePath);

        // 读取文件内容
        let content: string;
        try {
            content = fs.readFileSync(filePath, 'utf-8');
            console.log('[WorkflowCreator] 文件内容长度:', content.length);
        } catch (error) {
            vscode.window.showErrorMessage(`无法读取文件: ${error}`);
            console.error('[WorkflowCreator] 读取文件失败:', error);
            return undefined;
        }

        // 解析命令（忽略注释和空行）
        const commands = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                // 过滤空行
                if (line.length === 0) return false;
                // 过滤注释（支持 # 和 REM）
                if (line.startsWith('#')) return false;
                if (line.toUpperCase().startsWith('REM ')) return false;
                // 过滤 shebang
                if (line.startsWith('#!')) return false;
                return true;
            });

        console.log('[WorkflowCreator] 解析到的命令数量:', commands.length);

        if (commands.length === 0) {
            vscode.window.showWarningMessage('文件中没有有效的命令');
            return undefined;
        }

        // 使用文件名作为默认工作流名称
        const fileName = path.basename(filePath, path.extname(filePath));

        // 输入工作流名称
        const name = await vscode.window.showInputBox({
            prompt: '输入工作流名称',
            value: fileName,
            placeHolder: '例如：部署流程'
        });

        if (!name) {
            console.log('[WorkflowCreator] 用户取消了名称输入');
            return undefined;
        }

        // 输入描述（可选）
        const description = await vscode.window.showInputBox({
            prompt: '输入工作流描述（可选）',
            placeHolder: '例如：从脚本文件导入的部署流程'
        });

        // 创建工作流步骤
        const steps: WorkflowStep[] = commands.map(command => ({
            type: 'command',
            command: command,
            mode: 'serial',
            continueOnError: false
        }));

        // 显示预览
        const preview = this.generatePreview(steps);
        const confirm = await vscode.window.showInformationMessage(
            `将创建包含 ${steps.length} 个步骤的工作流：\n\n${preview}`,
            { modal: true },
            '确定',
            '取消'
        );

        if (confirm !== '确定') {
            console.log('[WorkflowCreator] 用户取消了确认');
            return undefined;
        }

        console.log('[WorkflowCreator] 工作流导入成功');
        return { name, description, steps };
    }
}

