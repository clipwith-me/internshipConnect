# 🚀 InternshipConnect - Deployment Checklist

**Status**: ✅ Production-Ready | **Security Audit**: PASSED | **Date**: November 21, 2025

---

## 🔒 CRITICAL: Security Actions (Complete BEFORE Deployment)

### Step 1: Generate New JWT Secrets

```bash
# Generate JWT_SECRET (copy output)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (copy output)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Action**: Copy these values to your production `.env` file.

---

### Step 2: Rotate MongoDB Credentials

1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com
2. Navigate to: Database Access → Add New Database User
3. Create new user with strong password
4. Update connection string with new credentials
5. **Delete the old user** after confirming new one works

**New Connection String Format**:

````
mongodb+srv://NEW_USERNAME:NEW_PASSWORD@your_cluster.mongodb.net/?appName=YourApp
```---

### Step 3: Rotate API Keys

#### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. **Revoke old key** immediately
4. Update `OPENAI_API_KEY` in production environment

#### Cloudinary
1. Go to: https://cloudinary.com/console
2. Settings → Security → API Keys → Regenerate API Secret
3. Update all three values:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### Gmail SMTP (Email Service)
1. Go to: https://myaccount.google.com/apppasswords
2. Delete old app password
3. Create new app password: "InternshipConnect Production"
4. Update `SMTP_PASS` with new 16-character password

---

### Step 4: Switch Stripe to Live Mode

**IMPORTANT**: Your `.env` currently has TEST keys. For production:

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Toggle to "Live mode" (top right)
3. Get **Live** API keys:
- API Keys → Secret key (starts with `sk_live_`)
4. Update environment variables:
````

STRIPE*SECRET_KEY=sk_live*...

```

**Note**: Keep test keys for development environment.

---

## 🌐 Deployment Steps

### Backend Deployment (Render)

**Prerequisites**: GitHub repository pushed with latest changes

1. **Create Render Account**: https://dashboard.render.com
2. **New Web Service**:
- Click "New +" → "Web Service"
- Connect GitHub repository
- Select repository: `internship-connect`

3. **Configure Service**:
```

Name: internship-connect-backend
Region: Oregon (US West) or closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Starter ($7/month) or Free

````

4. **Set Environment Variables** (use your NEW rotated credentials):

**Essential Variables**:
```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app  # Update after Vercel deployment

# Database (NEW credentials from Step 2)
MONGODB_URI=mongodb+srv://NEW_USER:NEW_PASS@your_cluster.mongodb.net/?appName=YourApp
DB_NAME=internship_connect

# JWT (NEW secrets from Step 1)
JWT_SECRET=<paste_64_char_hex_from_step_1>
JWT_REFRESH_SECRET=<paste_different_64_char_hex_from_step_1>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI (NEW key from Step 3)
OPENAI_API_KEY=<new_openai_key>
AI_PROVIDER=openai

# Cloudinary (NEW credentials from Step 3)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=<new_cloudinary_secret>

# Email (NEW password from Step 3)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<new_16_char_app_password>

# Stripe (LIVE keys from Step 4)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get after setting up webhook
STRIPE_STUDENT_PREMIUM_MONTHLY=price_1STSH2PtISWTDaPfu9b9nT2h
STRIPE_STUDENT_PREMIUM_YEARLY=price_1STSLJPtISWTDaPfDLLvCKiC
STRIPE_STUDENT_PRO_MONTHLY=price_1STSMjPtISWTDaPfQwihSTDF
STRIPE_STUDENT_PRO_YEARLY=price_1STU7QPtISWTDaPfNPUKWYm5
STRIPE_ORG_PROFESSIONAL_MONTHLY=price_1STUE3PtISWTDaPfwqf4cbcC
STRIPE_ORG_PROFESSIONAL_YEARLY=price_1STUG9PtISWTDaPfXpc547dp
STRIPE_ORG_ENTERPRISE_MONTHLY=price_1STUWxPtISWTDaPfTqMLRNCa
STRIPE_ORG_ENTERPRISE_YEARLY=price_1STUZqPtISWTDaPfTigyB4h3
````

5. **Deploy**: Click "Create Web Service"
6. **Wait for deployment** (2-3 minutes)
7. **Copy Backend URL**: `https://internship-connect-backend.onrender.com`

8. **Verify Backend**:

   ```bash
   # Test health endpoint
   curl https://internship-connect-backend.onrender.com/health

   # Test API
   curl https://internship-connect-backend.onrender.com/api/auth/test
   ```

   Expected: `{ "status": "OK", ... }` and `{ "message": "Backend is working ✅" }`

---

### Frontend Deployment (Vercel)

1. **Create Vercel Account**: https://vercel.com/signup
2. **Import Project**:

   - Go to: https://vercel.com/new
   - Import Git Repository → Select `internship-connect`

3. **Configure Project**:

   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variable**:

   ```
   VITE_API_URL=https://internship-connect-backend.onrender.com/api
   ```

   ⚠️ Replace with YOUR actual Render backend URL from previous step

5. **Deploy**: Click "Deploy"
6. **Wait for deployment** (1-2 minutes)
7. **Copy Frontend URL**: `https://internship-connect-xyz.vercel.app`

8. **Update Backend CORS**:
   - Go back to Render dashboard
   - Navigate to: Service → Environment
   - Update `FRONTEND_URL`:
     ```
     FRONTEND_URL=https://internship-connect-xyz.vercel.app
     ```
   - Click "Manual Deploy" → "Deploy latest commit"

---

### MongoDB Atlas Configuration

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Network Access** (left sidebar):
   - Click "Add IP Address"
   - Add: `0.0.0.0/0` (allows all IPs)
   - Or add Render's static IPs (recommended, see Render docs)
3. **Save**

**Why**: Render's backend needs access to your MongoDB cluster.

---

### Stripe Webhook Setup

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Switch to Live Mode** (top right toggle)
3. **Developers → Webhooks** (left sidebar)
4. **Add Endpoint**:

   ```
   Endpoint URL: https://internship-connect-backend.onrender.com/api/payments/webhook
   ```

5. **Select Events**:

   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

6. **Get Webhook Secret**:

   - After creating, click on the webhook
   - Copy "Signing secret" (starts with `whsec_`)

7. **Update Render Environment**:
   - Go to Render → Environment
   - Update: `STRIPE_WEBHOOK_SECRET=whsec_...`
   - Manual Deploy

---

## ✅ Post-Deployment Verification

### Test Checklist

Run these tests after deployment:

- [ ] **Backend Health**: Visit `https://your-backend.onrender.com/health`

  - Should return: `{ "status": "OK", ... }`

- [ ] **Frontend Loads**: Visit `https://your-app.vercel.app`

  - Should load without console errors (F12 → Console)

- [ ] **User Registration**:

  - Create test student account
  - Verify email sent (check inbox)
  - Confirm account created in MongoDB Atlas

- [ ] **User Login**:

  - Login with test credentials
  - Should redirect to dashboard
  - Check localStorage has `accessToken`

- [ ] **Protected Routes**:

  - Try accessing `/dashboard` without login
  - Should redirect to `/auth/login`

- [ ] **Token Refresh**:

  - Wait 15 minutes (token expiry)
  - Make API request
  - Should auto-refresh without logout

- [ ] **File Upload**:

  - Upload profile picture
  - Verify stored in Cloudinary

- [ ] **Payment Test** (Use Stripe test card):
  - Card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - Verify subscription created

---

## 📊 Monitoring Setup

### Set Up UptimeRobot (Free)

1. Go to: https://uptimerobot.com
2. Add Monitors:
   - **Backend**: `https://your-backend.onrender.com/health` (every 5 min)
   - **Frontend**: `https://your-app.vercel.app` (every 5 min)
3. Configure alerts: Email on downtime

---

## 🔐 Final Security Verification

- [ ] All credentials rotated (MongoDB, JWT, OpenAI, Cloudinary, SMTP, Stripe)
- [ ] `.env` file NOT committed to Git (check with `git status`)
- [ ] `FRONTEND_URL` matches actual Vercel deployment
- [ ] `VITE_API_URL` matches actual Render deployment
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Stripe webhooks pointing to production URL
- [ ] Using Stripe LIVE keys (not test keys)
- [ ] No console errors on frontend
- [ ] No error logs on backend
- [ ] HTTPS enabled (automatic on Vercel/Render)

---

## 📝 Important Notes

### Render Free Tier Limitations

- Server sleeps after 15 minutes of inactivity
- Takes 30-60 seconds to wake up on first request
- Recommended: Upgrade to Starter ($7/mo) for always-on

### Vercel Free Tier

- Unlimited bandwidth
- Automatic HTTPS
- Global CDN
- Perfect for frontend

### MongoDB Atlas Free Tier (M0)

- 512MB storage
- 100 max connections
- Sufficient for MVP
- Upgrade to M10 when you have 50+ active users

---

## 🚨 If Something Goes Wrong

### Backend Not Starting

1. Check Render logs: Service → Logs
2. Common issues:
   - MongoDB connection failed → Check IP whitelist
   - Missing environment variable → Check all required vars set
   - Port binding error → Use `PORT=5000` (Render provides this)

### Frontend Not Loading

1. Check Vercel logs: Deployment → Function Logs
2. Common issues:
   - Build failed → Check `npm run build` works locally
   - API calls failing → Check `VITE_API_URL` correct
   - CORS errors → Check `FRONTEND_URL` matches in backend

### CORS Errors

1. Verify `FRONTEND_URL` in backend environment exactly matches Vercel URL
2. No trailing slashes
3. Include `https://`
4. Re-deploy backend after changing

### Payments Not Working

1. Check Stripe webhook secret matches
2. Verify webhook URL is correct
3. Check Stripe dashboard → Webhooks → Events
4. Review backend logs for webhook errors

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Stripe Docs**: https://stripe.com/docs

- **Platform Issues**: Open GitHub issue
- **Security Concerns**: security@internshipconnect.com

---

## 🎉 You're Ready to Deploy!

### Quick Reference URLs

**Documentation**:

- Full Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Production Ready Report: [PRODUCTION_READY_REPORT.md](PRODUCTION_READY_REPORT.md)
- Security Audit: [SECURITY.md](SECURITY.md)

**Estimated Time**: 30-45 minutes (if credentials ready)

**Cost**: $7/month minimum (Render Starter + free tiers)

---

**Last Updated**: November 21, 2025
**Platform Version**: 1.0.0-rc
**Security Audit**: ✅ PASSED

🚀 **Ready for production deployment!**
