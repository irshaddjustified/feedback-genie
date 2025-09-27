# FeedbackGenie Deployment Guide

This guide covers deploying FeedbackGenie to production environments.

## 🚀 Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub repository with your code
- Vercel account
- PostgreSQL database (Supabase/Railway/PlanetScale)
- AI API keys (optional but recommended)

### Step 1: Prepare Repository

```bash
# Ensure all files are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DIRECT_URL=postgresql://user:pass@host:5432/dbname

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key

# Admin Credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=secure-admin-password

# AI Services (Optional)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_GEMINI_KEY=your-gemini-key

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test your deployment

### Step 3: Database Setup

```bash
# Run database migrations
npx prisma db push

# (Optional) Seed with sample data
npm run db:seed
```

## 🏗️ Alternative Deployment Options

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t feedback-genie .
docker run -p 3000:3000 feedback-genie
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=out
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Required
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Recommended
OPENAI_API_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=

# Optional
ANTHROPIC_API_KEY=
GOOGLE_GEMINI_KEY=
SUPABASE_SERVICE_KEY=
ENABLE_AI_ANALYSIS=true
ENABLE_REALTIME=true
```

### Security Considerations

1. **Secrets Management**
   - Use environment variables for all secrets
   - Never commit API keys to repository
   - Rotate secrets regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **Rate Limiting**
   - Implement API rate limiting
   - Monitor usage patterns
   - Set up alerts

## 📊 Monitoring & Analytics

### Essential Monitoring

1. **Vercel Analytics** (Built-in)
   - Page views and performance
   - User interactions
   - Core Web Vitals

2. **Database Monitoring**
   - Connection counts
   - Query performance
   - Storage usage

3. **AI Usage Tracking**
   - API call counts
   - Response times
   - Error rates

### Error Tracking

Add Sentry for error monitoring:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your existing config
}, {
  silent: true,
  org: "your-org",
  project: "feedback-genie",
});
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

3. **Environment Variable Issues**
   - Verify all required vars are set
   - Check variable naming (case-sensitive)
   - Restart deployment after changes

4. **Performance Issues**
   - Enable caching
   - Optimize images
   - Use CDN for static assets

### Health Checks

Create health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version 
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    )
  }
}
```

## 📈 Scaling Considerations

### Performance Optimization

1. **Database Optimization**
   - Add proper indexes
   - Use read replicas
   - Implement connection pooling

2. **Caching Strategy**
   - Redis for session storage
   - CDN for static assets
   - Query result caching

3. **Load Balancing**
   - Multiple Vercel regions
   - Database load balancing
   - AI API load distribution

### Monitoring Thresholds

Set up alerts for:
- Response time > 5 seconds
- Error rate > 1%
- Database connections > 80%
- Memory usage > 85%

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Post-deployment Steps

1. **Verify Deployment**
   - Check health endpoints
   - Test critical user flows
   - Verify integrations work

2. **Monitor Initial Performance**
   - Watch error rates
   - Monitor response times
   - Check database performance

3. **Update Documentation**
   - Record deployment notes
   - Update API documentation
   - Share access credentials

## 🆘 Rollback Procedures

### Quick Rollback (Vercel)

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url] --scope=team
```

### Database Rollback

```bash
# Backup current state
pg_dump DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore previous backup if needed
psql DATABASE_URL < backup_previous.sql
```

## 📞 Support Contacts

- **Deployment Issues**: Check Vercel dashboard
- **Database Issues**: Monitor database provider status
- **AI Service Issues**: Check AI provider status pages
- **General Support**: Create GitHub issue

---

**Need help?** Check our [troubleshooting guide](./SETUP.md#troubleshooting) or create an issue.
