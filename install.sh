#!/bin/bash

echo "========================================"
echo "FeedbackGenie Installation Script"
echo "========================================"
echo ""

echo "[1/5] Installing Node.js dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

echo "[2/5] Setting up environment file..."
if [ ! -f .env.local ]; then
    if [ -f env.example ]; then
        cp env.example .env.local
        echo "✅ Created .env.local from template"
        echo "⚠️  Please edit .env.local with your configuration"
    else
        echo "⚠️  No env.example found. Please create .env.local manually"
    fi
else
    echo "✅ .env.local already exists"
fi
echo ""

echo "[3/5] Generating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "⚠️  Prisma generation failed. Run manually after setting up DATABASE_URL"
fi
echo ""

echo "[4/5] Setting up database (optional)..."
read -p "Do you want to push the database schema now? (y/N): " setup_db
if [[ $setup_db =~ ^[Yy]$ ]]; then
    if npx prisma db push; then
        echo "✅ Database schema pushed successfully"
    else
        echo "⚠️  Database setup failed. Check your DATABASE_URL and try again"
    fi
else
    echo "⏭️  Skipped database setup"
fi
echo ""

echo "[5/5] Seeding database with sample data (optional)..."
read -p "Do you want to add sample data for development? (y/N): " seed_db
if [[ $seed_db =~ ^[Yy]$ ]]; then
    if npm run db:seed; then
        echo "✅ Sample data added successfully"
    else
        echo "⚠️  Database seeding failed"
    fi
else
    echo "⏭️  Skipped database seeding"
fi
echo ""

echo "========================================"
echo "🎉 Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your database and API keys"
echo "  2. Run 'npm run dev' to start the development server"  
echo "  3. Visit http://localhost:3000 to see your app"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@insighture.com"
echo "  Password: admin123"
echo ""
echo "For more information, see README.md and SETUP.md"
echo ""
