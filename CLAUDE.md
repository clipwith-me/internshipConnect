# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InternshipConnect is a full-stack web platform connecting students and organizations through AI-powered internship matching and resume optimization. The project uses a monorepo structure with separate frontend and backend.

**Tech Stack:**
- Backend: Node.js, Express, MongoDB (Mongoose), JWT authentication
- Frontend: React 19, React Router 6, Vite, Tailwind CSS
- Database: MongoDB Atlas (cloud-hosted)

## Development Commands

### Backend Development

```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start development server with nodemon (port 5000)
npm start               # Start production server
npm run lint            # Run ESLint
npm test                # Run Jest tests (if configured)
```

### Frontend Development

```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start Vite dev server with HMR (port 5173)
npm run build           # Build for production (outputs to dist/)
npm run preview         # Preview production build locally
npm run lint            # Run ESLint
```

### Testing the Full Stack

1. **Start backend** in Terminal 1: `cd backend && npm run dev`
2. **Start frontend** in Terminal 2: `cd frontend && npm run dev`
3. **Access app** at http://localhost:5173
4. **Backend API** available at http://localhost:5000/api

**Health check endpoints:**
- `http://localhost:5000/health` - Server health
- `http://localhost:5000/api/auth/test` - Auth routes test

## Architecture Overview

### Monorepo Structure

```
internshipConnect/
├── backend/          # Express API server
│   ├── src/
│   │   ├── server.js         # Entry point, middleware setup
│   │   ├── config/
│   │   │   └── database.js   # MongoDB connection
│   │   ├── models/           # Mongoose schemas (7 models)
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API endpoints
│   │   └── middleware/       # Auth & validation
│   └── .env                  # Environment config
│
└── frontend/         # React SPA
    ├── src/
    │   ├── main.jsx          # React entry point
    │   ├── App.jsx           # Router setup
    │   ├── context/          # AuthContext (state management)
    │   ├── pages/            # Route components
    │   ├── components/       # Reusable UI components
    │   ├── layouts/          # Layout wrappers
    │   ├── services/         # API client (Axios)
    │   └── styles/           # Design tokens
    └── .env                  # Frontend config
```

### Backend Architecture

**Pattern:** MVC with middleware-based request handling

**Middleware Pipeline:**
```
Request → Helmet → CORS → JSON Parser → Validation →
Authentication → Route Handler → Error Handler → Response
```

**Authentication Flow:**
1. User registers/logs in → Credentials validated
2. Password hashed with bcrypt (pre-save hook in User model)
3. JWT tokens generated: Access (15m) + Refresh (7d)
4. Tokens stored: Access in memory, Refresh in localStorage
5. Protected routes use `authenticate` middleware to verify JWT
6. 401 errors trigger automatic token refresh via frontend interceptor

**API Base URL:** `http://localhost:5000/api`

**Key Endpoints:**
```
POST /auth/register     # User signup (student/organization)
POST /auth/login        # User login
POST /auth/refresh      # Token refresh
GET  /auth/me           # Get current user (protected)
POST /auth/logout       # Logout

# Student endpoints (protected, student role)
GET  /students/profile
PUT  /students/profile
GET  /students/applications

# Organization endpoints (protected, organization role)
GET  /organizations/profile
GET  /organizations/internships
POST /organizations/internships
```

**Response Format (Standard):**
```javascript
{
  success: boolean,
  message?: string,
  data?: any,
  error?: string,
  errors?: [{ field, message }]  // Validation errors
}
```

### Database Schema

**7 Core Models** with relationships:

```
User (authentication)
├── email, password (hashed), role (student/organization/admin)
├── subscription: { plan, status, features }
└── Security: loginAttempts, lockUntil, resetToken

StudentProfile
├── References User via user field
├── personalInfo: { firstName, lastName, phone, DOB, location }
├── education: [{ institution, degree, GPA, graduation }]
├── skills: [{ name, category, level, embeddings }]
├── experience: [{ company, title, dates, achievements }]
└── preferences: { internshipTypes, industries, salary }

OrganizationProfile
├── References User
├── companyInfo: { name, industry, size, website }
├── verification: { status, trustScore, documents }
├── statistics: { totalInternships, applications, hires }
└── monetization: { featuredListings, premiumFeatures }

Internship
├── References OrganizationProfile
├── Core: title, description, requirements, location
├── compensation: { type, amount, benefits }
├── timeline: { startDate, endDate, applicationDeadline }
├── status: draft/active/paused/closed/filled/expired
├── featured: { isFeatured, priority, duration }
└── statistics: { views, applications, conversionRate }

Application
├── References StudentProfile + Internship
├── materials: { resume, coverLetter, portfolio }
├── status: submitted → under-review → shortlisted → interview → offered → accepted/rejected
├── aiAnalysis: { matchScore, skillsMatch, strengths, concerns }
└── interviews: [{ type, date, interviewer, feedback }]

Resume
├── References StudentProfile
├── originalFile: Cloudinary reference
├── aiGeneratedVersions: [{ version, customization }]
└── analytics: { views, downloads, applications }

Payment
├── References User
├── transaction: { transactionId, amount, status }
├── provider: Stripe/Paystack data
└── purchaseType: subscription/featured-listing/resume-credits
```

**Important Relationships:**
- User (1) → (1) StudentProfile OR OrganizationProfile (polymorphic)
- StudentProfile (1) → (Many) Application
- OrganizationProfile (1) → (Many) Internship
- Internship (1) → (Many) Application
- StudentProfile (1) → (Many) Resume

**Key Indexes:**
- Email, role, status fields for fast lookups
- Compound indexes: (user, status), (organization, status)
- Text search on names, titles, descriptions
- Geospatial index on location.coordinates

### Frontend Architecture

**State Management:** React Context API (AuthContext)
- Manages: user, profile, loading, error
- Methods: login(), register(), logout(), updateProfile(), hasFeature()
- Persistence: Tokens in localStorage
- Auto-initialization: Checks for token on app mount

**Routing Structure:**
```
/ → Redirect to /dashboard
/showcase → ComponentShowcase (public test page)
/auth/* (GuestRoute - redirects if authenticated)
  ├── /login → LoginPage
  └── /register → RegisterPage
/dashboard/* (ProtectedRoute - requires authentication)
  ├── / → DashboardPage
  ├── /internships → InternshipsPage
  ├── /applications → ApplicationsPage
  ├── /resumes → ResumesPage
  └── /settings → SettingsPage
```

**API Client** (`src/services/api.js`):
- Axios instance with base URL from `VITE_API_URL`
- **Request Interceptor**: Auto-attaches `Authorization: Bearer {token}`
- **Response Interceptor**: Handles 401 errors
  - Attempts token refresh via `/api/auth/refresh`
  - Queues failed requests during refresh
  - Retries original requests with new token
  - Auto-logout if refresh fails

**Design System** (`src/styles/tokens.js`):
- Microsoft Fluent Design inspired
- Primary: `#0078D4` (Microsoft Blue)
- Tailwind configured with custom tokens
- Typography: Segoe UI font stack
- Spacing: 8px base grid
- Animations: fadeIn, slideIn*, scaleIn, pulse, shimmer, blob
- Background gradients with animated blobs for modern aesthetic

**Styling Philosophy:**
- Clean, modern, professional SaaS aesthetic
- Centered layouts with cards for auth pages
- Gradient backgrounds with subtle animated elements
- Rounded corners (rounded-lg, rounded-2xl) for modern feel
- Shadow hierarchy (shadow-md, shadow-lg, shadow-xl) for depth
- Smooth transitions on all interactive elements
- Focus states with rings for accessibility
- Mobile-first responsive design

**Layout Components:**
- `AuthLayout`: Centered card layout with gradient background and animated blobs
  - Replaces split-screen design with modern centered card
  - Gradient background: `neutral-50 → primary-50 → neutral-100`
  - White card with `rounded-2xl`, `shadow-xl`, responsive padding
  - Animated gradient blobs using `animate-blob` with staggered delays
- `DashboardLayout`: Sidebar navigation for authenticated users

**Reusable Components:**
- `Input`: Controlled input with icons, error display
- `Button`: Variants, loading states, sizes
- `Badge`: Status indicators
- `Card`: Content containers
- `Modal`: Dialog component
- `ProtectedRoute`, `GuestRoute`: Route guards

## Environment Configuration

### Backend (.env)

**Required:**
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=AppName
DB_NAME=internship_connect
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=different-refresh-token-secret-min-32-chars
JWT_EXPIRES_IN=7d
```

**Optional (for future features):**
```bash
# AI Features
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# or
PAYSTACK_SECRET_KEY=sk_test_...
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:5000/api
```

## Data Flow Examples

### User Registration Flow

```
1. Frontend: User fills register form (email, password, role, name/company)
2. Frontend: Client-side validation
3. Frontend: POST /api/auth/register
4. Backend: express-validator validates request
5. Backend: Check email uniqueness
6. Backend: User.create() → password hashed via pre-save hook
7. Backend: Create StudentProfile or OrganizationProfile
8. Backend: Generate JWT tokens (access + refresh)
9. Backend: Return { user, profile, tokens }
10. Frontend: Save tokens to localStorage
11. Frontend: AuthContext updates state
12. Frontend: Navigate to /dashboard
```

### Protected API Request Flow

```
1. Component calls API: studentAPI.getProfile()
2. Axios request interceptor adds Authorization header
3. Backend authenticate middleware:
   - Extract token from header
   - Verify JWT with JWT_SECRET
   - Load User document
   - Attach to req.user
4. Route handler executes with req.user
5. Response interceptor checks for 401:
   - If 401: Refresh token flow
   - Retry request with new token
6. Component receives data
```

### Token Refresh on 401

```
1. API request returns 401 (token expired)
2. Check if refresh already in progress
   - If yes: Queue request
   - If no: Start refresh
3. POST /api/auth/refresh with refreshToken
4. Receive new accessToken
5. Update localStorage
6. Retry original request with new token
7. Process queued requests
8. If refresh fails: Clear tokens, redirect to /auth/login
```

## Security Notes

**Authentication:**
- Passwords: bcrypt hashing (10 salt rounds)
- Account lockout: 5 failed attempts → 2 hours lock
- Token rotation: New access token from refresh token

**Token Strategy:**
- Access tokens: 15-minute expiry (short-lived)
- Refresh tokens: 7-day expiry (stored in localStorage)
- Separate signing secrets for access/refresh

**API Security:**
- Helmet middleware for security headers
- CORS restricted to FRONTEND_URL
- Input validation via express-validator
- Password reset tokens: SHA256 hashed, 10-minute expiry

**Frontend Security:**
- No secrets in code
- Protected routes redirect unauthenticated users
- Automatic token refresh prevents expired token errors

## Common Development Patterns

### Creating a New API Endpoint

1. **Define Model** (if needed): `backend/src/models/Entity.js`
2. **Create Controller**: `backend/src/controllers/entity.controller.js`
   ```javascript
   export const getEntity = async (req, res) => {
     try {
       const entity = await Entity.findById(req.params.id);
       res.json({ success: true, data: entity });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   };
   ```
3. **Define Routes**: `backend/src/routes/entity.routes.js`
   ```javascript
   import { authenticate } from '../middleware/auth.middleware.js';
   router.get('/:id', authenticate, getEntity);
   ```
4. **Mount in server.js**: `app.use('/api/entities', entityRoutes);`
5. **Add to Frontend API Client**: `frontend/src/services/api.js`
   ```javascript
   export const entityAPI = {
     getById: (id) => api.get(`/entities/${id}`)
   };
   ```

### Creating a New Frontend Page

1. **Create Page Component**: `frontend/src/pages/NewPage.jsx`
2. **Add Route**: In `frontend/src/App.jsx`
   ```jsx
   <Route path="/new" element={
     <ProtectedRoute>
       <NewPage />
     </ProtectedRoute>
   } />
   ```
3. **Add Navigation Link**: In `DashboardLayout.jsx` sidebar
4. **Use API Client**: Import and call from `services/api.js`

### Adding Form Validation

**Backend (express-validator):**
```javascript
import { body, validationResult } from 'express-validator';

router.post('/entity',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('name').isLength({ min: 2 }).withMessage('Name too short'),
    validate
  ],
  controller.create
);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};
```

**Frontend (React state):**
```javascript
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!formData.email) newErrors.email = 'Email required';
  if (formData.password.length < 8) newErrors.password = 'Min 8 chars';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  // Submit form...
};
```

## Debugging Tips

### Backend Not Starting

1. **Check MongoDB connection:**
   - Verify `MONGODB_URI` in `.env`
   - Check MongoDB Atlas cluster is active (not paused)
   - Verify IP whitelist includes your IP or `0.0.0.0/0`

2. **Check environment variables:**
   ```bash
   cat backend/.env | grep -E "(MONGODB_URI|JWT_SECRET)"
   ```

3. **View logs:** Backend terminal shows connection status:
   ```
   ✅ MongoDB Connected: cluster.mongodb.net
   🚀 Server running on port 5000
   ```

### Frontend Styling Not Working

1. **Verify Tailwind installed:**
   ```bash
   npm list tailwindcss postcss autoprefixer
   ```

2. **Restart dev server:**
   ```bash
   Ctrl+C  # Stop
   npm run dev  # Restart
   ```

3. **Hard refresh browser:** `Ctrl+Shift+R`

4. **Custom animations not working:**
   - Check `tailwind.config.js` includes custom keyframes and animations
   - Verify `index.css` includes animation-delay utility classes
   - Restart dev server after config changes

### API Requests Failing

1. **Check backend is running:** http://localhost:5000/health
2. **Verify CORS:** Frontend URL matches `FRONTEND_URL` in backend `.env`
3. **Check browser console (F12):** Look for CORS or network errors
4. **Check backend terminal:** Look for request logs and errors
5. **Verify token:** Check localStorage for `accessToken`

### Token Refresh Loop

If you see infinite 401 errors:
1. Clear localStorage: `localStorage.clear()`
2. Logout and login again
3. Check `JWT_SECRET` matches between registration and login
4. Verify token expiry times are reasonable (15m/7d)

## Known Issues / Current Limitations

1. **MongoDB Atlas Connection:** Requires active cluster and IP whitelisting
2. **Styling Dependencies:** Tailwind CSS must be installed (`npm install -D tailwindcss postcss autoprefixer`)
3. **AI Features:** Referenced in models but not yet implemented
4. **Payment Integration:** Payment model exists but Stripe/Paystack integration incomplete
5. **Email Notifications:** SMTP configured but not implemented
6. **Real-time Features:** No WebSocket/Socket.io integration yet
7. **Image Uploads:** Cloudinary referenced but not fully integrated

## Git Workflow

**Current Branch:** `claude/fix-signup-flow-011CUpdAXZMZtTcn6f7R8gzc`

**When making changes:**
1. Make modifications
2. Stage relevant files only (avoid `node_modules/`)
3. Commit with descriptive message
4. Push to current branch: `git push -u origin claude/fix-signup-flow-011CUpdAXZMZtTcn6f7R8gzc`

**Do not commit:**
- `node_modules/` directories
- `.env` files (already in .gitignore)
- Build artifacts (`dist/`, `build/`)
- IDE configs (`.vscode/`, `.idea/`)

## Testing Checklist

Before considering a feature complete:

1. **Backend:**
   - [ ] Server starts without errors
   - [ ] MongoDB connects successfully
   - [ ] API endpoint returns expected format
   - [ ] Validation catches invalid inputs
   - [ ] Error handling returns proper status codes

2. **Frontend:**
   - [ ] Dev server starts without errors
   - [ ] Page loads without console errors
   - [ ] Form validation works client-side
   - [ ] API calls succeed with proper data
   - [ ] Loading states show during requests
   - [ ] Error messages display on failures
   - [ ] Navigation works after actions

3. **Integration:**
   - [ ] Registration creates user + profile
   - [ ] Login returns tokens and navigates
   - [ ] Protected routes require authentication
   - [ ] Token refresh works on 401
   - [ ] Logout clears tokens and state

## Project Roadmap Context

This is a **9-day MVP** project currently on Day 3 (Authentication complete).

**Completed:**
- ✅ Project setup and dependencies
- ✅ Design system with Tailwind (including custom animations)
- ✅ Database models (all 7 defined)
- ✅ Authentication flow (register/login/token refresh)
- ✅ Protected routes
- ✅ Basic components library
- ✅ Modern login page design (centered card layout with gradient background)
- ✅ AuthLayout redesign (centered card replacing split-screen)

**Next Steps:**
- Dashboard implementation (student/organization views)
- Internship listing and search
- Application submission workflow
- Resume management
- AI-powered features
- Payment integration
- Deployment to Vercel/Render
