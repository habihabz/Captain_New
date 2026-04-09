@echo off
setlocal
echo ======================================================
echo          EDUAPP DEVELOPMENT ENVIRONMENT
echo ======================================================

set API_PATH=c:\Users\HabeebRahman\source\repos\EduAppAPI
set APP_PATH=c:\Users\HabeebRahman\source\repos\EduApp
set PATH=%PATH%;C:\flutter\bin

echo.
echo Cleaning up existing processes...

:: Kill API port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5048') do (
    taskkill /F /PID %%a /T 2>nul
)

:: Optional cleanup (safer)
taskkill /F /IM EduAppAPI.exe /T 2>nul
taskkill /F /IM dart.exe /T 2>nul

echo.
echo Launching API Backend (Port 5048)...
start "EduApp API" cmd /k "cd /d %API_PATH% && dotnet watch run --urls http://localhost:5048"

echo.
echo Building Flutter Windows EXE...

cd /d %APP_PATH%

flutter clean
flutter pub get
flutter build windows --dart-define=API_BASE_URL=http://localhost:5048/api

echo.
echo Launching Flutter EXE...

start "" "%APP_PATH%\build\windows\x64\runner\Release\EduApp.exe"

echo.
echo ======================================================
echo SUCCESS: API + Windows App Started
echo ======================================================

pause
exit