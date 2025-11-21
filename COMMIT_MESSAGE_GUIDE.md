# 📝 Git Commit Message Guide

## Why Meaningful Commit Messages Matter

Good commit messages:

- Make code reviews easier
- Help track project history
- Generate automatic changelogs
- Make debugging easier

---

## **Commit Message Format (Conventional Commits)**

```
<type>(<scope>): <subject>

<body>

<footer>
```

---

## **Types**

| Type         | Usage                        | Example                                   |
| ------------ | ---------------------------- | ----------------------------------------- |
| **feat**     | New feature                  | `feat(auth): Add email verification`      |
| **fix**      | Bug fix                      | `fix(profile): Resolve 404 error`         |
| **docs**     | Documentation                | `docs: Update README`                     |
| **style**    | Code style (no logic change) | `style: Format code with Prettier`        |
| **refactor** | Restructure code             | `refactor(api): Simplify request handler` |
| **perf**     | Performance improvement      | `perf(db): Add query indexing`            |
| **test**     | Add/update tests             | `test(auth): Add login validation tests`  |
| **chore**    | Maintenance                  | `chore: Update dependencies`              |
| **ci**       | CI/CD configuration          | `ci: Add GitHub Actions workflow`         |

---

## **Scope (Optional)**

The scope specifies what part of the project is affected:

```
feat(auth): Add password reset
    ↑      ↑
  type   scope
```

**Common Scopes:**

- `auth` - Authentication
- `profile` - User profile
- `internship` - Internship features
- `application` - Application management
- `payment` - Payment/billing
- `email` - Email notifications
- `api` - API endpoints
- `ui` - User interface
- `db` - Database
- `docs` - Documentation

---

## **Subject**

Guidelines:

- ✅ Use imperative mood: "Add" not "Added"
- ✅ Start with lowercase
- ✅ Don't end with period
- ✅ Maximum 50 characters
- ✅ Be specific and concise

**Good Examples:**

```
feat(auth): Add email verification
fix(profile): Resolve 404 on profile load
docs: Update API documentation
```

**Bad Examples:**

```
Fixed bug ❌ (too vague)
Added new stuff ❌ (not specific)
Fix: profile page issue ❌ (colon in wrong place)
```

---

## **Body (Optional but Recommended)**

Explain:

- **What** was changed
- **Why** it was changed
- **How** it impacts the project

```
feat(internship): Add internship search filters

- Add category filter dropdown
- Add salary range slider
- Add location autocomplete
- Implement debouncing for performance
- Store filter preferences in localStorage
```

---

## **Footer (Optional)**

Reference issues, breaking changes, or related commits:

```
feat(auth): Implement OAuth2

BREAKING CHANGE: Old authentication tokens are no longer valid
CLOSES #123
RELATES-TO #456
```

---

## **Real-World Examples**

### ✅ Example 1: New Feature

```
feat(payment): Implement Stripe subscription management

- Add subscription creation endpoint
- Add subscription cancellation logic
- Add webhook for payment status updates
- Store subscription data in database
- Update user dashboard to show subscription info

CLOSES #89
```

### ✅ Example 2: Bug Fix

```
fix(profile): Resolve profile image upload 403 error

The upload endpoint was checking for wrong authorization header.
Changed from 'x-api-key' to 'Authorization' Bearer token.

- Update upload middleware to use correct header
- Add unit tests for authorization
- Document API authentication in README

RELATES-TO #45
```

### ✅ Example 3: Performance

```
perf(database): Add indexes to improve query speed

- Add index on user.email field
- Add composite index on internship.category + internship.location
- Query performance improved by ~60%

Testing: Verified with 100k records in test database
```

### ✅ Example 4: Documentation

```
docs: Update API endpoint documentation

- Add authentication examples
- Document error response codes
- Add request/response samples for all endpoints
- Include rate limiting info
```

### ✅ Example 5: Refactor

```
refactor(api): Simplify request validation logic

- Extract validation into separate middleware
- Reduce code duplication (DRY principle)
- Improve error message consistency

No functional changes. All tests pass.
```

---

## **Commit Commands**

### **Basic Commit**

```bash
git commit -m "feat(auth): Add password reset"
```

### **Commit with Body**

```bash
git commit -m "feat(auth): Add password reset

- Send reset email to user
- Generate token with 1-hour expiration
- Update password with validation"
```

### **Interactive Commit (Recommended)**

```bash
git commit  # Opens editor for detailed message
```

### **Amend Last Commit**

```bash
git commit --amend
# Use when you forget something
```

---

## **Workflow: Your Next Commits**

### **Step 1: Make Changes**

```bash
# Edit files...
```

### **Step 2: Stage Changes**

```bash
git add .
# or specific files
git add frontend/src/pages/ProfilePage.jsx
```

### **Step 3: Commit with Meaningful Message**

```bash
git commit -m "feat(profile): Add profile edit functionality

- Add edit mode toggle
- Add form validation
- Save changes to database
- Add success/error notifications
- Implement auto-save draft feature"
```

### **Step 4: Push to GitHub**

```bash
git push origin main
# or your feature branch
git push origin feature/profile-edit
```

---

## **Using the Template**

When committing, follow this template:

```
<type>(<scope>): <50 char subject>
<blank line>
<body explaining what/why/how>
<blank line>
<footer with references>
```

---

## **Auto-Generated Changelog**

With conventional commits, you can auto-generate changelogs:

```
## Version 1.2.0

### Features
- feat(auth): Add email verification
- feat(internship): Add search filters
- feat(payment): Implement subscription

### Bug Fixes
- fix(profile): Resolve 404 error
- fix(upload): Fix image compression issue

### Performance
- perf(db): Add query indexing

### Documentation
- docs: Update API guide
```

---

## **Checklist Before Committing**

- [ ] Changes are complete and working
- [ ] All tests pass locally
- [ ] Code is properly formatted
- [ ] No console errors or warnings
- [ ] Commit message follows format
- [ ] Related issues are referenced
- [ ] No sensitive data (keys, passwords) included

---

## **Quick Reference**

```bash
# Good commits
git commit -m "feat(auth): Add Google login"
git commit -m "fix(api): Fix null reference error"
git commit -m "docs: Update setup instructions"
git commit -m "perf(db): Optimize user queries"

# Bad commits
git commit -m "fix bug"
git commit -m "WIP: stuff"
git commit -m "asdf"
git commit -m "Updated files"
```

---

**Remember: Your future self will thank you for clear, meaningful commits! 📝**
