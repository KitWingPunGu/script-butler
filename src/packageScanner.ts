import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { NpmScript } from './types';

/**
 * Scans workspace for package.json files and extracts NPM scripts
 */
export class PackageScanner {
    /**
     * Find all package.json files in the workspace
     */
    async findPackageJsonFiles(): Promise<vscode.Uri[]> {
        const packageJsonFiles = await vscode.workspace.findFiles(
            '**/package.json',
            '**/node_modules/**'
        );
        return packageJsonFiles;
    }

    /**
     * Parse a package.json file and extract scripts
     */
    async parsePackageJson(uri: vscode.Uri): Promise<NpmScript[]> {
        try {
            const content = await fs.promises.readFile(uri.fsPath, 'utf-8');
            const packageJson = JSON.parse(content);
            
            if (!packageJson.scripts || typeof packageJson.scripts !== 'object') {
                return [];
            }

            const scripts: NpmScript[] = [];
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
            const workspaceFolderPath = workspaceFolder?.uri.fsPath || '';
            
            for (const [name, command] of Object.entries(packageJson.scripts)) {
                if (typeof command === 'string') {
                    scripts.push({
                        name,
                        command,
                        packageJsonPath: uri.fsPath,
                        workspaceFolder: workspaceFolderPath
                    });
                }
            }

            return scripts;
        } catch (error) {
            console.error(`Error parsing package.json at ${uri.fsPath}:`, error);
            return [];
        }
    }

    /**
     * Scan all package.json files and return all scripts
     */
    async scanAllScripts(): Promise<NpmScript[]> {
        const packageJsonFiles = await this.findPackageJsonFiles();
        const allScripts: NpmScript[] = [];

        for (const file of packageJsonFiles) {
            const scripts = await this.parsePackageJson(file);
            allScripts.push(...scripts);
        }

        return allScripts;
    }

    /**
     * Get the directory containing package.json for a script
     */
    getScriptDirectory(script: NpmScript): string {
        return path.dirname(script.packageJsonPath);
    }

    /**
     * Watch for changes to package.json files
     */
    createFileWatcher(callback: () => void): vscode.FileSystemWatcher {
        const watcher = vscode.workspace.createFileSystemWatcher('**/package.json');
        
        watcher.onDidChange(callback);
        watcher.onDidCreate(callback);
        watcher.onDidDelete(callback);
        
        return watcher;
    }
}

