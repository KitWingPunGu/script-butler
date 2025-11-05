@echo off
REM 脚本管家 - 构建脚本 (Windows)

echo 🚀 开始构建脚本管家扩展...

REM 1. 清理旧的构建文件
echo 📦 清理旧的构建文件...
if exist out rmdir /s /q out
del /q *.vsix 2>nul

REM 2. 安装依赖
echo 📥 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 安装依赖失败
    exit /b 1
)

REM 3. 编译 TypeScript
echo 🔨 编译 TypeScript...
call npm run compile
if errorlevel 1 (
    echo ❌ 编译失败
    exit /b 1
)

REM 4. 检查编译结果
if not exist out (
    echo ❌ 编译失败：out 目录不存在
    exit /b 1
)

echo ✅ 编译成功

REM 5. 打包扩展
echo 📦 打包扩展...
call npx vsce package
if errorlevel 1 (
    echo ❌ 打包失败
    exit /b 1
)

REM 6. 查找生成的 .vsix 文件
for /f "delims=" %%i in ('dir /b /o-d *.vsix 2^>nul') do (
    set VSIX_FILE=%%i
    goto :found
)

echo ❌ 打包失败：未找到 .vsix 文件
exit /b 1

:found
echo ✅ 打包成功：%VSIX_FILE%

REM 7. 询问是否安装
set /p INSTALL="是否安装扩展？(y/n) "
if /i "%INSTALL%"=="y" (
    echo 📥 安装扩展...
    code --install-extension "%VSIX_FILE%"
    if errorlevel 1 (
        echo ❌ 安装失败
        exit /b 1
    )
    echo ✅ 安装完成
)

echo 🎉 构建完成！
pause

