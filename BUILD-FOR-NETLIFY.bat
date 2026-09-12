@echo off
title Hynson Roofing - build for sharing
cd /d "%~dp0"
set CI=false
set GENERATE_SOURCEMAP=false
if not exist node_modules call npm install --no-audit --no-fund
call npm run build
if errorlevel 1 goto oops
del /q build\static\js\*.map 2>nul
del /q build\static\css\*.map 2>nul
echo.
echo  Done. The "build" folder in here is ready to publish.
echo.
goto end
:oops
echo.
echo  Build failed - copy the red error text above.
:end
pause
