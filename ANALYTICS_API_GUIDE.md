# Analytics API Guide

**Created:** 2025-12-03
**Status:** ✅ Complete - Backend Ready

---

## Overview

The Analytics API provides comprehensive metrics and insights for organizations to track their internship postings, applications, and applicant demographics.

**Access:** Organizations only
**Authentication:** Required (Bearer token)

---

## API Endpoints

### 1. Get Organization Overview Analytics

**Endpoint:** `GET /api/analytics/organization`

**Description:** Get comprehensive analytics for all internships posted by the organization.

**Query Parameters:**
- `timeRange` (optional): Time period for analytics
  - Options: `7d`, `30d`, `90d`, `1y`
  - Default: `30d`

**Response:**
```json
{
  "success": true,
  "data": {
    "timeRange": "30d",
    "overview": {
      "totalInternships": 15,
      "activeInternships": 8,
      "totalApplications": 247,
      "totalViews": 1823,
      "conversionRate": "13.55%",
      "offerAcceptanceRate": "78.26%"
    },
    "statusBreakdown": {
      "submitted": 89,
      "under-review": 45,
      "shortlisted": 32,
      "interview": 18,
      "offered": 23,
      "accepted": 18,
      "rejected": 22
    },
    "topInternships": [
      {
        "id": "673d1b2c3f4a5b6c7d8e9f0a",
        "title": "Software Engineering Intern",
        "applications": 67,
        "views": 423,
        "conversionRate": "15.84%"
      }
    ],
    "trends": [
      {
        "date": "2025-11-03",
        "applications": 8
      },
      {
        "date": "2025-11-04",
        "applications": 12
      }
    ],
    "demographics": {
      "education": [
        {
          "name": "Bachelor's Degree",
          "count": 142
        },
        {
          "name": "Master's Degree",
          "count": 78
        }
      ],
      "topSkills": [
        {
          "name": "JavaScript",
          "count": 156
        },
        {
          "name": "Python",
          "count": 134
        }
      ],
      "experience": [
        {
          "level": "No experience",
          "count": 98
        },
        {
          "level": "1-2 experiences",
          "count": 112
        }
      ]
    }
  }
}
```

**Usage Example:**
```bash
# Get 30-day analytics
curl -X GET "http://localhost:5000/api/analytics/organization?timeRange=30d" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get 90-day analytics
curl -X GET "http://localhost:5000/api/analytics/organization?timeRange=90d" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Error Responses:**
```json
// Not an organization
{
  "success": false,
  "error": "This endpoint is only accessible to organizations"
}

// Invalid time range
{
  "success": false,
  "error": "Invalid time range. Must be one of: 7d, 30d, 90d, 1y"
}
```

---

### 2. Get Analytics Summary

**Endpoint:** `GET /api/analytics/summary`

**Description:** Get a quick summary of key metrics for dashboard display (last 30 days only).

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalInternships": 15,
      "activeInternships": 8,
      "totalApplications": 247,
      "totalViews": 1823,
      "conversionRate": "13.55%",
      "offerAcceptanceRate": "78.26%"
    },
    "topInternships": [
      {
        "id": "673d1b2c3f4a5b6c7d8e9f0a",
        "title": "Software Engineering Intern",
        "applications": 67,
        "views": 423,
        "conversionRate": "15.84%"
      },
      {
        "id": "673d1b2c3f4a5b6c7d8e9f0b",
        "title": "Data Science Intern",
        "applications": 54,
        "views": 389,
        "conversionRate": "13.88%"
      }
    ],
    "recentTrend": [
      {
        "date": "2025-11-27",
        "applications": 9
      },
      {
        "date": "2025-11-28",
        "applications": 11
      }
    ]
  }
}
```

**Usage Example:**
```bash
curl -X GET "http://localhost:5000/api/analytics/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3. Get Internship-Specific Analytics

**Endpoint:** `GET /api/analytics/internship/:id`

**Description:** Get detailed analytics for a specific internship posting.

**Parameters:**
- `id` (path): Internship ID

**Response:**
```json
{
  "success": true,
  "data": {
    "internship": {
      "id": "673d1b2c3f4a5b6c7d8e9f0a",
      "title": "Software Engineering Intern",
      "status": "active",
      "createdAt": "2025-10-15T08:30:00.000Z",
      "views": 423,
      "applications": 67
    },
    "metrics": {
      "totalApplications": 67,
      "conversionRate": "15.84%",
      "avgTimeToApply": "3.2 days",
      "avgQualityScore": "82.5%"
    },
    "statusBreakdown": {
      "submitted": 23,
      "under-review": 15,
      "shortlisted": 12,
      "interview": 8,
      "offered": 6,
      "accepted": 3,
      "rejected": 0
    },
    "recentApplications": [
      {
        "id": "673d2c3d4e5f6a7b8c9d0e1f",
        "studentName": "John Doe",
        "status": "shortlisted",
        "appliedAt": "2025-11-28T14:22:00.000Z",
        "qualityScore": 100
      }
    ]
  }
}
```

**Usage Example:**
```bash
curl -X GET "http://localhost:5000/api/analytics/internship/673d1b2c3f4a5b6c7d8e9f0a" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Error Responses:**
```json
// Internship not found or access denied
{
  "success": false,
  "error": "Internship not found or you do not have access to it"
}

// Not an organization
{
  "success": false,
  "error": "This endpoint is only accessible to organizations"
}
```

---

## Metrics Explained

### Overview Metrics

- **totalInternships**: Total number of internships posted by organization
- **activeInternships**: Number of internships currently active
- **totalApplications**: Total applications received across all internships
- **totalViews**: Total views across all internship postings
- **conversionRate**: Percentage of views that resulted in applications
- **offerAcceptanceRate**: Percentage of offers that were accepted

### Status Breakdown

Application lifecycle stages:
1. **submitted**: Initial application submitted
2. **under-review**: Organization is reviewing the application
3. **shortlisted**: Applicant has been shortlisted
4. **interview**: Applicant is scheduled for/has had an interview
5. **offered**: Job offer extended to applicant
6. **accepted**: Applicant accepted the offer
7. **rejected**: Application was rejected

### Application Quality Score

Based on profile completeness (0-100%):
- **25%**: Has education history
- **25%**: Has 3+ skills listed
- **25%**: Has work experience
- **25%**: Has personal summary

### Time-to-Apply

Average number of days between internship posting and application submission.

### Conversion Rate

Formula: `(Total Applications / Total Views) × 100`

Higher is better - indicates attractive internship postings.

---

## Frontend Integration

### Adding to Frontend API Service

```javascript
// frontend/src/services/api.js

export const analyticsAPI = {
  // Get organization overview analytics
  getOverview: (timeRange = '30d') =>
    api.get(`/analytics/organization?timeRange=${timeRange}`),

  // Get quick summary for dashboard
  getSummary: () =>
    api.get('/analytics/summary'),

  // Get internship-specific analytics
  getInternshipAnalytics: (internshipId) =>
    api.get(`/analytics/internship/${internshipId}`)
};
```

### Usage in React Components

```javascript
import { analyticsAPI } from '../services/api';

// In component
const [analytics, setAnalytics] = useState(null);
const [timeRange, setTimeRange] = useState('30d');

useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getOverview(timeRange);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  fetchAnalytics();
}, [timeRange]);
```

---

## Authentication

All analytics endpoints require a valid JWT access token.

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Getting a Token:**
1. Login via `/api/auth/login`
2. Use returned `accessToken`
3. Include in all analytics requests

**Token Expiry:**
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Frontend automatically refreshes expired tokens

---

## Access Control

### Organization-Only Access

All analytics endpoints verify:
1. User is authenticated
2. User role is `organization`
3. Organization profile exists

### Ownership Verification

For internship-specific analytics:
1. Internship must belong to requesting organization
2. Returns 404 if internship doesn't exist or doesn't belong to organization

---

## Performance Considerations

### Caching Recommendations

Analytics data can be cached to improve performance:

```javascript
// Recommended TTL (Time To Live)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Analytics data changes slowly - safe to cache
// Reduces database load for frequently accessed metrics
```

### Pagination

For large datasets:
- Recent applications limited to 10 per internship
- Top internships limited to 5 in overview
- Consider implementing pagination for full history

---

## Testing

### Manual Testing with curl

```bash
# 1. Login as organization
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "org@example.com",
    "password": "password123"
  }'

# 2. Copy accessToken from response

# 3. Test analytics endpoints
curl -X GET "http://localhost:5000/api/analytics/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Automated Testing

```javascript
// Jest test example
describe('Analytics API', () => {
  let orgToken;

  beforeAll(async () => {
    // Login as organization
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'org@test.com', password: 'test123' });
    orgToken = response.body.data.accessToken;
  });

  test('GET /analytics/summary returns overview', async () => {
    const response = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${orgToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.overview).toBeDefined();
  });
});
```

---

## Error Handling

### Common Errors

| Status Code | Error | Cause |
|-------------|-------|-------|
| 401 | No token provided | Missing Authorization header |
| 403 | Not accessible to organizations | User is not an organization |
| 404 | Organization profile not found | Organization profile doesn't exist |
| 404 | Internship not found | Invalid internship ID or no access |
| 400 | Invalid time range | Unsupported time range value |
| 500 | Failed to fetch analytics | Database or server error |

### Frontend Error Handling

```javascript
try {
  const response = await analyticsAPI.getOverview('30d');
  setAnalytics(response.data.data);
} catch (error) {
  if (error.response?.status === 403) {
    // Not an organization - redirect
    navigate('/dashboard');
  } else if (error.response?.status === 401) {
    // Token expired - handled by axios interceptor
  } else {
    // Show error message
    setError('Failed to load analytics. Please try again.');
  }
}
```

---

## Next Steps

### Frontend Development

1. **Create AnalyticsDashboardPage.jsx**
   - Overview cards with key metrics
   - Time range selector (7d, 30d, 90d, 1y)
   - Charts for trends and demographics
   - Top internships table

2. **Install Chart Library**
   ```bash
   npm install recharts
   # or
   npm install chart.js react-chartjs-2
   ```

3. **Create Chart Components**
   - TrendChart.jsx (line chart for application trends)
   - DemographicsChart.jsx (pie/bar charts)
   - MetricsCard.jsx (overview stat cards)

4. **Add Analytics Route**
   ```javascript
   // App.jsx
   <Route path="/analytics" element={
     <ProtectedRoute>
       <AnalyticsDashboardPage />
     </ProtectedRoute>
   } />
   ```

---

## Status

- ✅ Backend Service Layer Complete
- ✅ Backend Controller Complete
- ✅ Backend Routes Complete
- ✅ Server Integration Complete
- ✅ API Documentation Complete
- ⏳ Frontend UI (Pending)
- ⏳ Chart Components (Pending)
- ⏳ End-to-End Testing (Pending)

---

**Last Updated:** 2025-12-03
**Commit:** `fc16455` - "feat: Complete Analytics Dashboard backend"
