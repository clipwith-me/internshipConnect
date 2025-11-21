# 🆓 InternshipConnect - FREE Deployment Guide

**Total Cost**: **$0/month** (100% Free Tier)

This guide walks you through deploying InternshipConnect using only free services.

---

## 🎯 Free Services We'll Use

| Service           | Free Tier      | Limitations                                             |
| ----------------- | -------------- | ------------------------------------------------------- |
| **Render**        | Free           | Backend sleeps after 15 min inactivity, 750 hours/month |
| **Vercel**        | Free           | Unlimited bandwidth, automatic HTTPS                    |
| **MongoDB Atlas** | M0 Free        | 512MB storage, 100 connections                          |
| **Cloudinary**    | Free           | 25GB storage, 25GB bandwidth/month                      |
| **OpenAI**        | $5 free credit | New accounts get free credits                           |
| **Stripe**        | Free           | Pay only 2.9% + 30¢ per transaction                     |

**Total Monthly Cost**: **$0** 🎉

---

## ⚠️ Important: Free Tier Limitations

### Render Free Tier

- **Sleep After Inactivity**: Server goes to sleep after 15 minutes of no requests
- **Wake-up Time**: First request after sleep takes 30-60 seconds to respond
- **Hours Limit**: 750 hours/month (enough for testing and MVP)
- **Best For**: Development, testing, MVPs, portfolio projects

### How to Handle Sleep Issue

1. **Option A**: Accept the delay (fine for portfolio/testing)
2. **Option B**: Use a free uptime monitor to ping every 14 minutes (keeps server awake)
3. **Option C**: Upgrade to paid tier later ($7/month for always-on)

---

## 🔒 STEP 1: Rotate Credentials (CRITICAL)

Even for free deployment, you MUST rotate exposed credentials.

### 1.1 Generate New JWT Secrets

Open terminal and run:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output (128 characters). This is your new `JWT_SECRET`.

Run again for refresh secret:

```bash
# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy this output. This is your new `JWT_REFRESH_SECRET`.

**Save these values** - you'll need them in Step 3.

---

### 1.2 Create New MongoDB User

1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click on your cluster (likely named "Johnhub")
4. Go to **Database Access** (left sidebar)
5. Click **"+ ADD NEW DATABASE USER"**
6. Choose **"Password"** authentication
7. Set:
   - **Username**: `internship-prod-user`
   - **Password**: Click "Autogenerate Secure Password" (copy this!)
   - **Database User Privileges**: Select "Atlas admin"
8. Click **"Add User"**

**Save the password** - you'll need it for connection string.

Your new connection string:

```
mongodb+srv://internship-prod-user:YOUR_NEW_PASSWORD@johnhub.v83kzkf.mongodb.net/?appName=Johnhub
```

Replace `YOUR_NEW_PASSWORD` with the password you copied.

---

### 1.3 Rotate OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click **"+ Create new secret key"**
3. Name it: "InternshipConnect Production"
4. Click **"Create secret key"**
5. **Copy the key immediately** (you won't see it again!)
6. Click on your old key → **"Revoke"** → Confirm

**Save the new API key** - you'll need it in Step 3.

---

### 1.4 Regenerate Cloudinary API Secret

1. Go to: https://cloudinary.com/console
2. Click **"Settings"** (gear icon)
3. Go to **"Security"** tab
4. Find **"API Key"** section
5. Click **"Regenerate API Secret"**
6. Confirm regeneration
7. **Copy the new secret**

Your Cloudinary credentials:

- Cloud Name: `dxevtwkds` (stays the same)
- API Key: `936296564823629` (stays the same)
- API Secret: `[new secret you just copied]`

---

### 1.5 Create New Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Login with your Gmail account (`internshipconnects@gmail.com`)
3. Delete the old app password if it exists
4. Click **"Generate"** or **"Create"**
5. App name: "InternshipConnect Production"
6. Copy the 16-character password (no spaces)

**Save this password** - you'll need it in Step 3.

---

### 1.6 Stripe Setup (Use Test Mode - It's Free!)

For free deployment, we'll keep using **Stripe Test Mode**:

1. Go to: https://dashboard.stripe.com
2. Make sure you're in **"Test mode"** (toggle in top right)
3. Your existing test keys are fine to use

**Note**: When you're ready to accept real payments, you'll switch to Live mode.

---

## 🌐 STEP 2: Deploy Backend to Render (FREE)

### 2.1 Push Code to GitHub

First, make sure your latest code is on GitHub:

```bash
cd "C:\Users\HomePC\Desktop\claude-code\internship-connect"

# Check git status
git status

# Add all changes
git add .

# Commit
git commit -m "Prepare for free tier deployment"

# Push to GitHub
git push origin main
```

---

### 2.2 Create Render Account

1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest method)
4. Authorize Render to access your repositories

---

### 2.3 Create New Web Service

1. From Render Dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"** → **"Next"**
4. Find your repository: `internship-connect`
5. Click **"Connect"**

---

### 2.4 Configure Service Settings

Fill in these exact values:

**Name**: `internship-connect-backend`

**Region**: Choose closest to you:

- **Oregon (US West)** - Best for West Coast/Asia
- **Ohio (US East)** - Best for East Coast/Europe
- **Frankfurt (EU)** - Best for Europe/Africa
- **Singapore** - Best for Asia/Australia

**Branch**: `main`

**Root Directory**: `backend`

**Runtime**: `Node`

**Build Command**: `npm install`

**Start Command**: `npm start`

**Instance Type**: ⭐ **Free** (select this!)

---

### 2.5 Add Environment Variables

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** for each one below:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URL (we'll update this after Vercel deployment)
FRONTEND_URL=https://YOUR-APP.vercel.app

# Database (use NEW credentials from Step 1.2)
MONGODB_URI=mongodb+srv://internship-prod-user:YOUR_NEW_PASSWORD@johnhub.v83kzkf.mongodb.net/?appName=Johnhub
DB_NAME=internship_connect

# JWT Secrets (use NEW values from Step 1.1)
JWT_SECRET=paste_first_128_char_hex_here
JWT_REFRESH_SECRET=paste_second_128_char_hex_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Integration (use NEW key from Step 1.3)
OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
AI_PROVIDER=openai

# Cloudinary (use NEW secret from Step 1.4)
CLOUDINARY_CLOUD_NAME=dxevtwkds
CLOUDINARY_API_KEY=936296564823629
CLOUDINARY_API_SECRET=paste_new_secret_here

# Email (use NEW password from Step 1.5)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=internshipconnects@gmail.com
SMTP_PASS=paste_new_16_char_password_here

# Stripe (keep test keys for now - it's free!)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_STUDENT_PREMIUM_MONTHLY=price_1STSH2PtISWTDaPfu9b9nT2h
STRIPE_STUDENT_PREMIUM_YEARLY=price_1STSLJPtISWTDaPfDLLvCKiC
STRIPE_STUDENT_PRO_MONTHLY=price_1STSMjPtISWTDaPfQwihSTDF
STRIPE_STUDENT_PRO_YEARLY=price_1STU7QPtISWTDaPfNPUKWYm5
STRIPE_ORG_PROFESSIONAL_MONTHLY=price_1STUE3PtISWTDaPfwqf4cbcC
STRIPE_ORG_PROFESSIONAL_YEARLY=price_1STUG9PtISWTDaPfXpc547dp
STRIPE_ORG_ENTERPRISE_MONTHLY=price_1STUWxPtISWTDaPfTqMLRNCa
STRIPE_ORG_ENTERPRISE_YEARLY=price_1STUZqPtISWTDaPfTigyB4h3
```

**⚠️ Important**:

- Replace `YOUR_NEW_PASSWORD` with MongoDB password from Step 1.2
- Replace JWT secrets with values from Step 1.1
- Replace OpenAI key with value from Step 1.3
- Replace Cloudinary secret with value from Step 1.4
- Replace SMTP password with value from Step 1.5
- We'll update `FRONTEND_URL` after deploying frontend

---

### 2.6 Deploy!

1. Scroll down and click **"Create Web Service"**
2. Render will start building your app
3. Watch the logs - you'll see:
   ```
   Installing dependencies...
   Starting server...
   ```
4. Wait 2-3 minutes for deployment
5. Once done, you'll see: **"Your service is live 🎉"**

---

### 2.7 Get Your Backend URL

At the top of the page, you'll see your backend URL:

```
https://internship-connect-backend.onrender.com
```

**Copy this URL** - you'll need it for frontend deployment!

---

### 2.8 Test Backend

Click the URL or run in terminal:

```bash
curl https://internship-connect-backend.onrender.com/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2025-11-21T...",
  "uptime": 12.345
}
```

Also test API:

```bash
curl https://internship-connect-backend.onrender.com/api/auth/test
```

Expected:

```json
{
  "message": "Backend is working ✅"
}
```

✅ **Backend deployed successfully!**

---

## 🎨 STEP 3: Deploy Frontend to Vercel (FREE)

### 3.1 Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

---

### 3.2 Import Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find your repository: `internship-connect`
3. Click **"Import"**

---

### 3.3 Configure Build Settings

Vercel should auto-detect Vite, but verify these settings:

**Framework Preset**: `Vite`

**Root Directory**: `frontend` (click "Edit" and type this)

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

Leave everything else as default.

---

### 3.4 Add Environment Variable

Click **"Environment Variables"** dropdown.

Add this variable:

**Key**: `VITE_API_URL`

**Value**: `https://internship-connect-backend.onrender.com/api`

⚠️ **Replace with YOUR actual Render URL from Step 2.7** + `/api`

Make sure to select **"Production"** environment.

---

### 3.5 Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build with Vite
   - Deploy to global CDN
3. Wait 1-2 minutes
4. Once done, you'll see: **"Congratulations! 🎉"**

---

### 3.6 Get Your Frontend URL

You'll see your live URL:

```
https://internship-connect-xyz123.vercel.app
```

**Copy this URL** - you need to update backend!

Click the URL to visit your live app! 🎉

---

### 3.7 Update Backend CORS Configuration

Now we need to tell the backend to allow requests from your Vercel URL.

1. Go back to **Render Dashboard**: https://dashboard.render.com
2. Click on your service: `internship-connect-backend`
3. Go to **"Environment"** (left sidebar)
4. Find `FRONTEND_URL` variable
5. Click **"Edit"** (pencil icon)
6. Update value to your Vercel URL:
   ```
   https://internship-connect-xyz123.vercel.app
   ```
   ⚠️ **Replace with YOUR actual Vercel URL** (no trailing slash!)
7. Click **"Save Changes"**

The backend will automatically redeploy (takes 1-2 minutes).

---

## 🗄️ STEP 4: Configure MongoDB Atlas

### 4.1 Allow All IPs (For Free Tier)

Since Render Free tier doesn't have static IPs, we need to allow all IPs:

1. Go to: https://cloud.mongodb.com
2. Click on your cluster
3. Click **"Network Access"** (left sidebar)
4. Click **"+ ADD IP ADDRESS"**
5. Click **"ALLOW ACCESS FROM ANYWHERE"**
6. It will auto-fill: `0.0.0.0/0`
7. Comment: "Render Free Tier"
8. Click **"Confirm"**

**Security Note**: This allows all IPs. For better security later, upgrade Render to paid tier and whitelist specific IPs.

---

### 4.2 Verify Database Connection

Check Render logs to confirm MongoDB connected:

1. Go to Render Dashboard → Your service
2. Click **"Logs"** (left sidebar)
3. Look for: `✅ MongoDB Connected`

If you see this, database is working! ✅

---

## 🎉 STEP 5: Test Your Live App!

### 5.1 Open Your App

Visit your Vercel URL:

```
https://internship-connect-xyz123.vercel.app
```

You should see your InternshipConnect homepage!

---

### 5.2 Test Registration

1. Click **"Sign Up"** or **"Register"**
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Role: Student
   - First Name: Test
   - Last Name: User
3. Click **"Register"**
4. Should redirect to dashboard

✅ **Registration working!**

---

### 5.3 Test Login

1. Logout (if logged in)
2. Click **"Login"**
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#`
4. Click **"Login"**
5. Should redirect to dashboard

✅ **Login working!**

---

### 5.4 Check Browser Console

Press `F12` to open Developer Tools.

Go to **"Console"** tab.

Should see **NO red errors**.

If you see any errors, check:

- CORS errors? → Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- 401 errors? → Check JWT secrets are set correctly
- Network errors? → Check backend URL in Vercel environment variables

---

## 🎯 STEP 6: Set Up Free Wake-Up Service (Optional)

To prevent your Render backend from sleeping, use a free uptime monitor:

### Option A: UptimeRobot (Recommended)

1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Click **"+ Add New Monitor"**
4. Settings:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: InternshipConnect Backend
   - **URL**: `https://internship-connect-backend.onrender.com/health`
   - **Monitoring Interval**: 5 minutes (free tier)
5. Click **"Create Monitor"**

This will ping your backend every 5 minutes, keeping it awake!

**Note**: Free tier allows 50 monitors and 5-minute intervals.

---

### Option B: Cron-Job.org

1. Go to: https://cron-job.org
2. Sign up (free)
3. Create new cron job:
   - **Title**: Keep Backend Awake
   - **Address**: `https://internship-connect-backend.onrender.com/health`
   - **Schedule**: Every 10 minutes
4. Save

---

## 📊 Your Free Deployment Summary

### What You Have Now

✅ **Backend**: Deployed on Render (Free)

- URL: `https://internship-connect-backend.onrender.com`
- Sleeps after 15 min inactivity
- 750 hours/month limit

✅ **Frontend**: Deployed on Vercel (Free)

- URL: `https://internship-connect-xyz123.vercel.app`
- Unlimited bandwidth
- Global CDN
- Automatic HTTPS

✅ **Database**: MongoDB Atlas (Free M0)

- 512MB storage
- 100 connections
- Sufficient for MVP

✅ **File Storage**: Cloudinary (Free)

- 25GB storage
- 25GB bandwidth/month

✅ **Payments**: Stripe Test Mode (Free)

- Unlimited test transactions
- Switch to live mode when ready

---

### Limitations to Be Aware Of

**Backend (Render Free)**:

- ⏱️ Sleeps after 15 minutes of inactivity
- 🐌 First request after sleep: 30-60 seconds response time
- 📊 750 hours/month limit (~31 days if always awake)
- 💡 **Solution**: Use UptimeRobot to keep awake OR upgrade to $7/month

**Database (MongoDB M0)**:

- 💾 512MB storage limit
- 🔌 100 max connections
- 💡 **Upgrade when**: Storage > 400MB or users > 50

**Storage (Cloudinary Free)**:

- 📦 25GB storage
- 🌐 25GB bandwidth/month
- 💡 **Upgrade when**: Uploading many high-res images

---

## 🔧 Troubleshooting

### Backend is Sleeping

**Symptom**: First request takes 30-60 seconds

**Solutions**:

1. Wait patiently (it's waking up)
2. Set up UptimeRobot (Step 6)
3. Upgrade to Render Starter ($7/mo)

---

### CORS Errors

**Symptom**: Console shows "Access-Control-Allow-Origin" error

**Fix**:

1. Go to Render → Environment
2. Verify `FRONTEND_URL` exactly matches Vercel URL
3. No trailing slash: `https://your-app.vercel.app` ✅
4. Not: `https://your-app.vercel.app/` ❌
5. Save and wait for redeploy (1-2 min)

---

### MongoDB Connection Failed

**Symptom**: Backend logs show "MongoNetworkError"

**Fix**:

1. Go to MongoDB Atlas → Network Access
2. Verify `0.0.0.0/0` is added
3. Check connection string in Render environment variables
4. Verify database user exists (Database Access)

---

### Environment Variable Not Working

**Symptom**: Feature not working, logs show "undefined"

**Fix**:

1. Go to Render → Environment
2. Check variable name spelling (case-sensitive!)
3. Check no extra spaces in value
4. Save and wait for automatic redeploy

---

### Build Failed on Vercel

**Symptom**: Deployment failed with error message

**Common Fixes**:

1. Check `VITE_API_URL` is set correctly
2. Verify `npm run build` works locally
3. Check Vercel logs for specific error
4. Make sure `Root Directory` is set to `frontend`

---

## 💰 Cost Tracking

| Service    | Free Limit | Current Usage   | Status          |
| ---------- | ---------- | --------------- | --------------- |
| Render     | 750 hrs/mo | Check dashboard | 🟢 Free         |
| Vercel     | Unlimited  | Unlimited       | 🟢 Free         |
| MongoDB    | 512MB      | Check Atlas     | 🟢 Free         |
| Cloudinary | 25GB/mo    | Check console   | 🟢 Free         |
| OpenAI     | $5 credit  | Check usage     | 🟢 Free credits |

**Total**: **$0/month** 🎉

---

## 🚀 When to Upgrade?

### Render ($7/month)

Upgrade when:

- ⏱️ Wake-up delay is annoying users
- 📊 Hitting 750 hour limit
- 🚀 Need better performance

### MongoDB Atlas ($57/month for M10)

Upgrade when:

- 💾 Storage > 400MB
- 🔌 Connections > 80
- 👥 Users > 50 active

### Vercel ($20/month)

Upgrade when:

- 👥 Team collaboration needed
- 📊 Advanced analytics wanted
- 🎨 Password protection needed

---

## 📞 Support

- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **MongoDB**: https://docs.atlas.mongodb.com

---

## 🎯 Next Steps

Now that your app is live:

1. ✅ **Share with friends** - Get feedback!
2. 📱 **Test on mobile** - Works on phones too
3. 📊 **Monitor usage** - Watch for free tier limits
4. 🐛 **Fix bugs** - Users will find issues
5. 🚀 **Add features** - Keep improving

---

## 🎉 Congratulations!

Your InternshipConnect platform is now **LIVE** on the internet for **FREE**! 🎊

- ✅ Backend: Running on Render
- ✅ Frontend: Deployed on Vercel
- ✅ Database: MongoDB Atlas
- ✅ Total Cost: **$0/month**

**Your Live URLs**:

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Health Check: `https://your-backend.onrender.com/health`

Share your app with the world! 🌍

---

**Deployment Date**: November 21, 2025
**Total Time**: ~30-45 minutes
**Difficulty**: Beginner-friendly
**Cost**: FREE! 💰

Need help? Refer to:

- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [PRODUCTION_READY_REPORT.md](PRODUCTION_READY_REPORT.md) - Security audit
- [README.md](README.md) - Project documentation
