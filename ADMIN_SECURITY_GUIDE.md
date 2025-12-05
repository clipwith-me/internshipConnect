# Admin Security Guide

## Overview

This guide explains how to secure admin access to ensure only you and your team can access the admin dashboard and analytics.

## Current Security Implementation

### Backend Security (Already Implemented ✅)

The admin endpoints are already protected with multiple security layers:

1. **Authentication Required**: All `/api/admin/*` endpoints require JWT authentication
2. **Role-Based Authorization**: Admin endpoints use `authorize('admin')` middleware
3. **Request Flow**:
   ```
   Request → authenticate → verify JWT → authorize('admin') → controller
   ```

**Code Location**: [backend/src/routes/admin.routes.js](backend/src/routes/admin.routes.js:17-18)

```javascript
// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));
```

### Protected Admin Endpoints

| Endpoint | Purpose | Access |
|----------|---------|--------|
| `GET /api/admin/stats` | Dashboard statistics (user counts, growth) | Admin only |
| `GET /api/admin/users` | User list with filters | Admin only |
| `PATCH /api/admin/users/:id/status` | Activate/deactivate users | Admin only |
| `DELETE /api/admin/users/:id` | Delete users | Admin only |
| `GET /api/admin/analytics` | Platform analytics (trends, charts) | Admin only |
| `GET /api/admin/activity` | Recent activity logs | Admin only |

## Creating Admin Users (Only for You and Your Team)

### Step 1: Create Your First Admin Account

Run this command to create an admin user:

```bash
node backend/create-admin.js your-email@company.com YourSecurePassword123! "Your Full Name"
```

**Example:**
```bash
node backend/create-admin.js admin@internshipconnect.com AdminPass2024! "John Doe"
```

**Output:**
```
🎉 ADMIN USER CREATED SUCCESSFULLY!
✅ Email: admin@internshipconnect.com
✅ Name: John Doe
✅ Role: admin
✅ Status: Active

🔑 LOGIN CREDENTIALS:
   Email: admin@internshipconnect.com
   Password: AdminPass2024!
```

### Step 2: Create Admin Accounts for Your Team Members

For each team member who needs admin access:

```bash
node backend/create-admin.js team-member@company.com SecurePass123! "Team Member Name"
```

**IMPORTANT SECURITY NOTES:**
1. Only create admin accounts for trusted team members
2. Use strong passwords (minimum 8 characters)
3. Keep credentials confidential
4. Never share admin credentials with students or organizations

## Accessing Admin Dashboard

### Option 1: Using API Directly (Testing)

You can test admin endpoints using tools like Postman, Insomnia, or curl:

1. **Login to get JWT token:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@company.com","password":"YourPassword"}'
   ```

2. **Use token to access admin stats:**
   ```bash
   curl http://localhost:5000/api/admin/stats \
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
   ```

### Option 2: Using count-users.js Script

For quick user statistics without needing login:

```bash
node backend/count-users.js
```

This script shows:
- Total users
- Breakdown by role (students, organizations, admins)
- Subscription tiers
- Signup growth (last 7 days, last 30 days)
- Recent signups

## Security Best Practices

### 1. Password Security

- **Minimum length**: 8 characters
- **Recommended**: 12+ characters with mix of uppercase, lowercase, numbers, symbols
- **Change passwords** regularly (every 90 days)
- **Never reuse** passwords across accounts

### 2. Admin Account Management

#### DO:
✅ Create separate admin accounts for each team member
✅ Revoke access immediately when team members leave
✅ Use strong, unique passwords for each admin
✅ Keep admin credentials in a secure password manager
✅ Monitor admin activity logs regularly

#### DON'T:
❌ Share admin credentials with anyone outside your team
❌ Use simple/guessable passwords
❌ Create admin accounts for students or organizations
❌ Leave unused admin accounts active
❌ Store passwords in plain text

### 3. Revoking Admin Access

To remove admin access from a former team member:

**Option A: Change role to regular user**
```javascript
// In MongoDB or via script
db.users.updateOne(
  { email: "former-team-member@company.com" },
  { $set: { role: "organization", isActive: false } }
)
```

**Option B: Deactivate account**
```bash
# Via admin API (requires another admin's token)
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}'
```

**Option C: Delete account** (not recommended, use deactivation instead)
```bash
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Verification Checklist

Use this checklist to verify admin security is properly configured:

- [ ] Created admin account for yourself
- [ ] Created admin accounts for all team members
- [ ] Verified admin endpoints require authentication
- [ ] Tested that non-admin users cannot access `/api/admin/*`
- [ ] Confirmed JWT tokens expire correctly (15 minutes)
- [ ] All team members use strong passwords
- [ ] Admin credentials stored securely (password manager)
- [ ] No admin credentials shared in code/Git/Slack

## Testing Admin Access Control

### Test 1: Verify Admin Can Access

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"YourPassword"}'

# 2. Copy the accessToken from response

# 3. Access admin stats
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# ✅ Expected: Returns statistics data
```

### Test 2: Verify Non-Admin Cannot Access

```bash
# 1. Login as student or organization
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"StudentPassword"}'

# 2. Copy the accessToken

# 3. Try to access admin stats
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer STUDENT_TOKEN"

# ❌ Expected: Returns 403 Forbidden error
```

### Test 3: Verify Unauthenticated Cannot Access

```bash
curl http://localhost:5000/api/admin/stats

# ❌ Expected: Returns 401 Unauthorized error
```

## Current Security Status

✅ **Authentication**: JWT-based authentication implemented
✅ **Authorization**: Role-based access control (admin only)
✅ **Password Hashing**: Bcrypt with 10 salt rounds
✅ **Token Expiry**: Access tokens expire in 15 minutes
✅ **Refresh Tokens**: 7-day expiry for session management
✅ **Protected Routes**: All admin routes behind auth middleware

## Additional Security Recommendations

### For Production Deployment:

1. **Environment Variables**
   - Never commit `.env` files to Git
   - Use secure environment variable management (e.g., Render/Vercel secrets)
   - Rotate JWT secrets periodically

2. **HTTPS Only**
   - Always use HTTPS in production
   - Never send credentials over HTTP

3. **Rate Limiting** (Optional Enhancement)
   ```javascript
   // Add to admin routes
   import rateLimit from 'express-rate-limit';

   const adminLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   router.use(adminLimiter);
   ```

4. **IP Whitelisting** (Optional for Extra Security)
   ```javascript
   // Middleware to restrict admin access to specific IPs
   const allowedIPs = ['YOUR_OFFICE_IP', 'YOUR_HOME_IP'];

   const ipWhitelist = (req, res, next) => {
     const clientIP = req.ip;
     if (!allowedIPs.includes(clientIP)) {
       return res.status(403).json({ error: 'Access denied' });
     }
     next();
   };

   router.use(ipWhitelist); // Add before authenticate
   ```

5. **Audit Logging**
   - Log all admin actions (who, what, when)
   - Monitor for suspicious activity
   - Review logs regularly

## Quick Reference

### Create Admin User
```bash
node backend/create-admin.js email@company.com Password123! "Full Name"
```

### View User Statistics
```bash
node backend/count-users.js
```

### Check Admin Access
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Need Help?

If you encounter any security issues or need to adjust access controls, check:
1. [backend/src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js) - Authentication logic
2. [backend/src/routes/admin.routes.js](backend/src/routes/admin.routes.js) - Admin route protection
3. [backend/src/controllers/admin.controller.js](backend/src/controllers/admin.controller.js) - Admin endpoint logic

**Last Updated**: December 5, 2025
**Security Status**: ✅ Admin access restricted to authorized users only
