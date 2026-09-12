@echo off
title Hynson Roofing - your website
cd /d "%~dp0"
echo.
echo  ============================================
echo    HYNSON ROOFING - starting your website
echo  ============================================
echo.
where node >nul 2>nul
if errorlevel 1 goto nonode
if exist node_modules goto run
echo  First run. Downloading the pieces the site needs.
echo  This takes a few minutes. Leave this window open.
echo.
call npm install --no-audit --no-fund
if errorlevel 1 goto oops
echo.
:run
echo  Starting. Your browser will open in a moment.
echo.
echo  KEEP THIS WINDOW OPEN while you look at the site.
echo  Press Ctrl+C in here when you are finished.
echo.
call npm start
goto end
:nonode
echo  Node.js was not found on this computer.
echo  Install it from https://nodejs.org then run this file again.
goto end
:oops
echo.
echo  ------------------------------------------------
echo   Something went wrong above.
echo   Copy the error text and paste it to Claude.
echo  ------------------------------------------------
:end
echo.
pause
