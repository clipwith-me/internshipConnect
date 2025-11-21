# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

We take the security of InternshipConnect seriously. If you have found a security vulnerability, please report it privately.

### How to Report

Email: **internshipconnects@gmail.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- Acknowledgment: Within 48 hours
- Initial assessment: Within 5 business days
- Critical issues: 1-7 days to fix
- High severity: 7-30 days
- Medium/Low: 30-90 days

## Security Features

### Authentication

- bcrypt password hashing
- JWT-based authentication
- Account lockout protection
- Refresh token rotation

### API Security

- Rate limiting
- Input validation
- XSS protection
- CSRF protection
- Security headers (Helmet)
- CORS restrictions

### Database

- Encrypted connections
- IP whitelisting
- Parameterized queries (Mongoose)
- Input sanitization

## Best Practices

### For Developers

1. Keep dependencies updated
2. Use strong JWT secrets (32+ chars)
3. Never commit .env files
4. Enable rate limiting
5. Use HTTPS in production

### For Users

1. Use strong passwords (8+ chars)
2. Don't share credentials
3. Log out on shared devices
4. Report suspicious activity

---

Thank you for helping keep InternshipConnect secure!
