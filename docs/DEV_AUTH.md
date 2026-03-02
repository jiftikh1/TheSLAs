# Development Authentication Guide

## Quick Start (No LinkedIn OAuth Required!)

You can now develop and test the UI without setting up LinkedIn OAuth credentials.

### How It Works

In development mode (`NODE_ENV=development`), a special "Development Login" option is available that bypasses LinkedIn authentication entirely.

### Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the login page:**
   ```
   http://localhost:3000/login
   ```

3. **Choose a test user:**
   - You'll see a dropdown with pre-configured test users
   - Each user has different roles, industries, and seniority levels
   - Select one and click "Sign in"

4. **You're in!**
   - No OAuth setup required
   - No external authentication flow
   - Instant access to test the UI

### Available Test Users

The following test users are pre-configured:

1. **Dev User** (default)
   - Email: `dev@example.com`
   - Role: Senior Systems Engineer
   - Industry: Technology
   - Company Size: Medium
   - Seniority: Senior

2. **Sarah Chen**
   - Email: `admin@example.com`
   - Role: VP of Engineering
   - Industry: SaaS
   - Company Size: Large
   - Seniority: VP

3. **Alex Rodriguez**
   - Email: `practitioner@example.com`
   - Role: RevOps Manager
   - Industry: E-commerce
   - Company Size: Medium
   - Seniority: Senior

4. **Jordan Lee**
   - Email: `user@example.com`
   - Role: Product Manager
   - Industry: FinTech
   - Company Size: Small
   - Seniority: Mid

### Testing Different User Perspectives

Use different test users to see how the platform works from various perspectives:

- **VP/Director users**: Leadership perspective on software decisions
- **Practitioners**: Day-to-day operational insights
- **Product Managers**: User experience focus

### Adding More Test Users

To add more test users, edit `lib/auth-dev.ts`:

```typescript
export const DEV_USERS = [
  {
    email: "your-email@example.com",
    name: "Your Name",
    role: "Your Role",
    industry: "Your Industry",
    companySize: "small|medium|large|enterprise",
    seniority: "junior|mid|senior|lead|director|vp|c-level",
  },
  // ... existing users
];
```

### Production vs Development

- **Development Mode**: Uses the credentials provider with test users
- **Production Mode**: Uses LinkedIn OAuth only (dev login disabled)

The development authentication is automatically disabled when:
- `NODE_ENV` is set to `production`
- The app is deployed

### Security Note

⚠️ **Important**: The development authentication bypass is:
- Only available in development mode
- Automatically disabled in production
- Should NEVER be enabled in production environments

### Still Want to Test LinkedIn OAuth?

If you want to test the actual LinkedIn OAuth flow in development, follow the instructions in `SETUP.md` to:
1. Create a LinkedIn app
2. Get OAuth credentials
3. Add them to `.env.local`

The LinkedIn OAuth option will still be available alongside the dev login.

---

## FAQ

**Q: Do I need LinkedIn OAuth credentials to develop?**
A: No! Use the dev login for faster iteration.

**Q: Will this work in production?**
A: No. It's automatically disabled when `NODE_ENV !== "development"`.

**Q: Can I use this to create real accounts?**
A: These are test accounts only. They're stored in your local database and won't affect production.

**Q: How do I switch between different users?**
A: Sign out and sign back in with a different test user.
