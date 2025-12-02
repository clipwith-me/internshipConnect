# 📊 Production Monitoring Guide - InternshipConnect

**Complete monitoring setup for performance, reliability, and usage analytics**

---

## 🎯 Monitoring Overview

### What We'll Monitor:

1. **Performance** - Load times, API response, database queries
2. **Reliability** - Error rates, failed requests, exceptions
3. **Usage Analytics** - User sessions, clicks, page views, funnels
4. **Infrastructure** - CPU, memory, disk usage

---

## 🚀 Quick Start - Free Tier Setup (30 minutes)

### Option 1: All-in-One Solution (Recommended for Beginners)

**Vercel Analytics + Render Metrics + LogRocket Free Tier**

Total Cost: **$0/month** (free tiers)
Setup Time: **15 minutes**

---

## 📈 TIER 1: Performance Monitoring

### 1A. Frontend Performance - Vercel Analytics (FREE)

**What it monitors:**
- ✅ Page load time
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Unique visitors
- ✅ Page views
- ✅ Top pages

**Setup (2 minutes):**

```bash
# Already enabled if deployed to Vercel!
# Just go to: https://vercel.com/dashboard
# → Your Project → Analytics
```

**Features:**
- Real User Monitoring (RUM)
- Geographic distribution
- Device breakdowns
- Browser analytics

**Cost:** FREE (included with Vercel)

---

### 1B. Backend Performance - Render Metrics (FREE)

**What it monitors:**
- ✅ CPU usage
- ✅ Memory usage
- ✅ Request count
- ✅ Response time

**Setup (0 minutes):**

```bash
# Already enabled in Render!
# Go to: https://dashboard.render.com
# → Your Service → Metrics
```

**What you'll see:**
- CPU % over time
- Memory MB usage
- Requests per minute
- Average response time

**Cost:** FREE (included with Render)

---

### 1C. Advanced Performance - New Relic (FREE TIER)

**What it monitors:**
- ✅ API response time (detailed)
- ✅ Database query time
- ✅ Slow transactions
- ✅ Error tracking
- ✅ Dependency mapping

**Setup (10 minutes):**

#### Step 1: Sign up for New Relic
```bash
# Go to: https://newrelic.com/signup
# Free: 100 GB/month data ingest
```

#### Step 2: Install in Backend

```bash
cd backend
npm install newrelic --save
```

#### Step 3: Configure New Relic

Create `backend/newrelic.js`:

```javascript
'use strict'

exports.config = {
  app_name: ['InternshipConnect'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  distributed_tracing: {
    enabled: true
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
```

#### Step 4: Update server.js

```javascript
// backend/src/server.js
// Add at the VERY TOP, before any other imports
import './newrelic.js'; // Must be first!

import dotenv from 'dotenv';
dotenv.config();
// ... rest of your code
```

#### Step 5: Add to Render Environment Variables

```bash
NEW_RELIC_LICENSE_KEY=your_license_key_here
```

#### Step 6: Redeploy

```bash
git add .
git commit -m "Add New Relic monitoring"
git push
```

**What you get:**
- Transaction traces (which endpoints are slow)
- Database query analysis
- External API call timing
- Error rate by endpoint
- Apdex score (user satisfaction)

**Cost:** FREE up to 100GB/month

---

### 1D. Database Monitoring - MongoDB Atlas (FREE)

**What it monitors:**
- ✅ Query performance
- ✅ Slow queries
- ✅ Index usage
- ✅ Connection pool
- ✅ Disk usage

**Setup (0 minutes):**

```bash
# Already enabled!
# Go to: https://cloud.mongodb.com
# → Your Cluster → Metrics
```

**Key Metrics to Watch:**
- **Query Execution Time** - Should be < 100ms
- **Connections** - Should not max out
- **Disk IOPS** - High = add indexes
- **Slow Queries** - Optimize these first

**Cost:** FREE (included with MongoDB Atlas)

---

## 🛡️ TIER 2: Reliability Monitoring

### 2A. Error Tracking - Sentry (FREE TIER)

**What it monitors:**
- ✅ Frontend exceptions
- ✅ Backend exceptions
- ✅ Error rates
- ✅ Stack traces
- ✅ User context
- ✅ Release tracking

**Setup (15 minutes):**

#### Step 1: Sign up for Sentry
```bash
# Go to: https://sentry.io/signup/
# Free: 5,000 events/month
```

#### Step 2: Install in Frontend

```bash
cd frontend
npm install @sentry/react @sentry/tracing --save
```

#### Step 3: Configure Frontend Sentry

Create `frontend/src/sentry.js`:

```javascript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],

  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% in dev, 0.1 (10%) in prod

  // Environment
  environment: import.meta.env.MODE, // development or production

  // Release tracking
  release: "internship-connect@1.0.0",

  // Before send hook (sanitize sensitive data)
  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  }
});

export default Sentry;
```

#### Step 4: Wrap App with Sentry

Update `frontend/src/main.jsx`:

```javascript
import './sentry'; // Import first
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Step 5: Add Error Boundary (optional)

```javascript
import * as Sentry from "@sentry/react";

// Wrap your routes
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <Routes>
    {/* Your routes */}
  </Routes>
</Sentry.ErrorBoundary>
```

#### Step 6: Install in Backend

```bash
cd backend
npm install @sentry/node @sentry/tracing --save
```

#### Step 7: Configure Backend Sentry

Update `backend/src/server.js`:

```javascript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry EARLY
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Add Sentry request handler (BEFORE routes)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// Add Sentry error handler (AFTER routes, BEFORE error handler)
app.use(Sentry.Handlers.errorHandler());

// Your existing error handler
app.use((err, req, res, next) => {
  // Sentry will capture this automatically
  console.error('❌ Error:', err);
  // ... your error handling
});
```

#### Step 8: Add Environment Variables

**Vercel:**
```bash
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Render:**
```bash
SENTRY_DSN=https://...@sentry.io/...
```

#### Step 9: Test Error Tracking

```javascript
// Trigger test error
throw new Error("Test Sentry integration");
```

**What you get:**
- Real-time error notifications (email/Slack)
- Stack traces with source maps
- User context (which user hit the error)
- Breadcrumbs (what led to error)
- Release tracking (which deploy introduced bug)

**Cost:** FREE for 5,000 events/month

---

### 2B. Uptime Monitoring - UptimeRobot (FREE)

**What it monitors:**
- ✅ Backend uptime
- ✅ Response time
- ✅ SSL certificate expiry
- ✅ Downtime alerts

**Setup (5 minutes):**

```bash
# Go to: https://uptimerobot.com
# Free: 50 monitors, 5-minute checks

# Add Monitor:
Name: InternshipConnect Backend
URL: https://your-backend.onrender.com/health
Type: HTTP(S)
Interval: 5 minutes

# Alert Contacts:
Email: your@email.com
SMS: (optional, paid)
Webhook: (optional, for Slack)
```

**What you get:**
- Email alerts when site is down
- Response time charts
- Uptime percentage (SLA tracking)
- Status page (optional)

**Cost:** FREE for 50 monitors

---

## 📊 TIER 3: Usage Analytics

### 3A. User Analytics - Google Analytics 4 (FREE)

**What it monitors:**
- ✅ User sessions
- ✅ Page views
- ✅ Bounce rate
- ✅ User demographics
- ✅ Traffic sources

**Setup (10 minutes):**

#### Step 1: Create GA4 Property
```bash
# Go to: https://analytics.google.com
# Create Account → Create Property
# Property name: InternshipConnect
```

#### Step 2: Get Measurement ID
```bash
# Copy: G-XXXXXXXXXX
```

#### Step 3: Install gtag in Frontend

Add to `frontend/index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### Step 4: Track Custom Events

Create `frontend/src/analytics.js`:

```javascript
export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  }
};

// Usage examples:
export const trackResumeGenerated = () => {
  trackEvent('resume_generated', {
    event_category: 'engagement',
    event_label: 'resume_creation'
  });
};

export const trackProfileComplete = (percentage) => {
  trackEvent('profile_complete', {
    event_category: 'engagement',
    value: percentage
  });
};

export const trackApplicationSubmit = (internshipId) => {
  trackEvent('application_submit', {
    event_category: 'conversion',
    internship_id: internshipId
  });
};
```

#### Step 5: Use in Components

```javascript
import { trackResumeGenerated } from '../analytics';

const handleGenerate = async () => {
  // ... generate resume
  trackResumeGenerated(); // Track the event
};
```

**What you get:**
- Real-time user count
- Acquisition channels (where users come from)
- User behavior flow
- Conversion tracking
- E-commerce tracking (for paid plans)

**Cost:** FREE (unlimited)

---

### 3B. Session Replay - Microsoft Clarity (FREE)

**What it monitors:**
- ✅ Session recordings
- ✅ Heatmaps (clicks, scrolls)
- ✅ Rage clicks
- ✅ Dead clicks
- ✅ User frustration signals

**Setup (5 minutes):**

```bash
# Go to: https://clarity.microsoft.com
# Free: Unlimited sessions

# Create Project:
Name: InternshipConnect
Website: https://your-app.vercel.app

# Copy Clarity Tracking Code
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

**What you get:**
- Watch real user sessions (like screen recording)
- See where users click
- Find confusing UI elements
- Identify errors users encounter
- Heat maps of popular areas

**Cost:** FREE (unlimited)

---

### 3C. Funnel Tracking - Mixpanel (FREE TIER)

**What it monitors:**
- ✅ Conversion funnels
- ✅ User cohorts
- ✅ Retention analysis
- ✅ A/B testing

**Setup (15 minutes):**

#### Step 1: Sign up for Mixpanel
```bash
# Go to: https://mixpanel.com
# Free: 20M events/month
```

#### Step 2: Install in Frontend

```bash
cd frontend
npm install mixpanel-browser --save
```

#### Step 3: Initialize Mixpanel

Create `frontend/src/mixpanel.js`:

```javascript
import mixpanel from 'mixpanel-browser';

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
  debug: import.meta.env.MODE === 'development'
});

// Track user signup funnel
export const trackFunnelStep = (step, properties = {}) => {
  mixpanel.track(step, properties);
};

// Example funnel steps
export const FUNNEL_STEPS = {
  VISIT_HOMEPAGE: 'Visit Homepage',
  VIEW_REGISTER: 'View Register Page',
  SUBMIT_REGISTER: 'Submit Registration',
  VERIFY_EMAIL: 'Verify Email',
  COMPLETE_PROFILE: 'Complete Profile',
  GENERATE_RESUME: 'Generate First Resume',
  APPLY_INTERNSHIP: 'Apply to Internship'
};

// Identify user
export const identifyUser = (userId, traits = {}) => {
  mixpanel.identify(userId);
  mixpanel.people.set(traits);
};
```

#### Step 4: Track Funnel in App

```javascript
import { trackFunnelStep, FUNNEL_STEPS } from './mixpanel';

// In RegisterPage
const handleRegister = async () => {
  trackFunnelStep(FUNNEL_STEPS.SUBMIT_REGISTER, {
    role: formData.role,
    source: 'web'
  });
  // ... register logic
};

// After successful registration
trackFunnelStep(FUNNEL_STEPS.VERIFY_EMAIL);
```

**What you get:**
- Funnel conversion rates (where users drop off)
- Cohort analysis (which user groups convert better)
- Retention curves
- User segmentation
- A/B test results

**Cost:** FREE for 20M events/month

---

## 🎯 TIER 4: Complete Monitoring Stack

### Option A: All-in-One (Recommended)

**LogRocket (FREE TIER)**

**What it monitors:**
- ✅ Session replay
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Redux/state tracking
- ✅ Network logs
- ✅ Console logs

**Setup (10 minutes):**

```bash
cd frontend
npm install logrocket --save

# In main.jsx
import LogRocket from 'logrocket';

if (import.meta.env.PROD) {
  LogRocket.init('your-app-id/internship-connect');

  // Identify users
  LogRocket.identify(userId, {
    name: user.name,
    email: user.email,
    role: user.role
  });
}
```

**What you get:**
- Video replay of user sessions
- See exactly what user saw when error occurred
- Network request/response inspection
- Console log capture
- Redux action tracking

**Cost:** FREE for 1,000 sessions/month

---

## 📊 Recommended Monitoring Stack

### Tier 1: Essential (FREE - Start Here)

```yaml
Frontend:
  - Vercel Analytics (page views, web vitals)
  - Sentry (error tracking)
  - Google Analytics 4 (user behavior)

Backend:
  - Render Metrics (CPU, memory, requests)
  - Sentry (error tracking)
  - MongoDB Atlas (database performance)

Uptime:
  - UptimeRobot (uptime monitoring)

Total Cost: $0/month
Setup Time: 30 minutes
```

### Tier 2: Growth ($25-50/month)

```yaml
Add to Essential:
  - Microsoft Clarity (session replay, heatmaps)
  - Mixpanel (funnels, cohorts)
  - New Relic APM (detailed backend tracing)

Total Cost: $25-50/month
Setup Time: 1 hour
```

### Tier 3: Enterprise ($200+/month)

```yaml
Add to Growth:
  - LogRocket (advanced session replay)
  - Datadog (infrastructure monitoring)
  - PagerDuty (on-call alerts)

Total Cost: $200+/month
Setup Time: 2-3 hours
```

---

## 🚀 Quick Setup Script

Here's a script to set up essential monitoring:

```bash
#!/bin/bash

# Install monitoring packages
cd frontend
npm install @sentry/react @sentry/tracing mixpanel-browser --save

cd ../backend
npm install @sentry/node @sentry/tracing newrelic --save

# Create config files
cat > backend/newrelic.js << 'EOF'
// New Relic config here
EOF

cat > frontend/src/sentry.js << 'EOF'
// Sentry config here
EOF

echo "✅ Monitoring packages installed!"
echo "⚠️  Next steps:"
echo "1. Sign up for Sentry, New Relic, Google Analytics"
echo "2. Add API keys to environment variables"
echo "3. Configure each service"
echo "4. Redeploy application"
```

---

## 📈 Dashboard Setup

### Create a Monitoring Dashboard

Use **Geckoboard** or **Datadog** to create a single dashboard showing:

```
┌─────────────────────────────────────────────┐
│ InternshipConnect - Monitoring Dashboard   │
├─────────────────────────────────────────────┤
│                                             │
│ PERFORMANCE                                 │
│ ├─ Page Load: 2.3s ✅                       │
│ ├─ API Response: 145ms ✅                   │
│ └─ Database Queries: 87ms ✅                │
│                                             │
│ RELIABILITY                                 │
│ ├─ Error Rate: 0.02% ✅                     │
│ ├─ Uptime: 99.98% ✅                        │
│ └─ Failed Requests: 3 ⚠️                    │
│                                             │
│ USAGE                                       │
│ ├─ Active Users: 127                        │
│ ├─ Sessions Today: 489                      │
│ └─ Resumes Generated: 34                    │
│                                             │
│ INFRASTRUCTURE                              │
│ ├─ CPU: 45% ✅                              │
│ ├─ Memory: 67% ⚠️                           │
│ └─ Disk: 23% ✅                             │
└─────────────────────────────────────────────┘
```

---

## 🔔 Alert Configuration

### Critical Alerts (Immediate)

```yaml
Trigger Immediately:
  - Site down > 2 minutes
  - Error rate > 5%
  - API response time > 5s
  - CPU > 90% for 5 minutes

Alert Method:
  - Email + SMS
  - Slack notification
```

### Warning Alerts (15 minutes)

```yaml
Trigger After 15 Minutes:
  - Error rate > 1%
  - API response time > 2s
  - Memory > 85%

Alert Method:
  - Email
  - Slack notification
```

---

## ✅ Monitoring Checklist

### Daily Checks:
- [ ] Check error rate in Sentry
- [ ] Review slow queries in MongoDB Atlas
- [ ] Check uptime in UptimeRobot
- [ ] Review user complaints/feedback

### Weekly Checks:
- [ ] Analyze user funnels in Mixpanel
- [ ] Review session replays in Clarity
- [ ] Check performance trends in Vercel/Render
- [ ] Review API endpoint performance in New Relic

### Monthly Checks:
- [ ] Generate performance report
- [ ] Analyze user retention
- [ ] Review infrastructure costs
- [ ] Plan optimizations based on data

---

## 🎓 Next Steps

1. **Start with Tier 1 (Essential)** - Takes 30 minutes, completely free
2. **Add Sentry for errors** - Critical for catching bugs
3. **Enable Google Analytics** - Understand user behavior
4. **Set up UptimeRobot** - Get alerted when site is down
5. **Add Clarity** - See how users interact with your app

---

## 📞 Support Resources

- **Vercel Analytics:** https://vercel.com/docs/analytics
- **Render Metrics:** https://render.com/docs/metrics
- **Sentry Docs:** https://docs.sentry.io
- **New Relic Docs:** https://docs.newrelic.com
- **Google Analytics:** https://support.google.com/analytics
- **Microsoft Clarity:** https://docs.microsoft.com/en-us/clarity

---

**Your monitoring setup is now complete! 🎉**

Start with the free tier and expand as your app grows.
