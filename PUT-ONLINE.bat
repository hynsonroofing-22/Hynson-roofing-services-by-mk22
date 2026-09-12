@echo off
title Hynson Roofing - put the site online
cd /d "%~dp0"
echo.
echo  ================================================
echo    PUT THE SITE ONLINE (Netlify)
echo  ================================================
echo.
echo  Do these in order. Read each screen before pressing a key.
echo.
pause
echo.
echo  ---- STEP 1 of 4: sign in ----
echo  A browser window will open. Click Authorize.
echo  If it says you are already logged in, that is fine.
echo.
call netlify login
echo.
echo  ---- STEP 2 of 4: create the site and upload a test copy ----
echo  You will be asked some questions. Answer like this:
echo.
echo    "What would you like to do?"  ^<-- THE TRICKY ONE
echo       It opens on "Link this directory to an existing
echo       project". That is the WRONG one.
echo       Use the ARROW KEYS to move to
echo          "+  Create ^& configure a new project"
echo       and THEN press Enter.
echo.
echo    "Team"          -^> your own name
echo    "Project name"  -^> hynson-roofing-preview
echo.
echo  This builds the site first, so it takes a few minutes.
echo.
pause
call netlify deploy --build
echo.
echo  ---- STEP 3 of 4: send the LINZ key up ----
echo  This copies the key out of your .env file so the
echo  address lookup works on the live site.
echo.
pause
call netlify env:import .env
echo.
echo  ---- STEP 4 of 4: publish it for real ----
echo  The address above was a private test copy.
echo  This one is the proper live address you can share.
echo.
pause
call netlify deploy --build --prod
echo.
echo  ================================================
echo   DONE. The "Website URL" above is your live site.
echo   Write it down. Test the address lookup on it.
echo  ================================================
echo.
pause
