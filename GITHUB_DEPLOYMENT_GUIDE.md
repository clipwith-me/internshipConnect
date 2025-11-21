# 🚀 GitHub Deployment Setup Guide

## Overview

This guide shows you how to deploy InternshipConnect using GitHub Actions with Vercel (frontend) and Render (backend).

---

## **Part 1: Setup GitHub Actions Secrets**

### Step 1: Go to GitHub Repository Settings

1. Navigate to: https://github.com/clipwith-me/internshipConnect
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions**

### Step 2: Add Render Backend Secrets

Add these secrets for backend deployment:

```
RENDER_API_KEY = your_render_api_key
RENDER_BACKEND_SERVICE_ID = your_render_service_id
```

**How to get these:**

1. Go to https://render.com
2. Create an account and API key (Settings → API Keys)
3. Create a new Web Service for your backend
4. Copy the Service ID from the URL: `https://dashboard.render.com/services/srv-{SERVICE_ID}`

### Step 3: Add Vercel Frontend Secrets

Add these secrets for frontend deployment:

```
VERCEL_TOKEN = your_vercel_token
VERCEL_ORG_ID = your_vercel_org_id
VERCEL_PROJECT_ID = your_vercel_project_id
```

**How to get these:**

1. Go to https://vercel.com
2. Create an account
3. Create a new project linked to this repository
4. Go to Settings → Tokens to create an API token
5. Find your Org ID and Project ID in project settings

### Step 4: Add Environment Variables for Deployment

Add these to GitHub Secrets (for production):

**Backend Secrets:**

```
BACKEND_MONGODB_URI
BACKEND_JWT_SECRET
BACKEND_JWT_REFRESH_SECRET
BACKEND_OPENAI_API_KEY
BACKEND_CLOUDINARY_CLOUD_NAME
BACKEND_CLOUDINARY_API_KEY
BACKEND_CLOUDINARY_API_SECRET
BACKEND_STRIPE_SECRET_KEY
BACKEND_STRIPE_STUDENT_PREMIUM_MONTHLY
BACKEND_STRIPE_STUDENT_PREMIUM_YEARLY
BACKEND_STRIPE_STUDENT_PRO_MONTHLY
BACKEND_STRIPE_STUDENT_PRO_YEARLY
BACKEND_STRIPE_ORG_PROFESSIONAL_MONTHLY
BACKEND_STRIPE_ORG_PROFESSIONAL_YEARLY
BACKEND_STRIPE_ORG_ENTERPRISE_MONTHLY
BACKEND_STRIPE_ORG_ENTERPRISE_YEARLY
```

**Frontend Secrets:**

```
FRONTEND_VITE_API_URL
```

---

## **Part 2: Deployment Platforms Setup**

### **Option A: Deploy Backend to Render** ⭐ Recommended

#### Step 1: Create Render Account

- Go to https://render.com
- Sign up with GitHub

#### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Configure:
   - **Name**: `internship-connect-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid for production)

#### Step 3: Set Environment Variables

1. Go to Service Settings → Environment
2. Add all variables from `backend/.env.example`
3. Redeploy the service

#### Step 4: Deploy

- Render will auto-deploy on every push to main branch

---

### **Option B: Deploy Backend to Railway** ✨ Alternative

#### Step 1: Create Railway Account

- Go to https://railway.app
- Sign up with GitHub

#### Step 2: Create Project

1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Click "Add variables"

#### Step 3: Configure Backend

```
# Add to railway.json in backend:
{
  "build": "npm install",
  "start": "npm start"
}
```

#### Step 4: Set Environment Variables

Add all variables from `backend/.env.example` in Railway dashboard

---

### **Option C: Deploy Frontend to Vercel** ⭐ Recommended

#### Step 1: Create Vercel Account

- Go to https://vercel.com
- Sign up with GitHub

#### Step 2: Import Project

1. Click "New Project"
2. Select your repository
3. Select "frontend" as root directory

#### Step 3: Configure Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Step 4: Set Environment Variables

1. Go to Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL = https://your-backend-url.render.com/api
   ```

#### Step 5: Deploy

- Vercel will auto-deploy on every push to main branch

---

### **Option D: Deploy Frontend to Netlify** ✨ Alternative

#### Step 1: Create Netlify Account

- Go to https://netlify.com
- Sign up with GitHub

#### Step 2: Connect Repository

1. Click "Add new site"
2. "Import an existing project"
3. Select GitHub and your repository

#### Step 3: Configure Build Settings

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### Step 4: Set Environment Variables

1. Go to Settings → Build & deploy → Environment
2. Add:
   ```
   VITE_API_URL = https://your-backend-url.render.com/api
   ```

---

## **Part 3: GitHub Actions Workflow**

The workflow (`.github/workflows/deploy.yml`) automatically:

1. ✅ **On every push to main/develop:**

   - Installs dependencies
   - Runs linting
   - Builds the project
   - Runs tests

2. ✅ **On push to main branch (production):**
   - Deploys backend to Render
   - Deploys frontend to Vercel

### **Workflow File Location:**

```
.github/workflows/deploy.yml
```

### **View Workflow Status:**

1. Go to GitHub repository
2. Click "Actions" tab
3. See all workflow runs

---

## **Part 4: Making Changes and Deploying**

### **Standard Development Flow:**

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit with meaningful message
git add .
git commit -m "feat: Add new feature description

- Detail 1
- Detail 2"

# 4. Push to GitHub
git push origin feature/my-feature

# 5. Create Pull Request on GitHub
# - GitHub Actions will run tests automatically
# - If tests pass, merge to main

# 6. Once merged to main, automatic deployment begins
# - GitHub Actions triggers
# - Backend deploys to Render
# - Frontend deploys to Vercel
```

---

## **Part 5: Commit Message Format** (Conventional Commits)

Follow this format for clear, meaningful commits:

```
type(scope): subject

body

footer
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (no functional change)
- `refactor:` - Refactor code
- `perf:` - Performance improvement
- `test:` - Add/update tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD configuration

**Examples:**

```bash
# Feature
git commit -m "feat(auth): Add password reset functionality

- Implement email verification
- Add reset token expiration
- Validate new password strength"

# Bug fix
git commit -m "fix(profile): Resolve 404 error on profile page

- Fix missing error handling in fetch
- Add fallback UI for loading state"

# Documentation
git commit -m "docs: Update API documentation"

# Chore
git commit -m "chore: Update dependencies to latest versions"
```

---

## **Part 6: Verify Deployment**

### **Check Backend Deployment (Render):**

1. Go to https://dashboard.render.com
2. Select your service
3. Check "Logs" for any errors
4. Test API: `curl https://your-backend-url.render.com/api/health`

### **Check Frontend Deployment (Vercel):**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Check "Deployments" tab
4. Click on latest deployment to view URL
5. Test: Open `https://your-frontend-url.vercel.app`

---

## **Part 7: Troubleshooting**

### **Deployment Failed**

1. Check GitHub Actions → Click failed workflow
2. Expand "Logs" section
3. Read error message
4. Fix the issue locally
5. Push changes (will retry automatically)

### **Environment Variables Not Working**

1. Verify all secrets are set in GitHub
2. Check spelling matches exactly
3. Redeploy services
4. Check logs for variable usage

### **Frontend Can't Connect to Backend**

1. Verify `VITE_API_URL` is set correctly
2. Check backend is deployed and running
3. Verify CORS is enabled on backend
4. Check network tab in browser DevTools

---

## **Part 8: Monitoring & Logs**

### **GitHub Actions Logs:**

1. Go to repository → Actions tab
2. Click on workflow run
3. Click job name to see detailed logs

### **Render Logs:**

1. Dashboard → Select service
2. Click "Logs" tab
3. Real-time logs of backend

### **Vercel Logs:**

1. Dashboard → Select project
2. Click "Deployments" tab
3. Click specific deployment → "Logs"

---

## **Quick Reference**

| Task              | Command                                                |
| ----------------- | ------------------------------------------------------ |
| Push code         | `git push origin main`                                 |
| Create branch     | `git checkout -b feature/name`                         |
| View logs         | GitHub Actions tab                                     |
| Redeploy manually | Click "Redeploy" in Render/Vercel dashboard            |
| View frontend     | `https://your-frontend-url.vercel.app`                 |
| Test backend API  | `curl https://your-backend-url.render.com/api/auth/me` |

---

## **Next Steps**

1. ✅ Create Render account and deploy backend
2. ✅ Create Vercel account and deploy frontend
3. ✅ Add GitHub Secrets for deployment
4. ✅ Test automatic deployment by pushing code
5. ✅ Monitor logs and verify everything works
6. ✅ Share deployment URLs with team

---

**Your App is Now Ready for Production Deployment! 🎉**
