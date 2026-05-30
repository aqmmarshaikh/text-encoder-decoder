@echo off
echo ============================================
echo  Onyx - Installing packages and starting...
echo ============================================
echo.
cd /d "%~dp0"
echo Installing QR packages (qrcode + jsqr)...
npm install qrcode jsqr --save
echo.
echo Starting dev server...
npm run dev
pause
