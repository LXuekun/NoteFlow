@echo off
echo ========================================
echo NoteFlow Release Build Script
echo ========================================

REM Setup Visual Studio environment
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"

REM Setup Rust PATH
set PATH=C:\Users\luxue\.cargo\bin;%PATH%

REM Enter project directory
cd /d "%~dp0"

echo.
echo [1/3] Building frontend...
call npm run build
if errorlevel 1 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Building Tauri release...
cd src-tauri
cargo tauri build
if errorlevel 1 (
    echo Tauri build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Build completed!
echo.
echo Output files:
echo   - EXE: src-tauri\target\release\noteflow.exe
echo   - MSI: src-tauri\target\release\bundle\msi\
echo   - NSIS: src-tauri\target\release\bundle\nsis\
echo.

REM Open output directory
explorer "src-tauri\target\release\bundle"

pause