@echo off
echo ============================================
echo  Onyx App - Quick Start
echo ============================================
echo.
cd /d "C:\Users\sunas\OneDrive\Desktop\pirots hub"
echo Installing QR packages if needed...
npm install qrcode jsqr --save --silent
echo.
echo Starting Onyx app at http://localhost:3000 ...
npm run dev
pause
