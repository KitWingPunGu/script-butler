import * as vscode from 'vscode';
import { PackageScanner } from './packageScanner';
import { FavoritesManager } from './favoritesManager';
import { ScriptsTreeProvider } from './scriptsTreeProvider';
import { FavoritesTreeProvider } from './favoritesTreeProvider';
import { ScriptExecutor } from './scriptExecutor';
import { HistoryManager } from './historyManager';
import { HistoryTreeProvider } from './historyTreeProvider';
import { WorkflowManager } from './workflowManager';
import { WorkflowTreeProvider } from './workflowTreeProvider';
import { WorkflowExecutor } from './workflowExecutor';
import { WorkflowCreator } from './workflowCreator';
import { GitCommandManager } from './gitCommandManager';
import { GitCommandTreeProvider, GitCommandTreeItem } from './gitCommandTreeProvider';
import { TerminalMonitor } from './terminalMonitor';
import { NpmScript, NpmScriptTreeItem, Workflow, GitCommand } from './types';

export function activate(context: vscode.ExtensionContext) {
    console.log('脚本管家已激活');

    // Initialize core components
    const packageScanner = new PackageScanner();
    const favoritesManager = new FavoritesManager(context);
    const scriptExecutor = new ScriptExecutor();
    const historyManager = new HistoryManager(context);
    const workflowManager = new WorkflowManager();
    const workflowExecutor = new WorkflowExecutor(scriptExecutor);
    const gitCommandManager = new GitCommandManager(context);

    // Initialize tree providers
    const scriptsTreeProvider = new ScriptsTreeProvider(
        context,
        packageScanner,
        favoritesManager,
        scriptExecutor
    );
    const favoritesTreeProvider = new FavoritesTreeProvider(
        favoritesManager,
        scriptsTreeProvider,
        gitCommandManager
    );
    const historyTreeProvider = new HistoryTreeProvider(historyManager);
    const workflowTreeProvider = new WorkflowTreeProvider(workflowManager);
    const gitCommandTreeProvider = new GitCommandTreeProvider(gitCommandManager);

    // Register tree views
    const scriptsTreeView = vscode.window.createTreeView('npmScripts', {
        treeDataProvider: scriptsTreeProvider,
        showCollapseAll: true
    });

    const favoritesTreeView = vscode.window.createTreeView('npmFavorites', {
        treeDataProvider: favoritesTreeProvider,
        showCollapseAll: false
    });

    const historyTreeView = vscode.window.createTreeView('npmHistory', {
        treeDataProvider: historyTreeProvider,
        showCollapseAll: false
    });

    const workflowTreeView = vscode.window.createTreeView('npmWorkflows', {
        treeDataProvider: workflowTreeProvider,
        showCollapseAll: true
    });

    const gitCommandTreeView = vscode.window.createTreeView('gitCommands', {
        treeDataProvider: gitCommandTreeProvider,
        showCollapseAll: false
    });

    // Initialize Terminal Monitor (optional feature)
    let terminalMonitor: TerminalMonitor | undefined;
    const enableTerminalMonitoring = vscode.workspace
        .getConfiguration('scriptButler')
        .get<boolean>('enableTerminalMonitoring', false);

    if (enableTerminalMonitoring) {
        terminalMonitor = new TerminalMonitor(historyManager, packageScanner);
        context.subscriptions.push(terminalMonitor);

        // 将 terminalMonitor 传递给 historyTreeProvider
        historyTreeProvider.setTerminalMonitor(terminalMonitor);

        // 监听统计信息变化，刷新历史视图
        terminalMonitor.onStatsChange(() => {
            historyTreeProvider.refresh();
        });

        console.log('[ScriptButler] Terminal monitoring enabled');
        vscode.window.showInformationMessage(
            '脚本管家：终端监听功能已启用（实验性）',
            { modal: false }
        );
    } else {
        console.log('[ScriptButler] Terminal monitoring disabled');
        // 确保 historyTreeProvider 知道没有 terminalMonitor
        historyTreeProvider.setTerminalMonitor(undefined);
    }

    // Initial load of scripts
    scriptsTreeProvider.refresh().then(() => {
        // Refresh all views after scripts are loaded
        favoritesTreeProvider.refresh();
        historyTreeProvider.refresh();
    });

    // Set up file watcher
    const fileWatcher = packageScanner.createFileWatcher(async () => {
        await scriptsTreeProvider.refresh();

        // 自动清理失效的收藏和历史
        const allScripts = scriptsTreeProvider.getAllScripts();
        const allGitCommands = gitCommandManager.getAllCommands();
        await favoritesManager.cleanupInvalidFavorites(allScripts, allGitCommands);
        await historyManager.cleanupInvalidHistory(allScripts);

        favoritesTreeProvider.refresh();
        historyTreeProvider.refresh();
    });

    // 监听工作流配置变化，自动重新加载工作流数据
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('scriptButler.workflows')) {
            console.log('[ScriptButler] Workflow configuration changed, reloading...');
            workflowTreeProvider.reload();
        }
    });

    // Register commands
    
    // Refresh command
    const refreshCommand = vscode.commands.registerCommand(
        'npmScriptManager.refresh',
        async () => {
            await scriptsTreeProvider.refresh();

            // 清理失效的收藏
            const allScripts = scriptsTreeProvider.getAllScripts();
            const allGitCommands = gitCommandManager.getAllCommands();
            const removedCount = await favoritesManager.cleanupInvalidFavorites(allScripts, allGitCommands);

            favoritesTreeProvider.refresh();

            if (removedCount > 0) {
                vscode.window.showInformationMessage(
                    `脚本已刷新，已移除 ${removedCount} 个失效的收藏`
                );
            } else {
                vscode.window.showInformationMessage('脚本已刷新');
            }
        }
    );

    // 诊断命令：检查工作流状态
    const diagnoseWorkflowCommand = vscode.commands.registerCommand(
        'scriptButler.diagnoseWorkflow',
        () => {
            console.log('='.repeat(80));
            console.log('[诊断] 🔍 诊断命令被调用了！');
            console.log('='.repeat(80));

            const workflows = workflowManager.getAllWorkflows();
            console.log('=== 工作流诊断信息 ===');
            console.log(`工作流数量: ${workflows.length}`);
            console.log('工作流列表:', JSON.stringify(workflows, null, 2));

            const config = vscode.workspace.getConfiguration();
            const stored = config.get('scriptButler.workflows');
            console.log('配置中的工作流:', JSON.stringify(stored, null, 2));

            vscode.window.showInformationMessage(
                `工作流数量: ${workflows.length}，详情请查看控制台`,
                '刷新视图', '重新加载', '测试创建'
            ).then(selection => {
                if (selection === '刷新视图') {
                    console.log('[诊断] 执行 refresh()');
                    workflowTreeProvider.refresh();
                } else if (selection === '重新加载') {
                    console.log('[诊断] 执行 reload()');
                    workflowTreeProvider.reload();
                } else if (selection === '测试创建') {
                    console.log('[诊断] 手动调用创建工作流命令');
                    vscode.commands.executeCommand('scriptButler.createWorkflow');
                }
            });
        }
    );

    // Run script command
    const runScriptCommand = vscode.commands.registerCommand(
        'npmScriptManager.runScript',
        async (scriptOrTreeItem: NpmScript | NpmScriptTreeItem) => {
            let script: NpmScript;

            if (scriptOrTreeItem instanceof NpmScriptTreeItem) {
                script = scriptOrTreeItem.script;
            } else {
                script = scriptOrTreeItem;
            }

            await scriptExecutor.executeScript(script);

            // 添加到历史记录
            await historyManager.addToHistory(script);
            historyTreeProvider.refresh();
        }
    );

    // Add to favorites command
    const addToFavoritesCommand = vscode.commands.registerCommand(
        'npmScriptManager.addToFavorites',
        async (treeItem: NpmScriptTreeItem) => {
            if (treeItem && treeItem.script) {
                await favoritesManager.addToFavorites(treeItem.script);
                scriptsTreeProvider.refresh();
                favoritesTreeProvider.refresh();
            }
        }
    );

    // Remove from favorites command
    const removeFromFavoritesCommand = vscode.commands.registerCommand(
        'npmScriptManager.removeFromFavorites',
        async (treeItem: NpmScriptTreeItem) => {
            if (treeItem && treeItem.script) {
                await favoritesManager.removeFromFavorites(treeItem.script);
                scriptsTreeProvider.refresh();
                favoritesTreeProvider.refresh();
            }
        }
    );

    // Filter scripts command
    const filterScriptsCommand = vscode.commands.registerCommand(
        'npmScriptManager.filterScripts',
        async () => {
            const filterText = await vscode.window.showInputBox({
                prompt: '输入文本以按名称或命令过滤脚本',
                placeHolder: '例如：build, test, dev',
                value: ''
            });

            if (filterText !== undefined) {
                scriptsTreeProvider.setFilter(filterText);
            }
        }
    );

    // Clear filter command
    const clearFilterCommand = vscode.commands.registerCommand(
        'npmScriptManager.clearFilter',
        () => {
            scriptsTreeProvider.clearFilter();
            vscode.window.showInformationMessage('过滤已清除');
        }
    );

    // Clear history command
    const clearHistoryCommand = vscode.commands.registerCommand(
        'scriptButler.clearHistory',
        async () => {
            const result = await vscode.window.showWarningMessage(
                '确定要清空所有历史记录吗？',
                '确定',
                '取消'
            );

            if (result === '确定') {
                await historyManager.clearHistory();
                historyTreeProvider.refresh();
                vscode.window.showInformationMessage('历史记录已清空');
            }
        }
    );

    // Create workflow command
    const workflowCreator = new WorkflowCreator();
    const createWorkflowCommand = vscode.commands.registerCommand(
        'scriptButler.createWorkflow',
        async () => {
            console.log('='.repeat(80));
            console.log('[Extension] ⚡⚡⚡ 创建工作流命令被调用了！⚡⚡⚡');
            console.log('[Extension] 开始创建工作流...');
            console.log('='.repeat(80));
            const allScripts = scriptsTreeProvider.getAllScripts();

            // 使用新的工作流创建器
            const result = await workflowCreator.createWorkflow(allScripts);

            if (!result) {
                console.log('[Extension] 用户取消了工作流创建');
                return;
            }

            console.log('[Extension] 工作流创建器返回结果:', result);
            console.log('[Extension] 调用 workflowManager.createWorkflow()...');

            await workflowManager.createWorkflow(result.name, result.description, result.steps);

            console.log('[Extension] workflowManager.createWorkflow() 完成');
            console.log('[Extension] 当前工作流列表:', workflowManager.getAllWorkflows());

            // 使用 refresh() 而不是 reload()，因为内存数据已经是最新的
            // reload() 会从配置重新加载，可能导致竞态条件（配置还没写入完成）
            console.log('[Extension] 调用 workflowTreeProvider.refresh()...');
            workflowTreeProvider.refresh();

            // 移除提示消息，避免影响体验
            // vscode.window.showInformationMessage(`工作流 "${result.name}" 已创建`);
            console.log(`[Extension] ✅ 工作流 "${result.name}" 已创建`);
        }
    );

    // Import workflow from file command
    const importWorkflowCommand = vscode.commands.registerCommand(
        'scriptButler.importWorkflow',
        async () => {
            console.log('='.repeat(80));
            console.log('[Extension] 📥 导入工作流命令被调用了！');
            console.log('='.repeat(80));

            const result = await workflowCreator.importFromFile();

            if (!result) {
                console.log('[Extension] 用户取消了工作流导入');
                return;
            }

            console.log('[Extension] 工作流导入成功:', result.name);
            console.log('[Extension] 调用 workflowManager.createWorkflow()...');

            await workflowManager.createWorkflow(result.name, result.description, result.steps);

            console.log('[Extension] workflowManager.createWorkflow() 完成');
            console.log('[Extension] 当前工作流列表:', workflowManager.getAllWorkflows());

            console.log('[Extension] 调用 workflowTreeProvider.refresh()...');
            workflowTreeProvider.refresh();

            // 移除提示消息，避免影响体验
            // vscode.window.showInformationMessage(`工作流 "${result.name}" 已导入`);
            console.log(`[Extension] ✅ 工作流 "${result.name}" 已导入`);
        }
    );

    // Run workflow command
    const runWorkflowCommand = vscode.commands.registerCommand(
        'scriptButler.runWorkflow',
        async (item: any) => {
            // 从 TreeItem 中提取 workflow 对象
            const workflow: Workflow = item?.workflow || item;

            // 验证工作流对象
            if (!workflow || !workflow.id || !workflow.name) {
                vscode.window.showErrorMessage('无法执行工作流：工作流数据无效');
                return;
            }

            const allScripts = scriptsTreeProvider.getAllScripts();
            await workflowExecutor.executeWorkflow(workflow, allScripts);
        }
    );

    // Edit workflow command
    const editWorkflowCommand = vscode.commands.registerCommand(
        'scriptButler.editWorkflow',
        async (item: any) => {
            // 从 TreeItem 中提取 workflow 对象
            const workflow: Workflow = item?.workflow || item;

            // 验证工作流对象
            if (!workflow || !workflow.id || !workflow.name) {
                vscode.window.showErrorMessage('无法编辑工作流：工作流数据无效');
                return;
            }

            // 1. 编辑工作流名称
            const newName = await vscode.window.showInputBox({
                prompt: '输入新的工作流名称',
                value: workflow.name,
                placeHolder: '例如：完整部署流程'
            });

            if (!newName) {
                return; // 用户取消
            }

            // 2. 编辑工作流描述
            const newDescription = await vscode.window.showInputBox({
                prompt: '输入新的工作流描述（可选）',
                value: workflow.description || '',
                placeHolder: '例如：清理、构建、测试、部署'
            });

            // 3. 询问是否编辑步骤
            const editSteps = await vscode.window.showQuickPick(
                [
                    { label: '$(check) 保持步骤不变', value: false },
                    { label: '$(edit) 重新创建步骤', value: true }
                ],
                {
                    placeHolder: '是否重新创建工作流步骤？'
                }
            );

            if (!editSteps) {
                return; // 用户取消
            }

            let newSteps = workflow.steps;

            if (editSteps.value) {
                // 重新创建步骤
                const allScripts = scriptsTreeProvider.getAllScripts();
                const result = await workflowCreator.createWorkflow(allScripts);

                if (!result) {
                    return; // 用户取消
                }

                newSteps = result.steps;
            }

            // 更新工作流
            await workflowManager.updateWorkflow(workflow.id, {
                name: newName,
                description: newDescription,
                steps: newSteps
            });

            // 使用 refresh() 而不是 reload()，因为内存数据已经是最新的
            // reload() 会从配置重新加载，可能导致竞态条件（配置还没写入完成）
            workflowTreeProvider.refresh();

            // 移除提示消息，避免影响体验
            // vscode.window.showInformationMessage(`工作流 "${newName}" 已更新`);
            console.log(`[Extension] ✅ 工作流 "${newName}" 已更新`);
        }
    );

    // Delete workflow command
    const deleteWorkflowCommand = vscode.commands.registerCommand(
        'scriptButler.deleteWorkflow',
        async (item: any) => {
            // 从 TreeItem 中提取 workflow 对象
            const workflow: Workflow = item?.workflow || item;

            // 验证工作流对象
            if (!workflow || !workflow.id || !workflow.name) {
                vscode.window.showErrorMessage('无法删除工作流：工作流数据无效');
                return;
            }

            // 保存工作流名称，因为删除后可能无法访问
            const workflowName = workflow.name;

            const result = await vscode.window.showWarningMessage(
                `确定要删除工作流 "${workflowName}" 吗？`,
                '确定',
                '取消'
            );

            if (result === '确定') {
                const deleted = await workflowManager.deleteWorkflow(workflow.id);

                if (deleted) {
                    // 使用 refresh() 而不是 reload()，因为内存数据已经是最新的
                    // reload() 会从配置重新加载，可能导致竞态条件（配置还没写入完成）
                    workflowTreeProvider.refresh();

                    // 移除提示消息，避免影响体验
                    // vscode.window.showInformationMessage(`工作流 "${workflowName}" 已删除`);
                    console.log(`[Extension] ✅ 工作流 "${workflowName}" 已删除`);
                } else {
                    vscode.window.showErrorMessage(`删除工作流 "${workflowName}" 失败：工作流不存在`);
                }
            }
        }
    );

    // Run Git command
    const runGitCommandCommand = vscode.commands.registerCommand(
        'scriptButler.runGitCommand',
        async (gitCommandOrTreeItem: GitCommand | GitCommandTreeItem) => {
            let gitCommand: GitCommand;

            // 处理两种情况：
            // 1. 点击 TreeItem 本身 -> 传递 GitCommand 对象
            // 2. 点击 inline 按钮 -> 传递 GitCommandTreeItem 对象
            if (gitCommandOrTreeItem instanceof GitCommandTreeItem) {
                gitCommand = gitCommandOrTreeItem.gitCommand;
            } else {
                gitCommand = gitCommandOrTreeItem;
            }

            console.log('runGitCommand called with:', gitCommandOrTreeItem);
            console.log('Resolved gitCommand:', gitCommand);
            console.log('gitCommand.command:', gitCommand.command);
            console.log('gitCommand.name:', gitCommand.name);

            if (!gitCommand || !gitCommand.command) {
                vscode.window.showErrorMessage('无效的 Git 命令对象');
                return;
            }

            await scriptExecutor.executeGitCommand(gitCommand.command, gitCommand.name);
        }
    );

    // Add Git command
    const addGitCommandCommand = vscode.commands.registerCommand(
        'scriptButler.addGitCommand',
        async () => {
            const name = await vscode.window.showInputBox({
                prompt: '输入 Git 命令名称',
                placeHolder: '例如：查看提交历史'
            });

            if (!name) {
                return;
            }

            const command = await vscode.window.showInputBox({
                prompt: '输入 Git 命令',
                placeHolder: '例如：git log --oneline -20'
            });

            if (!command) {
                return;
            }

            const description = await vscode.window.showInputBox({
                prompt: '输入命令描述（可选）',
                placeHolder: '例如：查看最近 20 条提交记录'
            });

            await gitCommandManager.addCustomCommand(name, command, description);
            gitCommandTreeProvider.refresh();
            vscode.window.showInformationMessage(`Git 命令 "${name}" 已添加`);
        }
    );

    // Delete Git command
    const deleteGitCommandCommand = vscode.commands.registerCommand(
        'scriptButler.deleteGitCommand',
        async (gitCommand: GitCommand) => {
            if (!gitCommand.isCustom) {
                vscode.window.showWarningMessage('预置命令不能删除');
                return;
            }

            const result = await vscode.window.showWarningMessage(
                `确定要删除 Git 命令 "${gitCommand.name}" 吗？`,
                '确定',
                '取消'
            );

            if (result === '确定') {
                await gitCommandManager.removeCustomCommand(gitCommand.id);
                gitCommandTreeProvider.refresh();
                vscode.window.showInformationMessage(`Git 命令 "${gitCommand.name}" 已删除`);
            }
        }
    );

    // Add Git command to favorites
    const addGitCommandToFavoritesCommand = vscode.commands.registerCommand(
        'scriptButler.addGitCommandToFavorites',
        async (treeItemOrGitCommand: GitCommandTreeItem | GitCommand) => {
            let gitCommand: GitCommand;

            if (treeItemOrGitCommand instanceof GitCommandTreeItem) {
                gitCommand = treeItemOrGitCommand.gitCommand;
            } else {
                gitCommand = treeItemOrGitCommand;
            }

            await favoritesManager.addGitCommandToFavorites(gitCommand);
            gitCommandTreeProvider.refresh();
            favoritesTreeProvider.refresh();
        }
    );

    // Remove Git command from favorites
    const removeGitCommandFromFavoritesCommand = vscode.commands.registerCommand(
        'scriptButler.removeGitCommandFromFavorites',
        async (treeItemOrGitCommand: GitCommandTreeItem | GitCommand) => {
            let gitCommand: GitCommand;

            if (treeItemOrGitCommand instanceof GitCommandTreeItem) {
                gitCommand = treeItemOrGitCommand.gitCommand;
            } else {
                gitCommand = treeItemOrGitCommand;
            }

            await favoritesManager.removeGitCommandFromFavorites(gitCommand);
            gitCommandTreeProvider.refresh();
            favoritesTreeProvider.refresh();
        }
    );

    // Toggle terminal monitoring command
    const toggleTerminalMonitoringCommand = vscode.commands.registerCommand(
        'scriptButler.toggleTerminalMonitoring',
        async () => {
            const config = vscode.workspace.getConfiguration('scriptButler');
            const currentValue = config.get<boolean>('enableTerminalMonitoring', false);
            const newValue = !currentValue;

            await config.update('enableTerminalMonitoring', newValue, vscode.ConfigurationTarget.Global);

            if (newValue) {
                vscode.window.showInformationMessage(
                    '终端监听功能已启用。请重新加载窗口以生效。',
                    '重新加载'
                ).then(selection => {
                    if (selection === '重新加载') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    '终端监听功能已禁用。请重新加载窗口以生效。',
                    '重新加载'
                ).then(selection => {
                    if (selection === '重新加载') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
        }
    );

    // Add to subscriptions
    context.subscriptions.push(
        scriptsTreeView,
        favoritesTreeView,
        historyTreeView,
        workflowTreeView,
        gitCommandTreeView,
        fileWatcher,
        configChangeListener,
        refreshCommand,
        diagnoseWorkflowCommand,
        runScriptCommand,
        addToFavoritesCommand,
        removeFromFavoritesCommand,
        filterScriptsCommand,
        clearFilterCommand,
        clearHistoryCommand,
        createWorkflowCommand,
        importWorkflowCommand,
        runWorkflowCommand,
        editWorkflowCommand,
        deleteWorkflowCommand,
        runGitCommandCommand,
        addGitCommandCommand,
        deleteGitCommandCommand,
        addGitCommandToFavoritesCommand,
        removeGitCommandFromFavoritesCommand,
        toggleTerminalMonitoringCommand
    );

    // Dispose script executor on deactivation
    context.subscriptions.push({
        dispose: () => scriptExecutor.dispose()
    });
}

export function deactivate() {
    console.log('脚本管家已停用');
}

