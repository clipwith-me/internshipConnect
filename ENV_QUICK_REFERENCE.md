# 🔧 Environment Variables - Quick Reference Card

## RENDER (Backend) - MINIMUM REQUIRED

Copy-paste these into Render Dashboard → Environment:

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://adminInternshipConnect:3YV0uRjh2c7FiryV@johnhub.v83kzkf.mongodb.net/?appName=Johnhub
DB_NAME=internship_connect
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

**That's it!** App will run with these 8 variables.

---

## VERCEL (Frontend) - REQUIRED

Dashboard → Settings → Environment Variables:

```bash
VITE_API_URL=https://internshipconnect-af9x.onrender.com/api
```

**That's it!** Only 1 variable needed.

---

## OPTIONAL SERVICES (Add as Needed)

### Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
```

### Stripe Payments
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cloudinary Uploads
```bash
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### AI (OpenAI)
```bash
OPENAI_API_KEY=sk-...
```

---

## 🚨 CRITICAL: Update These Values

Before deploying, CHANGE these values:

1. **FRONTEND_URL** - Your actual Vercel URL
2. **JWT_SECRET** - Generate with: `openssl rand -base64 32`
3. **JWT_REFRESH_SECRET** - Generate with: `openssl rand -base64 32`

---

## ✅ VERIFY DEPLOYMENT

**Test Backend:**
```bash
curl https://internshipconnect-af9x.onrender.com/health
```

**Test Frontend:**
Visit your Vercel URL - logo should appear

---

**Last Updated:** 2025-11-26
