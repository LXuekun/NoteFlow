@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
set PATH=C:\Users\luxue\.cargo\bin;%PATH%
cd d:\workspace\note\src-tauri
cargo tauri dev