@echo off
REM NestCare Quick Start Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         NestCare - Daycare Management Platform             ║
echo ║              Phase 7 & Payment Test Setup                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Get the workspace directory
set WORKSPACE_DIR=%~dp0

echo [1/4] Installing Backend Dependencies...
cd /d "%WORKSPACE_DIR%backend"
pip install -q cloudinary stripe python-stripe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Backend dependencies installed
) else (
    echo ✗ Failed to install backend dependencies
)

echo.
echo [2/4] Installing Frontend Dependencies...
cd /d "%WORKSPACE_DIR%frontend"
call npm install -q 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Frontend dependencies installed
) else (
    echo ✗ Failed to install frontend dependencies
)

echo.
echo [3/4] Creating .env files...

REM Create backend .env
cd /d "%WORKSPACE_DIR%backend"
if not exist .env (
    (
        echo DATABASE_URL=postgresql://postgres:khansa1086@localhost:5432/nestcare
        echo SECRET_KEY=your-secret-key-change-in-production
        echo CLOUDINARY_CLOUD_NAME=
        echo CLOUDINARY_API_KEY=
        echo CLOUDINARY_API_SECRET=
        echo STRIPE_SECRET_KEY=sk_test_
        echo STRIPE_WEBHOOK_SECRET=whsec_
        echo FRONTEND_URL=http://localhost:5173
        echo API_URL=http://localhost:8000
    ) > .env
    echo ✓ Backend .env created
) else (
    echo ✓ Backend .env already exists
)

REM Create frontend .env.local
cd /d "%WORKSPACE_DIR%frontend"
if not exist .env.local (
    (
        echo VITE_STRIPE_PUBLISHABLE_KEY=pk_test_
    ) > .env.local
    echo ✓ Frontend .env.local created
) else (
    echo ✓ Frontend .env.local already exists
)

echo.
echo [4/4] Setup Complete!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                   NEXT STEPS:                              ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  1. Add Stripe Keys to .env files:                        ║
echo ║     - Backend: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET║
echo ║     - Frontend: VITE_STRIPE_PUBLISHABLE_KEY               ║
echo ║                                                            ║
echo ║  2. Run in separate terminals:                            ║
echo ║     Terminal 1: cd backend && python -m uvicorn app.main:app --reload
echo ║     Terminal 2: cd frontend && npm run dev                ║
echo ║                                                            ║
echo ║  3. Test the system:                                      ║
echo ║     - Login: http://localhost:5173/login                  ║
echo ║     - Staff: http://localhost:5173/staff                  ║
echo ║     - Payment: http://localhost:5173/invoices             ║
echo ║                                                            ║
echo ║  4. Run integration tests:                                ║
echo ║     python test_integration.py                            ║
echo ║                                                            ║
echo ║  Test Credentials:                                        ║
echo ║  - Admin: admin@nestcare.com / password123                ║
echo ║  - Staff: staff@nestcare.com / password123                ║
echo ║  - Parent: parent@nestcare.com / password123              ║
echo ║                                                            ║
echo ║  Test Card (Stripe):                                      ║
echo ║  - Number: 4242 4242 4242 4242                            ║
echo ║  - Expiry: Any future date (e.g., 12/25)                  ║
echo ║  - CVC: Any 3 digits (e.g., 123)                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
