# 🚀 Vercel Frontend Deployment Guide

**Complete step-by-step guide to deploy InternshipConnect frontend to Vercel**

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before deploying, verify:
- ✅ Frontend builds successfully (`npm run build` completed)
- ✅ `vercel.json` configuration file exists
- ✅ GitHub repository is up to date
- ✅ Backend is deployed to Render (or you have the backend URL)

---

## 📋 DEPLOYMENT OPTIONS

You have **3 ways** to deploy to Vercel:

### Option 1: Vercel Dashboard (Recommended - Easiest)
### Option 2: Vercel CLI (For developers)
### Option 3: GitHub Integration (Automatic)

---

## 🎯 OPTION 1: Deploy via Vercel Dashboard (RECOMMENDED)

### Step 1: Sign Up / Login to Vercel

1. Go to: https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project

1. On Vercel Dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"internshipConnect"** repository
4. Click **"Import"**

### Step 3: Configure Project Settings

Vercel will auto-detect the Vite configuration. Verify these settings:

**Framework Preset:** `Vite`
**Root Directory:** `frontend` ⚠️ **IMPORTANT - Must specify!**
**Build Command:** `npm run build`
**Output Directory:** `dist`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
Key: VITE_API_URL
Value: https://internshipconnect-af9x.onrender.com/api
```

**For all environments:** Check Production, Preview, and Development

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. You'll see: 🎉 **"Congratulations! Your project has been deployed"**

### Step 6: Get Your Deployment URL

Your app will be live at:
```
https://your-project-name.vercel.app
```

Copy this URL - you'll need it for CORS configuration on the backend!

---

## 🖥️ OPTION 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy Frontend

```bash
cd c:\Users\HomePC\Desktop\claude-code\internship-connect\frontend
vercel
```

**Answer the prompts:**
- **Set up and deploy?** `Y`
- **Which scope?** Select your account
- **Link to existing project?** `N`
- **Project name?** `internship-connect` (or your choice)
- **Directory?** `./` (current directory)
- **Override settings?** `N`

### Step 4: Deploy to Production

After initial deployment:

```bash
vercel --prod
```

### Step 5: Add Environment Variable

```bash
vercel env add VITE_API_URL production
```

Enter: `https://internshipconnect-af9x.onrender.com/api`

Then redeploy:
```bash
vercel --prod
```

---

## 🔄 OPTION 3: Automatic GitHub Integration

### Step 1: Connect Repository

1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Configure as shown in Option 1

### Step 2: Enable Auto-Deploy

Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for PRs
- Update production on merge

**No manual deployment needed!**

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### 1. Update Backend CORS

Your backend needs to allow requests from Vercel URL.

**On Render Dashboard:**
1. Go to: internship-connect-backend → Environment
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Save → Render will redeploy

### 2. Test Your Deployment

Visit your Vercel URL and test:
- ✅ Logo displays
- ✅ Pages load
- ✅ Registration works
- ✅ Login works
- ✅ API calls succeed (check Network tab)

### 3. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` on Render to match

---

## 🐛 TROUBLESHOOTING

### Build Failed

**Error:** `Command "npm run build" exited with 1`

**Fix:**
1. Check Vercel build logs for specific error
2. Ensure `Root Directory` is set to `frontend`
3. Verify `package.json` and `package-lock.json` are committed
4. Check for missing dependencies

**Test locally:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Calls Failing (CORS Error)

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Fix:**
1. Verify `VITE_API_URL` environment variable is set on Vercel
2. Update backend `FRONTEND_URL` to match Vercel deployment URL
3. Redeploy backend on Render
4. Clear browser cache and try again

**Check in browser console:**
```javascript
console.log(import.meta.env.VITE_API_URL)
// Should show: https://internshipconnect-af9x.onrender.com/api
```

### Environment Variable Not Working

**Error:** `undefined` when accessing `import.meta.env.VITE_API_URL`

**Fix:**
1. Ensure variable starts with `VITE_` prefix
2. Redeploy after adding environment variable
3. Check Vercel Dashboard → Settings → Environment Variables
4. Make sure it's enabled for Production

### Logo Not Showing

**Check:**
1. Files exist in `frontend/public/` directory
2. Paths use `/logo.png` format (leading slash)
3. Files are committed to git
4. Build includes files in `dist/` output

### Page Refresh Returns 404

This shouldn't happen with our `vercel.json` rewrites configuration.

**If it does:**
1. Verify `vercel.json` is in `frontend/` directory
2. Check `rewrites` configuration is present
3. Redeploy after fixing

---

## 📊 VERCEL FEATURES YOU GET

### Automatic
- ✅ Global CDN distribution
- ✅ Automatic HTTPS (SSL)
- ✅ Instant cache invalidation
- ✅ Asset optimization
- ✅ Git integration
- ✅ Preview deployments for PRs

### Analytics (Available)
- Page views
- Load times
- User geography
- Performance metrics

### Monitoring
- Build status notifications
- Deployment history
- Function logs
- Error tracking

---

## 🔐 SECURITY BEST PRACTICES

### Environment Variables
- ✅ Never commit API keys to git
- ✅ Use Vercel's environment variable system
- ✅ Different values for prod/preview/dev
- ✅ Rotate sensitive values regularly

### API Security
- ✅ Backend validates all requests
- ✅ CORS configured properly
- ✅ HTTPS enforced
- ✅ Rate limiting on backend

---

## 📈 DEPLOYMENT WORKFLOW

### For New Changes

1. **Develop locally:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test build:**
   ```bash
   npm run build
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin main
   ```

4. **Vercel auto-deploys:**
   - Receive email notification
   - Check deployment status on dashboard
   - Test live site

### For Hotfixes

1. Fix the issue locally
2. Test thoroughly
3. Push to GitHub
4. Vercel deploys instantly
5. Verify fix on live site

---

## 📝 VERCEL DEPLOYMENT CHECKLIST

Use this to verify everything is working:

### Pre-Deployment
- [ ] `npm run build` succeeds locally
- [ ] No console errors in development
- [ ] All API endpoints work
- [ ] Images and assets load
- [ ] Routes work correctly

### During Deployment
- [ ] Vercel build completes successfully
- [ ] No build errors in logs
- [ ] Deployment marked as "Ready"
- [ ] Production URL accessible

### Post-Deployment
- [ ] Homepage loads
- [ ] Logo displays
- [ ] Navigation works
- [ ] API calls succeed (check Network tab)
- [ ] Registration works
- [ ] Login works
- [ ] Protected routes redirect correctly
- [ ] Settings page functions work
- [ ] Image upload works (if Cloudinary configured)

### Configuration
- [ ] `VITE_API_URL` environment variable set
- [ ] Backend `FRONTEND_URL` updated to Vercel URL
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic)

---

## 🎯 QUICK DEPLOY COMMANDS

### First Time Deploy (CLI)
```bash
cd frontend
npm install -g vercel
vercel login
vercel
vercel env add VITE_API_URL production
# Enter: https://internshipconnect-af9x.onrender.com/api
vercel --prod
```

### Redeploy (CLI)
```bash
cd frontend
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

---

## 📞 NEED HELP?

### Check These First:
1. **Vercel Dashboard** → Project → Deployments → View Logs
2. **Browser Console** (F12) → Check for JavaScript errors
3. **Network Tab** → Verify API calls
4. **Vercel Status** → https://www.vercel-status.com

### Common Commands:
```bash
# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# View environment variables
vercel env ls
```

---

## ✅ SUCCESS CRITERIA

Your deployment is successful when:

1. ✅ Vercel shows "Ready" status
2. ✅ Site loads at production URL
3. ✅ No 404 errors on page refresh
4. ✅ API calls work (no CORS errors)
5. ✅ Images and assets display
6. ✅ User can register and login
7. ✅ Navigation between pages works
8. ✅ Build time < 2 minutes

---

## 🎉 AFTER SUCCESSFUL DEPLOYMENT

### Update Your Team
Share the live URL:
```
Frontend: https://your-app.vercel.app
Backend API: https://internshipconnect-af9x.onrender.com
```

### Monitor Performance
- Check Vercel Analytics
- Review build times
- Monitor error rates
- Track user engagement

### Next Steps
1. Set up custom domain (optional)
2. Configure preview environments
3. Enable Vercel Analytics
4. Set up deployment notifications

---

**🚀 Ready to Deploy!**

Choose your method:
- **Easiest:** Vercel Dashboard (Option 1)
- **Fastest:** Vercel CLI (Option 2)
- **Best for teams:** GitHub Integration (Option 3)

**Need the actual values?** Your backend/.env file has all the credentials you need!
