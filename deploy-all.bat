@echo off
echo =====================================================
echo        FULL DEPLOYMENT (Angular + API)
echo =====================================================

cd /d "%~dp0"

REM =====================================================
REM 0. CLEAN OLD PUBLISH FOLDER (Prevents multiple publish\publish\publish)
REM =====================================================
echo.
echo --- Cleaning old API publish folder ---
rd /s /q Erp.Server\publish 2>nul

REM =====================================================
REM 1. Build Angular
REM =====================================================
echo.
echo --- Building Angular (Production) ---
cd erp.client
call ng build --configuration production
cd ..

REM =====================================================
REM 2. Publish ASP.NET Core API
REM =====================================================
echo.
echo --- Publishing ASP.NET Core API ---
dotnet publish Erp.Server -c Release -o Erp.Server\publish

REM =====================================================
REM 3. Upload Angular Files
REM =====================================================
echo.
echo --- Uploading Angular Files ---
scp -r "erp.client\dist\erp.client\browser\*" root@72.61.226.117:/var/www/angular/

REM =====================================================
REM 4. Upload API Files (EXCEPT uploads folder)
REM =====================================================
echo.
echo --- Uploading API Files (Skipping wwwroot/uploads) ---

REM Upload everything except /uploads/*
REM Because scp cannot exclude patterns easily, we upload the whole folder first,
REM then restore the uploads folder.

scp -r Erp.Server\publish\* root@72.61.226.117:/var/www/captain/

echo --- Restoring uploads folder (not overwritten) ---
ssh root@72.61.226.117 "mkdir -p /var/www/captain/wwwroot/uploads"

REM =====================================================
REM 5. Upload NEW appsettings.json (Always overwrite)
REM =====================================================
echo.
echo --- Uploading NEW appsettings.json ---
scp Erp.Server\publish\appsettings.json root@72.61.226.117:/var/www/captain/appsettings.json

REM =====================================================
REM 6. Restart API + NGINX
REM =====================================================
echo.
echo --- Restarting captain-api service and nginx ---
ssh root@72.61.226.117 "sudo systemctl restart captain-api && sudo systemctl restart nginx"

echo.
echo =====================================================
echo DEPLOYMENT COMPLETE!
echo Uploads folder preserved.
echo =====================================================
pause
