# 🚀 Monitoring Quick Start - 30 Minutes Setup

## FREE Monitoring Stack (Recommended to Start)

### ✅ Step 1: Vercel Analytics (2 min) - Already Active!

```
Just visit: https://vercel.com/dashboard
→ Your Project → Analytics

You'll see:
- Page views
- Unique visitors  
- Core Web Vitals
- Top pages
```

### ✅ Step 2: Render Metrics (2 min) - Already Active!

```
Visit: https://dashboard.render.com
→ Your Service → Metrics

You'll see:
- CPU usage
- Memory usage
- Request count
- Response time
```

### ✅ Step 3: MongoDB Atlas (2 min) - Already Active!

```
Visit: https://cloud.mongodb.com
→ Your Cluster → Metrics

You'll see:
- Query performance
- Slow queries
- Connection pool
- Disk usage
```

**Total so far: FREE, 0 setup time (already monitoring!)**

---

## 🔴 Step 4: Error Tracking - Sentry (10 min)

### Sign Up
```
1. Go to: https://sentry.io/signup
2. Create organization
3. Create project: "internship-connect"
4. Copy DSN: https://xxxxx@sentry.io/xxxxx
```

### Install Frontend
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

Add to `frontend/.env`:
```
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

Add to `frontend/src/main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Then your existing code
```

### Install Backend
```bash
cd backend
npm install @sentry/node
```

Add to Render Environment:
```
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

Add to `backend/src/server.js` (at top):
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Before routes
app.use(Sentry.Handlers.requestHandler());

// After routes, before error handler
app.use(Sentry.Handlers.errorHandler());
```

**Redeploy both frontend and backend**

---

## 📊 Step 5: Google Analytics (5 min)

### Create GA4 Property
```
1. Go to: https://analytics.google.com
2. Create Account → InternshipConnect
3. Create Property → InternshipConnect
4. Copy Measurement ID: G-XXXXXXXXXX
```

### Add to Frontend
In `frontend/index.html`, add before closing `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Redeploy frontend**

---

## 🆙 Step 6: Uptime Monitoring (5 min)

```
1. Go to: https://uptimerobot.com/signUp
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: https://your-backend.onrender.com/health
   - Name: InternshipConnect API
   - Interval: 5 minutes
3. Add email alert contact
4. Done!
```

---

## 🎥 Step 7: Microsoft Clarity (5 min) - Session Replay

```
1. Go to: https://clarity.microsoft.com
2. Sign in with Microsoft account
3. New Project → InternshipConnect
4. Add website: https://your-app.vercel.app
5. Copy tracking code
```

Add to `frontend/index.html`:
```html
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

**Redeploy frontend**

---

## ✅ You're Now Monitoring:

### Performance ✅
- [x] Page load time (Vercel)
- [x] API response time (Render)
- [x] Database query time (MongoDB Atlas)
- [x] CPU, Memory, Disk (Render)

### Reliability ✅
- [x] Error rates (Sentry)
- [x] Failed requests (Sentry)
- [x] Exceptions (Sentry)
- [x] Uptime (UptimeRobot)

### Usage Analytics ✅
- [x] User sessions (Google Analytics)
- [x] Page views (Google Analytics + Vercel)
- [x] Heatmaps (Microsoft Clarity)
- [x] Session recordings (Microsoft Clarity)

---

## 🎯 Total Setup

**Time:** 30 minutes
**Cost:** $0/month (all free tiers)
**Monthly Limits:**
- Sentry: 5,000 errors
- Google Analytics: Unlimited
- UptimeRobot: 50 monitors
- Clarity: Unlimited sessions

---

## 📈 View Your Dashboards

After deployment, bookmark these:

1. **Performance:**
   - Vercel: https://vercel.com/dashboard → Analytics
   - Render: https://dashboard.render.com → Metrics

2. **Errors:**
   - Sentry: https://sentry.io → Projects

3. **Users:**
   - Google Analytics: https://analytics.google.com
   - Clarity: https://clarity.microsoft.com

4. **Uptime:**
   - UptimeRobot: https://uptimerobot.com/dashboard

---

## 🚨 Alert Configuration

### Sentry Alerts
```
Go to: Sentry → Alerts → New Alert Rule

Critical Alert:
- Condition: Error count > 10 in 1 hour
- Action: Email + Slack (if configured)
```

### UptimeRobot Alerts
```
Automatically emails you when:
- Site is down for > 2 minutes
- Response time > 10 seconds
```

---

## 📊 Daily Monitoring Routine (5 min)

**Morning Check:**
```
1. Open Sentry → Check new errors (0 is good!)
2. Open Render Metrics → Check CPU/Memory (< 70% is good)
3. Open UptimeRobot → Check uptime (100% is good)
```

**Weekly Check:**
```
1. Google Analytics → User growth trends
2. Clarity → Watch 3-5 user sessions
3. Sentry → Review all errors this week
```

---

## 🎉 Done!

You now have comprehensive FREE monitoring covering:
- ✅ Performance
- ✅ Reliability
- ✅ Usage
- ✅ Infrastructure

**Next:** See MONITORING_GUIDE.md for advanced setups

**Cost to upgrade later:**
- New Relic APM: $25/month (deeper backend tracing)
- Mixpanel: $25/month (advanced funnels)
- LogRocket: $99/month (advanced session replay)
