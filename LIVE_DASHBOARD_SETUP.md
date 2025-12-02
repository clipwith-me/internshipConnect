# 🔴 Live Monitoring Dashboards - Real-Time Updates

**Real-time dashboards that update every 1-5 seconds**

---

## 🎯 What You'll Build

A live monitoring dashboard showing:

```
┌─────────────────────────────────────────────────────────┐
│  🔴 LIVE  InternshipConnect Dashboard                  │
│  Updated: 2 seconds ago                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  LIVE METRICS (Updates every 5s)                        │
│  ┌────────────┬────────────┬────────────┬────────────┐ │
│  │ CPU: 45%   │ Memory: 67%│ RPS: 127   │ Errors: 0  │ │
│  │ ████░░░░   │ ██████░░   │ ████████   │ ✅         │ │
│  └────────────┴────────────┴────────────┴────────────┘ │
│                                                          │
│  ACTIVE USERS (Real-time)                               │
│  👤 342 users online  📈 +12 in last minute             │
│  🌍 Top locations: US (45%), UK (23%), India (18%)      │
│                                                          │
│  ERROR STREAM (Live)                                    │
│  ⚠️  2:34 PM - Failed login attempt (user@email.com)   │
│  ✅ 2:33 PM - Resume generated (john@doe.com)           │
│  ✅ 2:32 PM - Profile updated (jane@smith.com)          │
│                                                          │
│  API HEALTH (1s updates)                                │
│  /api/auth/login       ✅ 145ms  (200 OK)               │
│  /api/resumes/generate ✅ 2.3s   (200 OK)               │
│  /api/students/profile ✅ 89ms   (200 OK)               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Option 1: Grafana + Prometheus (FREE - Self-Hosted)

**Best for:** Complete control, unlimited metrics
**Updates:** Real-time (1-5 second refresh)
**Cost:** FREE

### Setup (45 minutes)

#### Step 1: Add Prometheus Metrics to Backend

```bash
cd backend
npm install prom-client express-prometheus-middleware --save
```

Create `backend/src/middleware/metrics.middleware.js`:

```javascript
import promClient from 'prom-client';
import promBundle from 'express-prometheus-middleware';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  timeout: 5000
});

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000]
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});

const resumesGenerated = new promClient.Counter({
  name: 'resumes_generated_total',
  help: 'Total number of resumes generated'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeUsers);
register.registerMetric(resumesGenerated);

// Middleware to track requests
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
};

// Expose metrics endpoint
export const metricsEndpoint = (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};

export { activeUsers, resumesGenerated };
```

Add to `backend/src/server.js`:

```javascript
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics.middleware.js';

// Add metrics middleware (before routes)
app.use(metricsMiddleware);

// Metrics endpoint (accessible to Prometheus)
app.get('/metrics', metricsEndpoint);
```

Track custom events:

```javascript
// In resume.controller.js
import { resumesGenerated } from '../middleware/metrics.middleware.js';

export const generateAIResume = async (req, res) => {
  // ... generate resume
  resumesGenerated.inc(); // Increment counter
  // ... rest of code
};
```

#### Step 2: Deploy Prometheus (Docker)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  prometheus-data:
  grafana-data:
```

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 5s # Update every 5 seconds
  evaluation_interval: 5s

scrape_configs:
  - job_name: 'internship-connect-backend'
    static_configs:
      - targets: ['your-backend.onrender.com']
    metrics_path: '/metrics'
```

Start services:

```bash
docker-compose up -d
```

#### Step 3: Configure Grafana Dashboard

1. **Access Grafana:** http://localhost:3000
2. **Login:** admin / admin
3. **Add Data Source:**
   - Configuration → Data Sources → Add Prometheus
   - URL: http://prometheus:9090
   - Save & Test

4. **Import Dashboard:**
   - Dashboards → Import → 1860 (Node Exporter)
   - Or create custom dashboard

5. **Create Live Panels:**

```json
{
  "title": "Active Users (Live)",
  "targets": [
    {
      "expr": "active_users_total"
    }
  ],
  "refresh": "5s"
}
```

**Result:** Live dashboard updating every 5 seconds

---

## 🚀 Option 2: Datadog (Easiest - Hosted)

**Best for:** No DevOps, production-grade
**Updates:** Real-time (1 second)
**Cost:** $15/host/month (14-day free trial)

### Setup (15 minutes)

#### Step 1: Sign Up for Datadog

```bash
# Go to: https://www.datadoghq.com/free-trial/
# Create account
# Copy API key
```

#### Step 2: Install Datadog Agent

**For Render (Hosted):**

Add to `backend/package.json`:

```json
{
  "dependencies": {
    "dd-trace": "latest"
  }
}
```

Add to `backend/src/server.js` (VERY TOP):

```javascript
// Must be first import!
import './datadog-init.js';

// Then rest of imports
```

Create `backend/src/datadog-init.js`:

```javascript
import tracer from 'dd-trace';

tracer.init({
  logInjection: true,
  analytics: true,
  runtimeMetrics: true,
  env: process.env.NODE_ENV || 'development',
  service: 'internship-connect-api'
});

export default tracer;
```

Add to Render Environment Variables:

```bash
DD_API_KEY=your_datadog_api_key
DD_SITE=datadoghq.com
DD_SERVICE=internship-connect-api
DD_ENV=production
DD_LOGS_INJECTION=true
DD_TRACE_ANALYTICS_ENABLED=true
DD_RUNTIME_METRICS_ENABLED=true
```

**For Frontend (RUM - Real User Monitoring):**

```bash
cd frontend
npm install @datadog/browser-rum --save
```

Create `frontend/src/datadog.js`:

```javascript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: import.meta.env.VITE_DD_APP_ID,
  clientToken: import.meta.env.VITE_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'internship-connect-web',
  env: import.meta.env.MODE,
  version: '1.0.0',
  sampleRate: 100,
  trackInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input'
});

datadogRum.startSessionReplayRecording();
```

Import in `frontend/src/main.jsx`:

```javascript
import './datadog';
```

#### Step 3: Create Live Dashboard

1. **Go to Datadog Dashboard**
2. **Create New Dashboard**
3. **Add Widgets:**

```yaml
CPU Usage:
  - Metric: system.cpu.user
  - Refresh: 1s
  - Visualization: Timeseries

Memory Usage:
  - Metric: system.mem.used
  - Refresh: 1s

Active Requests:
  - Metric: trace.express.request.hits
  - Refresh: 1s

Error Rate:
  - Metric: trace.express.request.errors
  - Refresh: 1s

Response Time (p95):
  - Metric: trace.express.request.duration.by.service.95p
  - Refresh: 1s
```

4. **Enable Auto-Refresh:**
   - Top right → Auto-refresh: 1s

**Result:** Live dashboard with 1-second updates

---

## 🚀 Option 3: Custom WebSocket Dashboard (FREE)

**Best for:** Full customization, real-time push
**Updates:** Instant (WebSocket push)
**Cost:** FREE

### Setup (2 hours)

#### Step 1: Add WebSocket Server to Backend

```bash
cd backend
npm install socket.io --save
```

Update `backend/src/server.js`:

```javascript
import { Server } from 'socket.io';
import http from 'http';

// Create HTTP server
const httpServer = http.createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Store metrics
const metrics = {
  activeUsers: 0,
  requestsPerSecond: 0,
  cpu: 0,
  memory: 0,
  errors: []
};

// Emit metrics every second
setInterval(() => {
  io.emit('metrics', metrics);
}, 1000);

// Track metrics
app.use((req, res, next) => {
  metrics.requestsPerSecond++;

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      metrics.errors.push({
        timestamp: new Date(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        user: req.user?.email || 'anonymous'
      });

      // Keep only last 100 errors
      if (metrics.errors.length > 100) {
        metrics.errors.shift();
      }
    }
  });

  next();
});

// Update CPU/Memory every 5 seconds
import os from 'os';
setInterval(() => {
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total);
  }, 0) / cpus.length;

  metrics.cpu = (cpuUsage * 100).toFixed(2);
  metrics.memory = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2);
}, 5000);

// Reset RPS counter
setInterval(() => {
  metrics.requestsPerSecond = 0;
}, 1000);

// Listen on httpServer (not app)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔴 WebSocket metrics streaming on ws://localhost:${PORT}`);
});
```

#### Step 2: Create Live Dashboard Page

Create `frontend/src/pages/LiveDashboard.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const LiveDashboard = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    requestsPerSecond: 0,
    cpu: 0,
    memory: 0,
    errors: []
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

    socket.on('metrics', (data) => {
      setMetrics(data);
      setLastUpdate(new Date());
    });

    return () => socket.disconnect();
  }, []);

  const timeSinceUpdate = Math.floor((new Date() - lastUpdate) / 1000);

  return (
    <div className="p-6 bg-neutral-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h1 className="text-3xl font-bold">Live Dashboard</h1>
        </div>
        <div className="text-neutral-400 text-sm">
          Updated {timeSinceUpdate}s ago
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* CPU */}
        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="text-neutral-400 text-sm mb-2">CPU Usage</div>
          <div className="text-4xl font-bold mb-2">{metrics.cpu}%</div>
          <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${metrics.cpu}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="text-neutral-400 text-sm mb-2">Memory</div>
          <div className="text-4xl font-bold mb-2">{metrics.memory}%</div>
          <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full transition-all duration-500"
              style={{ width: `${metrics.memory}%` }}
            />
          </div>
        </div>

        {/* RPS */}
        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="text-neutral-400 text-sm mb-2">Requests/sec</div>
          <div className="text-4xl font-bold">{metrics.requestsPerSecond}</div>
          <div className="text-green-500 text-sm mt-2">
            {metrics.requestsPerSecond > 0 ? '↗' : '→'} Live
          </div>
        </div>

        {/* Errors */}
        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="text-neutral-400 text-sm mb-2">Errors (1h)</div>
          <div className="text-4xl font-bold">{metrics.errors.length}</div>
          <div className={`text-sm mt-2 ${metrics.errors.length === 0 ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.errors.length === 0 ? '✓ Healthy' : '⚠ Issues'}
          </div>
        </div>
      </div>

      {/* Error Stream */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Error Stream (Live)</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {metrics.errors.length === 0 ? (
            <div className="text-neutral-500 text-center py-8">
              ✓ No errors - System healthy
            </div>
          ) : (
            metrics.errors.slice().reverse().map((error, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-neutral-700 rounded">
                <div className="text-red-500">⚠</div>
                <div className="flex-1">
                  <div className="font-mono text-sm">
                    {error.method} {error.path} - {error.status}
                  </div>
                  <div className="text-neutral-400 text-xs">
                    {new Date(error.timestamp).toLocaleTimeString()} - {error.user}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
```

Add route in `frontend/src/App.jsx`:

```javascript
import LiveDashboard from './pages/LiveDashboard';

// In routes:
<Route path="/dashboard/live" element={
  <ProtectedRoute>
    <LiveDashboard />
  </ProtectedRoute>
} />
```

#### Step 3: Install Socket.IO Client

```bash
cd frontend
npm install socket.io-client --save
```

**Result:** Custom live dashboard with instant WebSocket updates

---

## 📊 Comparison Table

| Feature | Grafana | Datadog | Custom WS | Vercel/Render |
|---------|---------|---------|-----------|---------------|
| **Setup Time** | 45 min | 15 min | 2 hours | 0 min |
| **Update Speed** | 1-5s | 1s | Instant | 5-60s |
| **Cost** | FREE | $15/mo | FREE | FREE |
| **Customization** | High | Medium | Complete | Low |
| **Real-time** | Yes | Yes | Yes | No |
| **Backend Metrics** | ✅ | ✅ | ✅ | ✅ |
| **Frontend RUM** | ❌ | ✅ | Custom | ✅ |
| **Error Tracking** | ❌ | ✅ | Custom | ❌ |
| **Easy Setup** | ❌ | ✅ | ❌ | ✅ |

---

## 🎯 Recommended Approach

### For Quick Start (Today):
```
1. Use Vercel + Render built-in dashboards (already active)
2. Add Sentry for errors (15 min setup)
3. Add UptimeRobot for uptime (5 min setup)

Total: 20 minutes, FREE
```

### For Production (Next Week):
```
1. Add Datadog APM (15 min setup, $15/month)
   - Real-time metrics (1s updates)
   - Error tracking
   - Performance monitoring
   - Frontend RUM

Total: 15 minutes, $15/month
```

### For Enterprise (Future):
```
1. Self-host Grafana + Prometheus
   - Complete control
   - Unlimited metrics
   - FREE (infrastructure costs only)

Total: 2-3 hours setup, infrastructure costs
```

---

## 🚀 Quick Setup - Datadog (Recommended)

**Let's get you real-time dashboards in 15 minutes:**

### 1. Sign Up (2 min)
```
Go to: https://www.datadoghq.com/free-trial/
14-day free trial, no credit card
```

### 2. Backend Setup (5 min)
```bash
cd backend
npm install dd-trace --save

# Add to top of server.js:
import './datadog-init.js';

# Create datadog-init.js (from code above)

# Add to Render environment:
DD_API_KEY=your_key
DD_SITE=datadoghq.com
DD_SERVICE=internship-connect-api
```

### 3. Frontend Setup (5 min)
```bash
cd frontend
npm install @datadog/browser-rum --save

# Create src/datadog.js (from code above)
# Import in src/main.jsx
```

### 4. Create Dashboard (3 min)
```
1. Datadog → Dashboards → New Dashboard
2. Add widgets for CPU, Memory, RPS, Errors
3. Set auto-refresh to 1s
4. Save
```

**Done! You now have real-time monitoring with 1-second updates! 🎉**

---

## 📈 Next Steps

1. **Start simple:** Use Vercel/Render built-in (FREE, already active)
2. **Add errors:** Set up Sentry (FREE, 10 min)
3. **Go real-time:** Add Datadog (14-day trial, 15 min)
4. **Custom needs:** Build WebSocket dashboard (2 hours)

---

**See MONITORING_GUIDE.md for detailed setup instructions for each option.**
