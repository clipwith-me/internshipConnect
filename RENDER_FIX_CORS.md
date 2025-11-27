# 🔧 Fix Render CORS Issue

## The Problem

Your Render backend is blocking requests from Vercel because:

1. **NODE_ENV is set to `development`** (should be `production`)
2. When NODE_ENV is `development`, CORS only allows:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - Plus `FRONTEND_URL`

3. But your Vercel URL is HTTPS, not HTTP, so it's being blocked

## The Solution

Update **TWO** environment variables on Render:

### Step 1: Go to Render Dashboard

1. Visit: https://dashboard.render.com
2. Click on your backend service: **internshipconnect-af9x**
3. Click **"Environment"** tab

### Step 2: Update NODE_ENV

**Find:** `NODE_ENV`
**Current value:** `development`
**Change to:** `production`

### Step 3: Verify FRONTEND_URL

**Find:** `FRONTEND_URL`
**Should be:** `https://internship-connect-pp8s31k1f-clipwith-mes-projects.vercel.app`

If it's not set or incorrect, update it to the Vercel URL above.

### Step 4: Save Changes

Click **"Save Changes"** button

Render will automatically redeploy your backend (takes ~2 minutes)

---

## Why This Works

The backend CORS logic (server.js lines 90-100):

```javascript
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL].filter(Boolean)  // ← Production mode: ONLY allow FRONTEND_URL
  : [                                           // ← Development mode: Allow localhost + FRONTEND_URL
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
```

When `NODE_ENV=production`:
- ✅ ONLY allows the exact URL in `FRONTEND_URL`
- ✅ Blocks all other origins (more secure)

When `NODE_ENV=development`:
- ✅ Allows localhost (for local dev)
- ❌ But your Vercel URL doesn't match localhost patterns

---

## After Updating

1. **Wait ~2 minutes** for Render to finish redeploying
2. **Refresh your Vercel site:** https://internship-connect-pp8s31k1f-clipwith-mes-projects.vercel.app
3. **Try logging in** - CORS error should be gone
4. **Check Network tab** (F12) - API calls should succeed

---

## Expected Behavior After Fix

### In Render Logs, you should see:
```
📋 Environment: production  ← Changed from 'development'
📋 Frontend URL: https://internship-connect-pp8s31k1f-clipwith-mes-projects.vercel.app
```

### In Browser, you should see:
- ✅ No CORS errors
- ✅ API calls return 200 status
- ✅ Login/register works
- ✅ Dashboard loads

---

## Quick Verification

After Render redeploys, test these:

### 1. Health Check
Visit: https://internshipconnect-af9x.onrender.com/health

Should return:
```json
{
  "status": "OK",
  "services": { ... }
}
```

### 2. CORS Test
Open Vercel site: https://internship-connect-pp8s31k1f-clipwith-mes-projects.vercel.app

Try to login. Check browser console (F12):
- ✅ No CORS errors
- ✅ Network tab shows API calls with status 200

---

## If Still Not Working

If CORS errors persist after updating NODE_ENV:

1. **Check Render logs** to verify:
   - `Environment: production` (not development)
   - `Frontend URL:` shows correct Vercel URL

2. **Hard refresh browser:** `Ctrl + Shift + R`

3. **Check exact Vercel URL** - make sure it matches exactly (no trailing slash, correct domain)

4. **Wait a bit longer** - Render redeploy can take up to 3 minutes

---

## Summary

**What to change on Render:**
1. `NODE_ENV` → `production`
2. `FRONTEND_URL` → `https://internship-connect-pp8s31k1f-clipwith-mes-projects.vercel.app`

**Save → Wait 2 minutes → Test**
