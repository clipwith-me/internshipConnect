# 🚀 DEPLOY NOW - Quick Start Guide

## Step 1: Commit Your Code (2 minutes)

```bash
git add .
git commit -m "Production v1.0 - All phases complete"
git push origin main
```

## Step 2: Deploy Frontend to Vercel (5 minutes)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Set Environment Variable in Vercel Dashboard:**
- `VITE_API_URL` = (Your Render backend URL - get from Step 3)

## Step 3: Deploy Backend to Render (10 minutes)

1. Go to https://dashboard.render.com
2. New → Web Service
3. Connect GitHub repo: `internship-connect`
4. Settings:
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`

5. Add Environment Variables (copy from your local `.env`)

## Step 4: Test Production (5 minutes)

Visit your Vercel URL and test:
- ✅ Login/Register
- ✅ Profile page (mobile view)
- ✅ Upload profile picture (crop modal)
- ✅ Generate resume (download PDF)
- ✅ Forgot password (check email)

## Step 5: Update Frontend with Backend URL

1. Copy your Render backend URL
2. Vercel Dashboard → Environment Variables
3. Update `VITE_API_URL`
4. Redeploy

## Done! 🎉

Your app is live at your Vercel URL!

**For detailed instructions, see TESTING_AND_DEPLOYMENT.md**
