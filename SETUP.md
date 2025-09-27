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

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# Admin Credentials
ADMIN_EMAIL="admin@insighture.com"
ADMIN_PASSWORD="admin123"

# AI Service API Keys (Optional for development)
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
GOOGLE_GEMINI_KEY="your-gemini-key"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Step 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

#### Step 4: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Database Setup

### SQLite Database (Default)

The application uses SQLite by default, which requires no setup:

- Database file: `prisma/dev.db`
- Automatically created when you run `prisma db push`
- Perfect for development and small to medium applications
- No external database service required

### Alternative: PostgreSQL (Advanced)

If you need PostgreSQL for production:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` in `.env.local`
3. Use services like Railway, Supabase, or Neon

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

**1. Database Connection Error**
```
Error: Can't reach database server
```
- For SQLite: Ensure the prisma directory exists
- Run `npx prisma db push` to create the database
- Check file permissions in the project directory

**2. Missing Dependencies Error**
```
Module not found: Can't resolve '@trpc/next'
```
- Run `npm install` to ensure all packages are installed
- Clear `node_modules` and run `npm install` again

**3. Prisma Generation Error**
```
Environment variable not found: DATABASE_URL
```
- For SQLite: No environment variable needed
- Ensure `prisma/schema.prisma` has correct datasource configuration
- Run `npx prisma generate` to create the client

**4. Build Errors**
```
Type error: Cannot find module
```
- Run `npx prisma generate` to generate types
- Check that all imports are correct

### Getting Help

1. **Check logs**: Console and terminal output
2. **Database issues**: Use `npm run db:studio` to inspect data
3. **Type errors**: Run `npm run type-check`
4. **Environment**: Verify all required variables are set

### Reset Everything

If you need to start fresh:

```bash
# Remove generated files
rm -rf node_modules .next

# Reinstall dependencies  
npm install

# Reset database
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

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
