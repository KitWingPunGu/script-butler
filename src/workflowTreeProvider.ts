import * as vscode from 'vscode';
import { Workflow, WorkflowStep } from './types';
import { WorkflowManager } from './workflowManager';

/**
 * 工作流步骤树项
 */
class WorkflowStepTreeItem extends vscode.TreeItem {
    constructor(
        public readonly step: WorkflowStep,
        public readonly stepNumber: number
    ) {
        // 根据步骤类型显示不同的标签
        const label = step.type === 'command' && step.command
            ? `${stepNumber}. ${step.command}`
            : `${stepNumber}. ${step.scriptName}`;

        super(label, vscode.TreeItemCollapsibleState.None);

        const mode = step.mode === 'serial' ? '串行' : '并行';
        const continueOnError = step.continueOnError ? '失败继续' : '失败停止';

        // 根据步骤类型生成不同的 tooltip
        if (step.type === 'command' && step.command) {
            this.tooltip = `命令: ${step.command}\n` +
                          `模式: ${mode}\n` +
                          `错误处理: ${continueOnError}`;
        } else {
            this.tooltip = `脚本: ${step.scriptName}\n` +
                          `路径: ${step.packageJsonPath}\n` +
                          `模式: ${mode}\n` +
                          `错误处理: ${continueOnError}`;
        }

        this.description = mode;
        this.contextValue = 'workflowStep';

        // 使用不同图标表示步骤类型和执行模式
        if (step.type === 'command') {
            this.iconPath = new vscode.ThemeIcon(
                step.mode === 'serial' ? 'terminal' : 'terminal-bash',
                new vscode.ThemeColor('terminal.ansiGreen')
            );
        } else {
            this.iconPath = new vscode.ThemeIcon(
                step.mode === 'serial' ? 'arrow-right' : 'arrow-both'
            );
        }
    }
}

/**
 * 工作流树项
 */
class WorkflowTreeItem extends vscode.TreeItem {
    constructor(
        public readonly workflow: Workflow
    ) {
        super(workflow.name || '未命名工作流', vscode.TreeItemCollapsibleState.Collapsed);

        this.tooltip = workflow.description || workflow.name || '未命名工作流';

        // 安全地获取步骤数量
        const stepCount = workflow.steps && Array.isArray(workflow.steps)
            ? workflow.steps.length
            : 0;

        this.description = `${stepCount} 个步骤`;
        this.contextValue = 'workflow';

        // 使用工作流图标
        this.iconPath = new vscode.ThemeIcon('symbol-event');

        // 点击执行工作流
        this.command = {
            command: 'scriptButler.runWorkflow',
            title: '执行工作流',
            arguments: [workflow]
        };
    }
}

/**
 * 提供工作流树视图数据
 */
export class WorkflowTreeProvider implements vscode.TreeDataProvider<WorkflowTreeItem | WorkflowStepTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkflowTreeItem | WorkflowStepTreeItem | undefined | null | void> = 
        new vscode.EventEmitter<WorkflowTreeItem | WorkflowStepTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkflowTreeItem | WorkflowStepTreeItem | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    constructor(
        private workflowManager: WorkflowManager
    ) {}

    /**
     * 刷新树视图（不重新加载数据）
     */
    refresh(): void {
        // 只触发树视图刷新事件，不重新加载数据
        // WorkflowManager 内部数据已经是最新的
        const workflows = this.workflowManager.getAllWorkflows();
        console.log(`[WorkflowTreeProvider] refresh() - 当前工作流数量: ${workflows.length}`, workflows.map(wf => wf.name));
        this._onDidChangeTreeData.fire();
    }

    /**
     * 重新加载并刷新树视图（从配置文件重新加载）
     */
    reload(): void {
        // 从配置文件重新加载数据
        console.log('[WorkflowTreeProvider] reload() - 从配置文件重新加载工作流');
        this.workflowManager.refresh();
        const workflows = this.workflowManager.getAllWorkflows();
        console.log(`[WorkflowTreeProvider] reload() - 重新加载后工作流数量: ${workflows.length}`, workflows.map(wf => wf.name));
        this._onDidChangeTreeData.fire();
    }

    /**
     * 获取树项
     */
    getTreeItem(element: WorkflowTreeItem | WorkflowStepTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * 获取子项
     */
    async getChildren(element?: WorkflowTreeItem | WorkflowStepTreeItem): Promise<(WorkflowTreeItem | WorkflowStepTreeItem)[]> {
        const elementType = element instanceof WorkflowTreeItem ? 'WorkflowTreeItem' :
                           element instanceof WorkflowStepTreeItem ? 'WorkflowStepTreeItem' : 'root';
        console.log('[WorkflowTreeProvider] getChildren() 被调用, element:', elementType);

        if (!element) {
            // 根级别：显示所有工作流
            const workflows = this.workflowManager.getAllWorkflows();
            console.log(`[WorkflowTreeProvider] getChildren() - 获取到 ${workflows.length} 个工作流:`, workflows);

            if (workflows.length === 0) {
                console.log('[WorkflowTreeProvider] getChildren() - 工作流列表为空，返回空数组');
                return [];
            }

            // 过滤掉无效的工作流
            const validWorkflows = workflows.filter(wf => {
                const isValid = wf && wf.name;
                if (!isValid) {
                    console.log('[WorkflowTreeProvider] getChildren() - 发现无效工作流:', wf);
                }
                return isValid;
            });
            console.log(`[WorkflowTreeProvider] getChildren() - 过滤后有效工作流数量: ${validWorkflows.length}`);
            console.log('[WorkflowTreeProvider] getChildren() - 有效工作流列表:', validWorkflows.map(wf => wf.name));

            const treeItems = validWorkflows.map(wf => new WorkflowTreeItem(wf));
            console.log(`[WorkflowTreeProvider] getChildren() - 返回 ${treeItems.length} 个树项`);
            return treeItems;
        } else if (element instanceof WorkflowTreeItem) {
            // 工作流级别：显示步骤
            const workflow = element.workflow;

            // 验证步骤数组
            if (!workflow.steps || !Array.isArray(workflow.steps)) {
                return [];
            }

            return workflow.steps
                .filter(step => step !== null && step !== undefined)
                .map((step, index) =>
                    new WorkflowStepTreeItem(step, index + 1)
                );
        } else {
            // 步骤级别：无子项
            return [];
        }
    }
}

