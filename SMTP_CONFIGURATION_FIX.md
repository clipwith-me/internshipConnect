# 🔧 SMTP Configuration Fix

**Issue:** SMTP credentials are in `.env` but server shows "SMTP not configured"

---

## ✅ Solution: Remove Spaces from App Password

### Current Configuration (backend/.env)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=internshipconnects@gmail.com
SMTP_PASS=hiea durv spno epvv  # ❌ Has spaces
```

### Fixed Configuration
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=internshipconnects@gmail.com
SMTP_PASS=hieadurvspnoepvv  # ✅ No spaces
```

---

## 📝 Steps to Fix

### 1. Update backend/.env
Remove all spaces from the `SMTP_PASS` value:

**Before:**
```bash
SMTP_PASS=hiea durv spno epvv
```

**After:**
```bash
SMTP_PASS=hieadurvspnoepvv
```

### 2. Restart Backend Server
The server needs to be restarted to pick up the new .env values.

**In your terminal:**
1. Press `Ctrl+C` to stop the backend server
2. Run: `cd backend && npm run dev`

### 3. Verify SMTP Connection
When the server starts, you should see:
```
✅ SMTP connection verified
```

Instead of:
```
⚠️ SMTP not configured - emails will be logged to console only
```

---

## 🧪 Test Email Sending

### Test Welcome Email (Register New User)
1. Go to: http://localhost:5173/auth/register
2. Register a new account
3. Check backend console for:
   ```
   ✅ SMTP connection verified
   📧 Welcome email sent to: user@example.com
   ```
4. Check your email inbox (may take 30-60 seconds)
5. Look in spam folder if not in inbox

### Test Password Reset
1. Go to: http://localhost:5173/auth/login
2. Click "Forgot password?"
3. Enter email: `internshipconnects@gmail.com` (or any registered email)
4. Check backend console for:
   ```
   📧 Password reset email sent to: internshipconnects@gmail.com
   ```
5. Check your email inbox

---

## ⚠️ Important Notes

### Gmail App Password Format
- **Correct:** `hieadurvspnoepvv` (no spaces, lowercase)
- **Incorrect:** `hiea durv spno epvv` (has spaces)
- **Incorrect:** `HIEA DURV SPNO EPVV` (uppercase with spaces)

### If Emails Still Don't Send

**1. Verify 2-Step Verification is Enabled**
- Go to: https://myaccount.google.com/security
- Ensure "2-Step Verification" is ON

**2. Regenerate App Password**
- Go to: https://myaccount.google.com/apppasswords
- Delete old password
- Create new password for "Mail" / "Other (InternshipConnect)"
- Copy the 16-character password (ignore spaces)
- Paste into .env without spaces

**3. Check Gmail Settings**
- Make sure "Less secure app access" is NOT required (App Passwords bypass this)
- Ensure account is not locked or suspended

**4. Test SMTP Connection Manually**
You can test the connection using a simple script:

```javascript
// test-smtp.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP Ready to send emails');
  }
});
```

Run with: `node test-smtp.js`

---

## 🔍 Troubleshooting

### Error: "Invalid login"
**Cause:** App password is incorrect or has spaces

**Fix:**
1. Remove all spaces from `SMTP_PASS`
2. Ensure it's exactly 16 lowercase characters
3. Regenerate app password if needed

### Error: "self signed certificate in certificate chain"
**Cause:** SSL certificate issue

**Fix:** Add to email service:
```javascript
transporter = nodemailer.createTransporter({
  // ... other config
  tls: {
    rejectUnauthorized: false
  }
});
```

### Emails Not Arriving
**Possible causes:**
1. Check spam/junk folder
2. Gmail may delay emails (30-60 seconds)
3. Daily send limit reached (500 emails/day for Gmail)
4. Account under review

**Test:**
- Send to a different email provider (Yahoo, Outlook, etc.)
- Check Gmail "Sent" folder to verify email was sent

---

## ✅ Expected Behavior

### After Fix:

**Backend Startup:**
```bash
🔄 Connecting to MongoDB...
✅ Mongoose connected to MongoDB
✅ MongoDB Connected: ...
📊 Database: internship_connect
✅ SMTP connection verified  # ← Should see this!
🚀 Server running on port 5000
```

**On Registration:**
```bash
Registration successful
📧 Welcome email sent to: user@example.com
```

**On Forgot Password:**
```bash
📧 Password reset email sent to: user@example.com
```

**In Email Inbox:**
- Professional HTML email
- From: "InternshipConnect <internshipconnects@gmail.com>"
- With logo, gradient header, CTA button
- May be in spam folder initially (mark as "Not Spam")

---

## 📧 Gmail Setup Checklist

- [ ] 2-Step Verification enabled
- [ ] App Password created for "Mail"
- [ ] App Password copied WITHOUT spaces
- [ ] SMTP_PASS in .env has NO spaces (16 chars)
- [ ] SMTP_USER is full Gmail address
- [ ] SMTP_PORT is 587 (not 465)
- [ ] Backend server restarted
- [ ] "SMTP connection verified" appears in console

---

## 🚀 Quick Fix Command

```bash
# 1. Edit backend/.env and remove spaces from SMTP_PASS
# 2. Restart backend:
cd backend
npm run dev

# Look for:
# ✅ SMTP connection verified
```

---

## 📝 Summary

**Problem:** App password has spaces (`hiea durv spno epvv`)
**Solution:** Remove spaces (`hieadurvspnoepvv`)
**Test:** Restart backend, register new user, check email inbox

After fixing, emails will be sent to real inboxes instead of just logged to console! 📧✨