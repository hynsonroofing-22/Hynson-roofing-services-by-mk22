@echo off
title Hynson Roofing - which Netlify account?
cd /d "%~dp0"
echo.
echo  ================================================
echo    WHICH NETLIFY ACCOUNT AM I SIGNED IN AS?
echo  ================================================
echo.
call netlify status
echo.
echo  ------------------------------------------------
echo   Look at the EMAIL above.
echo.
echo   Is it the new project account you just made?
echo     YES - close this window and run PUT-ONLINE.bat
echo     NO  - press a key and we will sign you out
echo  ------------------------------------------------
echo.
pause
echo.
echo  Signing out...
call netlify logout
echo.
echo  Now signing back in. A browser will open.
echo  IMPORTANT: check the top-right of that page first.
echo  If it shows the wrong account, sign out of Netlify
echo  in the browser, sign in as the project account,
echo  THEN click Authorize.
echo.
pause
call netlify login
echo.
echo  Checking again:
call netlify status
echo.
echo  If the email is right, close this and run PUT-ONLINE.bat
echo.
pause
