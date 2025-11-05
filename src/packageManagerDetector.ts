import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 支持的包管理器类型
 */
export enum PackageManager {
    NPM = 'npm',
    PNPM = 'pnpm',
    YARN = 'yarn',
    YARN_BERRY = 'yarn-berry'
}

/**
 * 包管理器配置
 */
interface PackageManagerConfig {
    name: string;
    runCommand: (scriptName: string) => string;
    lockFile: string;
    priority: number; // 优先级，数字越大优先级越高
}

/**
 * 包管理器检测器
 */
export class PackageManagerDetector {
    private static readonly PACKAGE_MANAGERS: Record<PackageManager, PackageManagerConfig> = {
        [PackageManager.PNPM]: {
            name: 'pnpm',
            runCommand: (scriptName: string) => `pnpm run ${scriptName}`,
            lockFile: 'pnpm-lock.yaml',
            priority: 3
        },
        [PackageManager.YARN_BERRY]: {
            name: 'Yarn Berry',
            runCommand: (scriptName: string) => `yarn run ${scriptName}`,
            lockFile: 'yarn.lock',
            priority: 2
        },
        [PackageManager.YARN]: {
            name: 'Yarn',
            runCommand: (scriptName: string) => `yarn ${scriptName}`,
            lockFile: 'yarn.lock',
            priority: 2
        },
        [PackageManager.NPM]: {
            name: 'npm',
            runCommand: (scriptName: string) => `npm run ${scriptName}`,
            lockFile: 'package-lock.json',
            priority: 1
        }
    };

    private cache: Map<string, PackageManager> = new Map();

    /**
     * 检测指定目录使用的包管理器
     */
    async detectPackageManager(packageJsonPath: string): Promise<PackageManager> {
        const dir = path.dirname(packageJsonPath);

        // 检查缓存
        if (this.cache.has(dir)) {
            return this.cache.get(dir)!;
        }

        // 1. 检查用户配置
        const configuredPM = this.getConfiguredPackageManager();
        if (configuredPM) {
            this.cache.set(dir, configuredPM);
            return configuredPM;
        }

        // 2. 检测锁文件
        const detectedPM = await this.detectByLockFile(dir);
        this.cache.set(dir, detectedPM);
        return detectedPM;
    }

    /**
     * 通过锁文件检测包管理器
     */
    private async detectByLockFile(dir: string): Promise<PackageManager> {
        const detections: Array<{ pm: PackageManager; priority: number }> = [];

        // 检查所有锁文件
        for (const [pm, config] of Object.entries(PackageManagerDetector.PACKAGE_MANAGERS)) {
            const lockFilePath = path.join(dir, config.lockFile);
            if (await this.fileExists(lockFilePath)) {
                // 对于 yarn.lock，需要进一步判断是 Yarn 还是 Yarn Berry
                if (pm === PackageManager.YARN || pm === PackageManager.YARN_BERRY) {
                    const isYarnBerry = await this.isYarnBerry(dir);
                    if (isYarnBerry && pm === PackageManager.YARN_BERRY) {
                        detections.push({ pm: pm as PackageManager, priority: config.priority });
                    } else if (!isYarnBerry && pm === PackageManager.YARN) {
                        detections.push({ pm: pm as PackageManager, priority: config.priority });
                    }
                } else {
                    detections.push({ pm: pm as PackageManager, priority: config.priority });
                }
            }
        }

        // 如果检测到多个，返回优先级最高的
        if (detections.length > 0) {
            detections.sort((a, b) => b.priority - a.priority);
            return detections[0].pm;
        }

        // 默认使用 npm
        return PackageManager.NPM;
    }

    /**
     * 判断是否是 Yarn Berry (Yarn 2+)
     */
    private async isYarnBerry(dir: string): Promise<boolean> {
        // 检查 .yarnrc.yml 文件（Yarn Berry 的配置文件）
        const yarnrcPath = path.join(dir, '.yarnrc.yml');
        if (await this.fileExists(yarnrcPath)) {
            return true;
        }

        // 检查 .yarn/releases 目录
        const releasesPath = path.join(dir, '.yarn', 'releases');
        if (await this.fileExists(releasesPath)) {
            return true;
        }

        return false;
    }

    /**
     * 获取用户配置的包管理器
     */
    private getConfiguredPackageManager(): PackageManager | null {
        const config = vscode.workspace.getConfiguration('npmScriptManager');
        const configured = config.get<string>('packageManager');

        if (configured && configured in PackageManager) {
            return configured as PackageManager;
        }

        return null;
    }

    /**
     * 获取执行命令
     */
    getRunCommand(packageManager: PackageManager, scriptName: string): string {
        const config = PackageManagerDetector.PACKAGE_MANAGERS[packageManager];
        return config.runCommand(scriptName);
    }

    /**
     * 获取包管理器显示名称
     */
    getPackageManagerName(packageManager: PackageManager): string {
        return PackageManagerDetector.PACKAGE_MANAGERS[packageManager].name;
    }

    /**
     * 检查文件是否存在
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * 获取所有支持的包管理器列表
     */
    static getSupportedPackageManagers(): PackageManager[] {
        return Object.values(PackageManager);
    }
}

