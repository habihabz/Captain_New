@echo off
echo =====================================================
echo        FULL DEPLOYMENT (Angular + API)
echo =====================================================

cd /d "%~dp0"

set SERVER=root@72.61.226.117
set ANGULAR_PATH=/var/www/angular
set API_PATH=/var/www/captain/

echo.
echo --- Cleaning old API publish folder ---
rd /s /q Erp.Server\publish 2>nul

echo.
echo --- Building Angular ---
cd erp.client
call ng build --configuration production
IF %ERRORLEVEL% NEQ 0 exit /b
cd ..

echo.
echo --- Publishing API ---
dotnet publish Erp.Server -c Release -o Erp.Server\publish
IF %ERRORLEVEL% NEQ 0 exit /b

echo.
echo --- Upload Angular (safe swap) ---
ssh %SERVER% "rm -rf %ANGULAR_PATH%_new && mkdir -p %ANGULAR_PATH%_new"
scp -r "erp.client\dist\erp.client\browser\*" %SERVER%:%ANGULAR_PATH%_new
IF %ERRORLEVEL% NEQ 0 exit /b
ssh %SERVER% "rm -rf %ANGULAR_PATH%/* && mv %ANGULAR_PATH%_new/* %ANGULAR_PATH% 2>/dev/null"

echo.
echo --- Backup uploads ---
ssh %SERVER% "if [ -d %API_PATH%wwwroot/uploads ]; then cp -r %API_PATH%wwwroot/uploads %API_PATH%uploads_backup; fi"

echo.
echo --- Stop API ---
ssh %SERVER% "systemctl stop captain"

echo.
echo --- Upload API ---
scp -r Erp.Server\publish\* %SERVER%:%API_PATH%
IF %ERRORLEVEL% NEQ 0 exit /b

echo.
echo --- Restore uploads ---
ssh %SERVER% "rm -rf %API_PATH%wwwroot/uploads && mv %API_PATH%uploads_backup %API_PATH%wwwroot/uploads 2>/dev/null"

echo.
echo --- Start API ---
ssh %SERVER% "systemctl start captain && systemctl restart nginx"

echo.
echo ✔ DEPLOYMENT COMPLETE!
pause