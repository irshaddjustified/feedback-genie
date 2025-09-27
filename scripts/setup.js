#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up FeedbackGenie...\n');

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Check for environment file
console.log('🔧 Setting up environment...');
const envExample = path.join(__dirname, '..', 'env.example');
const envLocal = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envLocal)) {
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envLocal);
    console.log('✅ Created .env.local from template');
    console.log('⚠️  Please edit .env.local with your configuration\n');
  } else {
    console.log('⚠️  No .env.example found. Please create .env.local manually\n');
  }
} else {
  console.log('✅ .env.local already exists\n');
}

// Step 3: Generate Prisma client
console.log('🗄️  Setting up database...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');
} catch (error) {
  console.log('⚠️  Prisma generation failed. Run manually after setting up DATABASE_URL\n');
}

// Step 4: Instructions
console.log('🎉 Setup complete!\n');
console.log('📋 Next steps:');
console.log('   1. Edit .env.local with your database and API keys');
console.log('   2. Run "npx prisma db push" to set up your database');
console.log('   3. Run "npm run dev" to start the development server');
console.log('   4. Visit http://localhost:3000 to see your app\n');

console.log('🔑 Default admin credentials:');
console.log('   Email: admin@insighture.com');
console.log('   Password: admin123\n');

console.log('📚 For more information, see README.md');
