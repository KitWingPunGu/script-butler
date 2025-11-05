#!/bin/bash
# 部署脚本示例

# 清理旧的构建文件
npm run clean

# 安装依赖
npm install

# 运行测试
npm run test

# 构建项目
npm run build

# 部署到服务器
npm run deploy

