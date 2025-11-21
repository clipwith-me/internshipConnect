# InternshipConnect Deployment Guide

This guide covers deploying InternshipConnect to production using Vercel (frontend) and Render (backend).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Stripe Webhook Setup](#stripe-webhook-setup)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account (for repository hosting)
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] MongoDB Atlas account (database)
- [ ] Stripe account (payments)
- [ ] Cloudinary account (file uploads)
- [ ] OpenAI or Anthropic account (AI features)

### Required API Keys
Gather these before starting deployment:
1. **MongoDB Atlas** - Connection string
2. **Stripe** - Secret key, webhook secret, and price IDs
3. **Cloudinary** - Cloud name, API key, and secret
4. **OpenAI/Anthropic** - API key
5. **JWT Secrets** - Two random 32+ character strings

---

## Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
cd internship-connect
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `internship-connect/backend` directory
5. Configure the service:

   **Basic Settings:**
   - **Name:** `internship-connect-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

   **Instance Type:**
   - **Plan:** Starter ($7/month) or Free (with limitations)

### Step 3: Configure Environment Variables

In Render dashboard → Environment section, add these variables:

#### Essential Variables (Required)
```
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=internship_connect

# JWT (Generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=different-refresh-token-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

#### AI Integration (Choose one)
```
# Option 1: OpenAI
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai

# Option 2: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=claude

# Option 3: Mock (for testing)
AI_PROVIDER=mock
```

#### File Upload (Optional)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Payment Gateway (Optional)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Student Plans
STRIPE_STUDENT_PREMIUM_MONTHLY=price_...
STRIPE_STUDENT_PREMIUM_YEARLY=price_...
STRIPE_STUDENT_PRO_MONTHLY=price_...
STRIPE_STUDENT_PRO_YEARLY=price_...

# Organization Plans
STRIPE_ORG_PROFESSIONAL_MONTHLY=price_...
STRIPE_ORG_PROFESSIONAL_YEARLY=price_...
STRIPE_ORG_ENTERPRISE_MONTHLY=price_...
STRIPE_ORG_ENTERPRISE_YEARLY=price_...
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start the server
3. Monitor the build logs for any errors
4. Once deployed, note your backend URL: `https://your-app.onrender.com`

### Step 5: Verify Backend Deployment

Test these endpoints:
```bash
# Health check
curl https://your-app.onrender.com/health

# API test
curl https://your-app.onrender.com/api/auth/test
```

Expected response: `{ "status": "OK", ... }` and `{ "message": "Backend is working ✅" }`

---

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:

   **Framework Preset:** Vite
   **Root Directory:** `frontend`
   **Build Command:** `npm run build`
   **Output Directory:** `dist`
   **Install Command:** `npm install`

### Step 3: Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-app.onrender.com/api
```

**Important:** Update this with your actual Render backend URL from Step 1.

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Vercel will:
   - Clone repository
   - Install dependencies
   - Build with Vite
   - Deploy to CDN
3. Your app will be live at: `https://your-project.vercel.app`

### Step 5: Update Backend FRONTEND_URL

Go back to Render dashboard and update the environment variable:
```
FRONTEND_URL=https://your-project.vercel.app
```

**Important:** Re-deploy backend after this change for CORS to work correctly.

---

## Environment Variables Summary

### Critical for Production
| Variable | Location | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `MONGODB_URI` | Backend | Database connection | MongoDB Atlas Dashboard |
| `JWT_SECRET` | Backend | Token signing | Generate with: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Backend | Refresh token signing | Generate with: `openssl rand -base64 32` |
| `FRONTEND_URL` | Backend | CORS configuration | Vercel deployment URL |
| `VITE_API_URL` | Frontend | API endpoint | Render deployment URL + `/api` |

### Optional but Recommended
| Variable | Location | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `OPENAI_API_KEY` | Backend | AI resume generation | https://platform.openai.com/api-keys |
| `STRIPE_SECRET_KEY` | Backend | Payment processing | https://dashboard.stripe.com/apikeys |
| `CLOUDINARY_*` | Backend | File uploads | https://cloudinary.com/console |

---

## Post-Deployment Configuration

### 1. Configure MongoDB Atlas IP Whitelist

Your Render backend IP needs access to MongoDB:

1. Go to MongoDB Atlas → Network Access
2. Click **"Add IP Address"**
3. Add Render's IP ranges or use `0.0.0.0/0` (allows all IPs)
   - **Recommended:** Get Render's static IP addresses from their docs

### 2. Set Up Custom Domains (Optional)

#### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown

#### Render (Backend)
1. Go to Service → Settings → Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records

### 3. Configure CORS for Custom Domains

Update `FRONTEND_URL` in Render with your custom frontend domain:
```
FRONTEND_URL=https://www.yourdomain.com
```

---

## Stripe Webhook Setup

For payment processing to work, configure Stripe webhooks:

### Step 1: Create Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. Enter webhook URL: `https://your-app.onrender.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Step 2: Get Webhook Secret

1. After creating, click on the webhook
2. Copy the **"Signing secret"** (starts with `whsec_`)
3. Add to Render environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 3: Test Webhook

1. Use Stripe CLI: `stripe listen --forward-to https://your-app.onrender.com/api/payments/webhook`
2. Or create a test payment in Stripe Dashboard → Test mode

### Step 4: Create Stripe Products and Prices

1. Go to Stripe Dashboard → Products
2. Create products for each plan:
   - **Student Premium** ($9.99/month, $99/year)
   - **Student Pro** ($19.99/month, $199/year)
   - **Organization Professional** ($49/month, $490/year)
   - **Organization Enterprise** ($199/month, $1990/year)

3. Copy price IDs (start with `price_`) to environment variables

---

## Monitoring and Maintenance

### Health Checks

Set up monitoring for these endpoints:
- Backend: `https://your-app.onrender.com/health`
- Frontend: `https://your-app.vercel.app`

Recommended tools:
- **UptimeRobot** (free)
- **Better Uptime**
- **Render's built-in monitoring**

### Log Monitoring

**Render Logs:**
1. Go to service → Logs
2. Monitor for errors, especially:
   - MongoDB connection issues
   - JWT token errors
   - Payment webhook failures

**Vercel Logs:**
1. Go to project → Deployments → Logs
2. Check for:
   - Build errors
   - Runtime errors
   - API connection failures

### Performance Monitoring

**Backend (Render):**
- Monitor response times
- Check database connection pool
- Watch memory usage

**Frontend (Vercel):**
- Use Vercel Analytics
- Check Core Web Vitals
- Monitor bundle size

### Database Maintenance

**MongoDB Atlas:**
1. Set up automated backups
2. Monitor storage usage
3. Review slow queries
4. Set up alerts for:
   - Connection spikes
   - Storage limits
   - CPU usage

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom:** "Access-Control-Allow-Origin" errors in browser console

**Solution:**
- Verify `FRONTEND_URL` in backend matches your Vercel deployment URL exactly
- Check for trailing slashes
- Restart backend service after environment variable changes

#### 2. MongoDB Connection Failed
**Symptom:** "MongoNetworkError" or "connection timeout"

**Solution:**
- Verify MongoDB Atlas IP whitelist includes Render's IP or `0.0.0.0/0`
- Check `MONGODB_URI` is correct
- Ensure MongoDB cluster is not paused

#### 3. JWT Token Expired Loop
**Symptom:** Continuous 401 errors, automatic logouts

**Solution:**
- Clear browser localStorage
- Verify `JWT_SECRET` hasn't changed
- Check token expiry times are reasonable (15m/7d)

#### 4. Stripe Webhook Not Receiving Events
**Symptom:** Payments succeed but subscription not updating

**Solution:**
- Verify webhook URL is correct: `/api/payments/webhook`
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Test webhook with Stripe CLI
- Review Render logs for webhook errors

#### 5. File Upload Failing
**Symptom:** Resume uploads timeout or fail

**Solution:**
- Verify Cloudinary credentials are correct
- Check file size limits (5MB for resumes, 2MB for images)
- Ensure Cloudinary account has storage space
- Falls back to mock URLs if Cloudinary not configured

---

## Security Checklist

Before going live, verify:

- [ ] All API keys are in environment variables, not in code
- [ ] MongoDB connection uses authentication
- [ ] JWT secrets are strong random strings (32+ characters)
- [ ] HTTPS is enabled (Vercel and Render provide this automatically)
- [ ] MongoDB Atlas IP whitelist is configured
- [ ] Stripe uses live keys (not test keys) for production
- [ ] Rate limiting is enabled for API endpoints
- [ ] CORS is restricted to your frontend domain only
- [ ] Sensitive data is not logged
- [ ] Error messages don't expose system details

---

## Scaling Considerations

### When to Upgrade

**Backend (Render):**
- Free tier: Good for testing, sleeps after inactivity
- Starter ($7/mo): 512MB RAM, no sleep
- Standard ($25/mo): 2GB RAM, better performance
- **Upgrade when:** Response times > 1 second, frequent timeouts

**Database (MongoDB Atlas):**
- M0 Free: 512MB storage, 100 connections
- M10 ($0.08/hr): 2GB storage, 1500 connections
- **Upgrade when:** Storage > 400MB, connections > 80

### Performance Optimization

1. **Enable caching:**
   - Redis for session storage
   - CDN for static assets (Vercel provides this)

2. **Database indexes:**
   - Already configured in models
   - Monitor slow queries in MongoDB Atlas

3. **API optimization:**
   - Enable compression (already configured)
   - Implement rate limiting
   - Use pagination for large result sets

4. **Frontend optimization:**
   - Code splitting (Vite handles this)
   - Image optimization (use Cloudinary transformations)
   - Lazy loading for routes and components

---

## Backup and Recovery

### Database Backups (MongoDB Atlas)

1. Go to Clusters → Backup
2. Enable continuous backups (paid plans)
3. Free tier: Manual backups via `mongodump`

### Code Backups

- Code is backed up in GitHub
- Tag releases: `git tag v1.0.0 && git push --tags`
- Keep `.env.example` files updated

### Disaster Recovery Plan

1. **Database restore:** Use MongoDB Atlas backups
2. **Code rollback:** Deploy previous Git commit
3. **Environment variables:** Keep encrypted backup of production `.env`

---

## Cost Estimation

### Minimum Monthly Costs
| Service | Plan | Cost |
|---------|------|------|
| Render (Backend) | Starter | $7/mo |
| Vercel (Frontend) | Free | $0 |
| MongoDB Atlas | M0 Shared | $0 |
| Cloudinary | Free tier | $0 |
| **Total** | | **$7/mo** |

### Recommended Production Setup
| Service | Plan | Cost |
|---------|------|------|
| Render (Backend) | Standard | $25/mo |
| Vercel (Frontend) | Pro | $20/mo |
| MongoDB Atlas | M10 Shared | ~$57/mo |
| Cloudinary | Plus | $89/mo |
| Stripe | Pay-as-you-go | 2.9% + 30¢ per transaction |
| **Total** | | **~$191/mo** + transaction fees |

---

## Support and Resources

### Documentation
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Stripe: https://stripe.com/docs

### Community
- GitHub Issues: [Your repo]/issues
- Discord: [Your server] (if applicable)

### Professional Support
- Render support: support@render.com
- Vercel support: Via dashboard
- MongoDB support: Via Atlas dashboard
- Stripe support: https://support.stripe.com

---

## Next Steps After Deployment

1. **Set up monitoring** (UptimeRobot, Better Uptime)
2. **Configure alerts** (Email/Slack for downtime)
3. **Run load tests** (Verify system handles expected traffic)
4. **Create admin account** (Use Postman to create first admin user)
5. **Test payment flow** (Complete end-to-end test purchase)
6. **Set up analytics** (Google Analytics, Mixpanel, etc.)
7. **Create user documentation** (Help guides, FAQs)
8. **Plan content strategy** (Blog posts, social media)

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check uptime status
- Review payment transactions

### Weekly
- Review MongoDB performance metrics
- Check API response times
- Update dependencies (security patches)

### Monthly
- Analyze user growth metrics
- Review infrastructure costs
- Plan feature updates
- Security audit

---

**Congratulations! Your app is now live! 🚀**

For questions or issues, please refer to the [main README](./README.md) or open an issue on GitHub.
