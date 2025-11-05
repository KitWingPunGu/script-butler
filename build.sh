#!/bin/bash

# 脚本管家 - 构建脚本

set -e  # 遇到错误立即退出

echo "🚀 开始构建脚本管家扩展..."

# 1. 清理旧的构建文件
echo "📦 清理旧的构建文件..."
rm -rf out
rm -f *.vsix

# 2. 安装依赖
echo "📥 安装依赖..."
npm install

# 3. 编译 TypeScript
echo "🔨 编译 TypeScript..."
npm run compile

# 4. 检查编译结果
if [ ! -d "out" ]; then
    echo "❌ 编译失败：out 目录不存在"
    exit 1
fi

echo "✅ 编译成功"

# 5. 打包扩展
echo "📦 打包扩展..."
npx vsce package

# 6. 查找生成的 .vsix 文件
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ 打包失败：未找到 .vsix 文件"
    exit 1
fi

echo "✅ 打包成功：$VSIX_FILE"

# 7. 询问是否安装
read -p "是否安装扩展？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 安装扩展..."
    code --install-extension "$VSIX_FILE"
    echo "✅ 安装完成"
fi

echo "🎉 构建完成！"

