@echo off
title Hynson Roofing - website WITH address lookup
cd /d "%~dp0"
echo.
echo  ================================================
echo    HYNSON ROOFING - full site (address lookup ON)
echo  ================================================
echo.
echo  IMPORTANT: close any other Hynson window first.
echo  Two servers cannot share the same port.
echo.
REM Stop CRA opening its own browser window - Netlify opens the right one.
set BROWSER=none
set PORT=3000
set CI=false
echo  Checking port 3000 is free...
netstat -ano ^| findstr :3000 ^| findstr LISTENING >nul 2>nul
if not errorlevel 1 goto portbusy
where node >nul 2>nul
if errorlevel 1 goto nonode
if not exist node_modules call npm install --no-audit --no-fund
where netlify >nul 2>nul
if errorlevel 1 goto installcli
goto run
:installcli
echo  Installing the Netlify tool (one time, a few minutes)...
echo.
call npm install -g netlify-cli --no-audit --no-fund
if errorlevel 1 goto oops
:run
echo.
echo  Starting. This takes about a minute the first time.
echo  When it is ready, open:  http://localhost:8888
echo.
echo  KEEP THIS WINDOW OPEN while you look at the site.
echo  Press Ctrl+C in here when you are finished.
echo.
call netlify dev
goto end
:portbusy
echo.
echo  ------------------------------------------------
echo   Port 3000 is already being used.
echo   Close your other Hynson Roofing window, then
echo   run this file again.
echo  ------------------------------------------------
goto end
:nonode
echo  Node.js was not found. Install it from https://nodejs.org
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
