# InternshipConnect - Testing & Usage Guide

## Quick Start

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- MongoDB connected

### Test Flow

#### 1. Organization Registration & Login

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myorg@test.com",
    "password": "SecurePass123",
    "role": "organization",
    "companyName": "My Test Company"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myorg@test.com",
    "password": "SecurePass123"
  }'
```

Save the `accessToken` from the response.

#### 2. Create Internship

```bash
curl -X POST http://localhost:5000/api/internships \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Software Engineering Intern",
    "description": "Join our team to work on cutting-edge projects. You will collaborate with experienced engineers and learn modern technologies.",
    "location": {
      "type": "remote"
    },
    "compensation": {
      "type": "paid",
      "amount": 2000
    },
    "timeline": {
      "startDate": "2025-06-01",
      "endDate": "2025-08-31",
      "applicationDeadline": "2025-05-15"
    }
  }'
```

#### 3. Get My Internships

```bash
curl -X GET http://localhost:5000/api/internships/my-internships \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Student Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "StudentPass123",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### 5. Browse Internships (Public)

```bash
curl -X GET "http://localhost:5000/api/internships?page=1&limit=10"
```

## Frontend Testing

### 1. Organization Flow
1. Go to `http://localhost:5173/auth/register`
2. Select "Organization" tab
3. Fill in:
   - Company Name: "Test Corp"
   - Email: "test@corp.com"
   - Password: "TestPass123"
4. Click "Create Account"
5. Should redirect to `/dashboard`
6. Click "Post Internship" or navigate to `/dashboard/internships/create`
7. Fill in internship details:
   - Title: min 5 characters
   - Description: min 50 characters
   - Location: Select remote/onsite/hybrid
   - Compensation: Select paid/unpaid/stipend
   - Timeline: Set dates
8. Click "Post Internship"
9. Should redirect to `/dashboard/my-internships` with the new listing

### 2. Student Flow
1. Logout (top right menu → Logout)
2. Register as Student
3. Browse internships at `/dashboard/internships`
4. Click on an internship → "Apply Now"
5. Write cover letter → Submit
6. View applications at `/dashboard/applications`

## Fixed Issues

### Backend
- ✅ OrganizationProfile validation (required fields with defaults)
- ✅ Route conflicts (my-internships before :id)
- ✅ Internship model (description min 50, responsibilities optional)
- ✅ Form validation (city/country optional for remote)
- ✅ Error handling (proper 400/401/409 responses)

### Frontend
- ✅ Dashboard layout null checks
- ✅ React Router v7 future flags
- ✅ AuthContext error display
- ✅ Resume management page
- ✅ Dashboard stats widgets

## Common Issues & Solutions

### "Token expired" / 401 Errors
**Solution:** Logout and login again to get fresh tokens

### "Email already registered" / 409 Error
**Solution:** Use a different email or login with existing account

### "Organization profile not found"
**Solution:** Ensure you registered as "organization" role, not "student"

### "Validation failed" errors
**Check:**
- Title: 5-100 characters
- Description: 50-5000 characters
- Location type: must be remote/onsite/hybrid
- Compensation type: must be paid/unpaid/stipend

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)

### Internships
- `GET /api/internships` - List all (public)
- `GET /api/internships/:id` - Get one (public)
- `GET /api/internships/my-internships` - Organization's listings (protected)
- `POST /api/internships` - Create (organization only)
- `PUT /api/internships/:id` - Update (organization only)
- `PATCH /api/internships/:id/publish` - Publish draft (organization only)
- `DELETE /api/internships/:id` - Delete (organization only)

### Applications
- `POST /api/applications` - Submit application (student only)
- `GET /api/applications` - Student's applications (student only)
- `GET /api/applications/internship/:id` - Applications for internship (organization only)
- `PATCH /api/applications/:id/status` - Update status (organization only)
- `DELETE /api/applications/:id` - Withdraw (student only)

### Resumes
- `POST /api/resumes/generate` - Generate AI resume (student only)
- `GET /api/resumes` - Student's resumes (student only)
- `GET /api/resumes/:id` - Get resume (student only)
- `DELETE /api/resumes/:id` - Delete resume (student only)

## Status Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or bad input
- `401 Unauthorized` - Not authenticated or token expired
- `403 Forbidden` - Authenticated but not authorized (wrong role)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource (e.g., email already exists)
- `500 Internal Server Error` - Server error

## Next Steps

1. **Clear your browser localStorage** to remove old tokens
2. **Register a fresh organization account**
3. **Create an internship posting**
4. **Verify it appears in "My Internships"**
5. **Test student registration and application flow**

All core functionality is now working correctly!
