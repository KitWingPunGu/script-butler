import * as vscode from 'vscode';
import { Workflow, WorkflowStep } from './types';

/**
 * 配置键
 */
const WORKFLOW_CONFIG_KEY = 'scriptButler.workflows';

/**
 * 管理工作流
 */
export class WorkflowManager {
    private workflows: Workflow[] = [];

    constructor() {
        this.loadWorkflows();
    }

    /**
     * 从 workspace settings 加载工作流
     */
    private loadWorkflows(): void {
        const config = vscode.workspace.getConfiguration();
        const stored = config.get<Workflow[]>(WORKFLOW_CONFIG_KEY, []);
        this.workflows = stored;
        console.log(`[WorkflowManager] 已加载 ${this.workflows.length} 个工作流:`, this.workflows.map(wf => wf.name));
    }

    /**
     * 保存工作流到 workspace settings
     */
    private async saveWorkflows(): Promise<void> {
        console.log(`[WorkflowManager] 正在保存 ${this.workflows.length} 个工作流:`, this.workflows.map(wf => wf.name));
        const config = vscode.workspace.getConfiguration();
        await config.update(WORKFLOW_CONFIG_KEY, this.workflows, vscode.ConfigurationTarget.Workspace);
        console.log('[WorkflowManager] 工作流已保存到配置');
    }

    /**
     * 获取所有工作流
     */
    getAllWorkflows(): Workflow[] {
        return [...this.workflows];
    }

    /**
     * 根据 ID 获取工作流
     */
    getWorkflowById(id: string): Workflow | undefined {
        return this.workflows.find(wf => wf.id === id);
    }

    /**
     * 创建工作流
     */
    async createWorkflow(name: string, description: string | undefined, steps: WorkflowStep[]): Promise<Workflow> {
        const id = `workflow-${Date.now()}`;
        const workflow: Workflow = {
            id,
            name,
            description,
            steps
        };

        console.log(`[WorkflowManager] 创建工作流: ${name} (ID: ${id})`);
        this.workflows.push(workflow);
        console.log(`[WorkflowManager] 当前工作流数量: ${this.workflows.length}`);
        await this.saveWorkflows();
        console.log(`[WorkflowManager] 工作流 "${name}" 创建完成`);

        return workflow;
    }

    /**
     * 更新工作流
     */
    async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<boolean> {
        const workflow = this.workflows.find(wf => wf.id === id);
        
        if (workflow) {
            Object.assign(workflow, updates);
            await this.saveWorkflows();
            return true;
        }

        return false;
    }

    /**
     * 删除工作流
     */
    async deleteWorkflow(id: string): Promise<boolean> {
        const index = this.workflows.findIndex(wf => wf.id === id);
        
        if (index !== -1) {
            this.workflows.splice(index, 1);
            await this.saveWorkflows();
            return true;
        }

        return false;
    }

    /**
     * 清空所有工作流
     */
    async clearAllWorkflows(): Promise<void> {
        this.workflows = [];
        await this.saveWorkflows();
    }

    /**
     * 刷新工作流（从配置重新加载）
     */
    refresh(): void {
        this.loadWorkflows();
    }
}

