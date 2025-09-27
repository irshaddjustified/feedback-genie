# FeedbackGenie Setup Guide

This guide will walk you through setting up the FeedbackGenie application from scratch.

## Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (version 18.17 or later)
- **npm** (comes with Node.js)
- **SQLite** database (included, no setup required)
- **Git** for version control

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd feedback-genie

# Run the automated setup
npm run setup

# Follow the prompts and edit .env.local with your configuration
```

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Environment Configuration

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database Configuration (SQLite - automatically managed)
# No database configuration needed

# NextAuth Configuration (legacy)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# Firebase Authentication (primary admin auth)
ADMIN_EMAIL="admin@insighture.com"
ADMIN_DOMAINS="insighture.com,yourcompany.com"

# AI Service API Keys (Optional for development)
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
GOOGLE_GEMINI_KEY="your-gemini-key"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Step 3: Firebase Google Authentication Setup

1. Go to your [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one if you haven't)
3. Navigate to **Authentication** in the left sidebar
4. Click on **Sign-in method** tab
5. Enable **Google** as a sign-in provider:
   - Click on Google in the list
   - Toggle "Enable"
   - Your project's support email will be auto-configured
   - Click "Save"
6. (Optional) Configure authorized domains if deploying to production
7. Admin access is automatically determined by email domain matching the `ADMIN_DOMAINS` environment variable

#### Step 4: Firebase Firestore Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database in your Firebase project
3. Copy your Firebase configuration and add to `.env.local`

No additional database setup commands are needed - Firebase is ready to use!

#### Step 5: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Database Setup

### Firebase Firestore (Default)

The application uses Firebase Firestore as its database:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Copy your Firebase configuration from Project Settings
4. Update your `.env.local` with Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```

### Firebase Benefits

- **No setup required**: Firestore is serverless and fully managed
- **Real-time updates**: Built-in real-time synchronization
- **Scalable**: Automatically scales with your application
- **Authentication**: Integrated with Firebase Auth
- **Free tier**: Generous free usage limits

## AI Configuration (Optional)

The application includes AI features for sentiment analysis and survey generation. While optional for development, these enhance the user experience significantly.

### Getting API Keys

1. **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
3. **Google AI**: [ai.google.dev](https://ai.google.dev)

### Free Tiers Available

- OpenAI: $5 free credit for new accounts
- Anthropic: Limited free usage
- Google AI: Generous free tier

## Development Workflow

### Running the Application

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# View database in browser
npm run db:studio
```

### Making Database Changes

```bash
# After updating schema.prisma
npx prisma db push

# Generate new client types
npx prisma generate
```

### Project Structure

```
feedback-genie/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication
│   ├── feedback/          # Public feedback forms
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and configurations
├── prisma/               # Database schema
└── scripts/              # Setup and utility scripts
```

## Troubleshooting

### Common Issues

**1. Firebase Connection Error**
```
Error: Firebase configuration not found
```
- Ensure all Firebase environment variables are set in `.env.local`
- Check that your Firebase project has Firestore enabled
- Verify your Firebase project ID and API keys are correct

**2. Missing Dependencies Error**
```
Module not found: Can't resolve 'firebase/app'
```
- Run `npm install` to ensure all packages are installed
- Clear `node_modules` and run `npm install` again

**3. API Route Error**
```
Error: 500 Internal Server Error
```
- Check that Firebase is properly initialized in `lib/firebase.ts`
- Ensure your Firebase project has the correct security rules
- Check browser console and server logs for detailed error messages

**4. Build Errors**
```
Type error: Cannot find module
```
- Check that all imports are correct, especially after migration from tRPC
- Run `npm run type-check` to identify TypeScript issues
- Ensure Firebase types are properly installed

### Getting Help

1. **Check logs**: Console and terminal output
2. **Database issues**: Use Firebase Console to inspect Firestore data
3. **Type errors**: Run `npm run type-check`
4. **Environment**: Verify all Firebase variables are set in `.env.local`

### Reset Everything

If you need to start fresh:

```bash
# Remove generated files
rm -rf node_modules .next

# Reinstall dependencies  
npm install

# Clear Firebase local data (if using Firebase emulator)
firebase emulators:start --only firestore --reset-data
```

For production reset, clear your Firestore database through the Firebase Console.

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Ensure these are set in your production environment:

```env
DATABASE_URL="your-production-db-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="secure-random-string"
OPENAI_API_KEY="your-production-key"
ANTHROPIC_API_KEY="your-production-key"
GOOGLE_GEMINI_KEY="your-production-key"
```

### Database Migration

For production deployment:

```bash
# Generate and apply migrations
npx prisma migrate deploy
```

## Next Steps

1. **Access Admin Panel**: http://localhost:3000/auth/login
2. **Create Your First Project**: Add client projects
3. **Design Surveys**: Use the AI-enhanced builder
4. **Test Public Forms**: Share feedback links
5. **Explore Analytics**: View real-time insights

## Support

- **Documentation**: See README.md
- **Issues**: Create GitHub issues for bugs
- **Feature Requests**: Use GitHub discussions

---

**Happy building! 🚀**
