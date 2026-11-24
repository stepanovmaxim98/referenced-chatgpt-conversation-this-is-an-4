@echo off
setlocal
cd /d "%~dp0"

curl.exe --max-time 2 --silent "http://127.0.0.1:5173/" | findstr /c:"/src/main.tsx" >nul
if not errorlevel 1 (
  start "" "http://127.0.0.1:5173/"
  exit /b 0
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 goto failed
)

start "AI Education dev server" /D "%~dp0" cmd /k "npm.cmd run dev -- --port 5173 --strictPort"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5173/"
endlocal
exit /b 0

:failed
echo.
echo Could not install dependencies. Check that Node.js is installed and try again.
pause
endlocal
exit /b 1
