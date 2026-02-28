# Milestone 1: Setup Guide

## Prerequisites
- Node.js 20+
- npm or pnpm

## Quick Start (Development Mode)

**Want to start developing immediately without LinkedIn OAuth setup?**

See [`docs/DEV_AUTH.md`](docs/DEV_AUTH.md) for instructions on using the development authentication bypass.

Just run:
```bash
npm run dev
```

Then visit http://localhost:3000/login and select a test user - no OAuth setup required!

---

## Database Setup
The database has already been initialized with Prisma. The SQLite database is located at `prisma/dev.db`.

## LinkedIn OAuth Setup

To enable LinkedIn authentication, you need to create a LinkedIn App:

### 1. Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the required information:
   - App name: The SLAs (or your preferred name)
   - LinkedIn Page: Select or create a company page
   - App logo: Upload a logo (optional for development)
4. Check the agreement and click **"Create app"**

### 2. Configure OAuth Settings

1. In your app dashboard, go to the **"Auth"** tab
2. Under **"OAuth 2.0 settings"**, add the redirect URL:
   ```
   http://localhost:3000/api/auth/callback/linkedin
   ```
3. Under **"OAuth 2.0 scopes"**, request the following scopes:
   - `openid`
   - `profile`
   - `email`

### 3. Get Your Credentials

1. In the **"Auth"** tab, you'll find:
   - **Client ID**
   - **Client Secret** (click "Show" to reveal)
2. Copy these values

### 4. Update Environment Variables

Edit the `.env.local` file and replace the placeholder values:

```bash
LINKEDIN_CLIENT_ID="your-actual-client-id"
LINKEDIN_CLIENT_SECRET="your-actual-client-secret"
```

## Running the Application

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Testing Authentication

1. Visit the home page - you should see the landing page with "Sign in with LinkedIn" button
2. Click the LinkedIn sign-in button
3. You'll be redirected to LinkedIn for authentication
4. After successful authentication, you'll be redirected back to the `/feed` page
5. You should see a welcome message with your LinkedIn profile information

## What's Implemented

- ✅ LinkedIn OAuth authentication
- ✅ User model with LinkedIn profile data storage
- ✅ Session management with database sessions
- ✅ Protected routes (unauthenticated users redirected to login)
- ✅ Login/logout functionality
- ✅ Basic landing page and feed placeholder

## File Structure

```
app/
├── api/auth/[...nextauth]/route.ts  # NextAuth API routes
├── feed/page.tsx                     # Protected feed page
├── login/page.tsx                    # Login page
├── page.tsx                          # Landing page
└── layout.tsx                        # Root layout with SessionProvider

components/
├── LoginButton.tsx                   # LinkedIn login button
├── LogoutButton.tsx                  # Logout button
└── SessionProvider.tsx               # Client-side session provider

lib/
├── auth.ts                           # NextAuth configuration
└── prisma.ts                         # Prisma client singleton

prisma/
├── schema.prisma                     # Database schema
└── migrations/                       # Database migrations

middleware.ts                         # Route protection middleware
```

## Troubleshooting

### "Invalid Client" Error
- Verify that your Client ID and Client Secret are correct in `.env.local`
- Make sure the redirect URL in LinkedIn app settings matches exactly: `http://localhost:3000/api/auth/callback/linkedin`

### Session Not Persisting
- Check that the database is accessible
- Verify that `DATABASE_URL` in `.env.local` is correct

### Redirect Loop
- Clear your browser cookies for localhost
- Restart the development server

## Next Steps

Once authentication is working, you're ready for:
- **Milestone 2**: Core Data Models & Software Catalog
- **Milestone 3**: Software Profile Pages
