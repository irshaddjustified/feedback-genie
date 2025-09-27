@echo off
echo ========================================
echo FeedbackGenie Installation Script
echo ========================================
echo.

echo [1/5] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo [2/5] Setting up environment file...
if not exist .env.local (
    if exist env.example (
        copy env.example .env.local > nul
        echo ✓ Created .env.local from template
        echo ⚠️  Please edit .env.local with your configuration
    ) else (
        echo ⚠️  No env.example found. Please create .env.local manually
    )
) else (
    echo ✓ .env.local already exists
)
echo.

echo [3/5] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ⚠️  Prisma generation failed. Run manually after setting up DATABASE_URL
) else (
    echo ✓ Prisma client generated successfully
)
echo.

echo [4/5] Setting up database (optional)...
set /p setup_db="Do you want to push the database schema now? (y/N): "
if /i "%setup_db%"=="y" (
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo ⚠️  Database setup failed. Check your DATABASE_URL and try again
    ) else (
        echo ✓ Database schema pushed successfully
    )
) else (
    echo ⏭️  Skipped database setup
)
echo.

echo [5/5] Seeding database with sample data (optional)...
set /p seed_db="Do you want to add sample data for development? (y/N): "
if /i "%seed_db%"=="y" (
    call npm run db:seed
    if %errorlevel% neq 0 (
        echo ⚠️  Database seeding failed
    ) else (
        echo ✓ Sample data added successfully
    )
) else (
    echo ⏭️  Skipped database seeding
)
echo.

echo ========================================
echo 🎉 Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env.local with your database and API keys
echo   2. Run "npm run dev" to start the development server
echo   3. Visit http://localhost:3000 to see your app
echo.
echo Default admin credentials:
echo   Email: admin@insighture.com
echo   Password: admin123
echo.
echo For more information, see README.md and SETUP.md
echo.
pause
