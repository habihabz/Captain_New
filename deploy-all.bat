@echo off
echo =====================================================
echo        FULL DEPLOYMENT (Angular + API)
echo =====================================================

cd /d "%~dp0"

set SERVER=root@72.61.226.117
set ANGULAR_PATH=/var/www/angular/
set API_PATH=/var/www/captain/

REM =====================================================
REM 0. CLEAN OLD PUBLISH
REM =====================================================
echo.
echo --- Cleaning old API publish folder ---
rd /s /q Erp.Server\publish 2>nul

REM =====================================================
REM 1. BUILD ANGULAR
REM =====================================================
echo.
echo --- Building Angular (Production) ---
cd erp.client
call ng build --configuration production
IF %ERRORLEVEL% NEQ 0 (
    echo Angular build failed!
    pause
    exit /b
)
cd ..

REM =====================================================
REM 2. PUBLISH API
REM =====================================================
echo.
echo --- Publishing ASP.NET Core API ---
dotnet publish Erp.Server -c Release -o Erp.Server\publish
IF %ERRORLEVEL% NEQ 0 (
    echo API publish failed!
    pause
    exit /b
)

REM =====================================================
REM 3. UPLOAD ANGULAR
REM =====================================================
echo.
echo --- Uploading Angular Files ---
scp -r "erp.client\dist\erp.client\browser\*" %SERVER%:%ANGULAR_PATH%

REM =====================================================
REM 4. PRESERVE UPLOADS
REM =====================================================
echo.
echo --- Backing up uploads folder ---
ssh %SERVER% "cp -r %API_PATH%wwwroot/uploads %API_PATH%uploads_backup 2>/dev/null"

echo --- Uploading API Files ---
scp -r Erp.Server\publish\* %SERVER%:%API_PATH%

echo --- Restoring uploads folder ---
ssh %SERVER% "rm -rf %API_PATH%wwwroot/uploads && mv %API_PATH%uploads_backup %API_PATH%wwwroot/uploads 2>/dev/null"

REM =====================================================
REM 5. APPSETTINGS
REM =====================================================
echo.
echo --- Uploading appsettings.json ---
scp Erp.Server\publish\appsettings.json %SERVER%:%API_PATH%appsettings.json

REM =====================================================
REM 6. RESTART SERVICES
REM =====================================================
echo.
echo --- Restarting captain API + nginx ---
ssh %SERVER% "systemctl restart captain && systemctl restart nginx"

REM =====================================================
echo.
echo ✔ DEPLOYMENT COMPLETE!
echo ✔ Angular + API updated
echo ✔ Uploads preserved
echo =====================================================
pause