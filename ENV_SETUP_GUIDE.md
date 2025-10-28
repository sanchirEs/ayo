# 🔐 Environment Setup Guide

## Quick Start

### 1. Create your environment file

Copy the template below into a new file called `.env.local` in the `/ayo` directory:

```bash
# ========================================
# AYO E-COMMERCE - ENVIRONMENT VARIABLES
# ========================================
# Copy this file to .env.local for local development
# All variables marked as REQUIRED must be set before deployment

# ========================================
# BACKEND API CONFIGURATION (REQUIRED)
# ========================================
# The URL of your backend API server
# Development: http://localhost:3000
# Staging: https://api-staging.yourdomain.com
# Production: https://api.yourdomain.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# ========================================
# AUTHENTICATION (REQUIRED)
# ========================================
# NextAuth secret key - MUST be at least 32 characters
# Generate with: openssl rand -base64 32
# WARNING: Never commit the actual secret to git!
AUTH_SECRET=your-super-secret-key-at-least-32-characters-long-change-this

# Alternative name for AUTH_SECRET (NextAuth v5 compatibility)
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters-long-change-this

# The canonical URL of your application
# Development: http://localhost:3001
# Production: https://yourdomain.com
NEXTAUTH_URL=http://localhost:3001

# ========================================
# OAUTH PROVIDERS (REQUIRED for OAuth)
# ========================================
# Google OAuth - Get from: https://console.cloud.google.com/
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth - Get from: https://developers.facebook.com/
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# ========================================
# OPTIONAL CONFIGURATION
# ========================================
# Node environment (automatically set by Next.js)
# NODE_ENV=development

# Enable debug logging for authentication
# DEBUG_AUTH=false

# Session configuration
# SESSION_MAX_AGE=2592000

# ========================================
# DEPLOYMENT CHECKLIST
# ========================================
# Before deploying to production:
# ✅ Set all REQUIRED variables above
# ✅ Generate new AUTH_SECRET (don't reuse dev secret!)
# ✅ Update NEXTAUTH_URL to production domain
# ✅ Configure OAuth redirect URIs in provider dashboards
# ✅ Test authentication flow end-to-end
# ✅ Verify backend API is accessible from production
```

### 2. Generate a secure AUTH_SECRET

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Online Generator:**
Visit https://generate-secret.vercel.app/32

### 3. Configure your backend URL

Set `NEXT_PUBLIC_BACKEND_URL` to your backend API URL:
- **Development**: `http://localhost:3000` (or whatever port your backend runs on)
- **Production**: Your actual backend URL (e.g., `https://api.yourdomain.com`)

### 4. (Optional) Configure OAuth providers

If you want Google/Facebook login:

**Google OAuth:**
1. Go to https://console.cloud.google.com/
2. Create a project and enable OAuth
3. Add redirect URI: `http://localhost:3001/api/auth/callback/google` (dev) or your production URL
4. Copy Client ID and Secret to `.env.local`

**Facebook OAuth:**
1. Go to https://developers.facebook.com/
2. Create an app and enable Facebook Login
3. Add redirect URI: `http://localhost:3001/api/auth/callback/facebook` (dev) or your production URL
4. Copy App ID and Secret to `.env.local`

---

## What happens if I don't set these correctly?

### 🚨 The app will FAIL IMMEDIATELY on startup

This is **intentional and good**! The new environment validation system will:

1. **Check all required variables** when the app starts
2. **Throw clear error messages** if anything is missing
3. **Prevent silent failures** in production

### Example error message:

```
❌ MISSING REQUIRED ENVIRONMENT VARIABLE: NEXT_PUBLIC_BACKEND_URL

This variable is required for the application to function.
Please check .env.example for setup instructions.

To fix:
1. Copy .env.example to .env.local
2. Set NEXT_PUBLIC_BACKEND_URL to the appropriate value
3. Restart the development server
```

---

## Testing your setup

### 1. Start the development server

```bash
cd ayo
npm run dev
```

### 2. Check the console for validation messages

You should see:
```
✅ Environment variables validated successfully
   Backend: http://localhost:3000
   NextAuth URL: http://localhost:3001
   Google OAuth: ✅ or ❌
   Facebook OAuth: ✅ or ❌
```

### 3. Test authentication

1. Go to http://localhost:3001/login_register
2. Try logging in with credentials
3. If OAuth is configured, try Google/Facebook login

---

## Production Deployment

### Pre-deployment checklist:

- [ ] Set `NEXT_PUBLIC_BACKEND_URL` to production backend URL
- [ ] Generate a **NEW** `AUTH_SECRET` (don't reuse dev secret!)
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Configure OAuth redirect URIs in Google/Facebook dashboards to use production URLs
- [ ] Test all authentication flows in staging first
- [ ] Verify backend API is accessible from production

### Environment variables in hosting platforms:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Ensure they're set for Production environment

**Other platforms:**
Follow your platform's documentation for setting environment variables.

---

## Troubleshooting

### Error: "MISSING REQUIRED ENVIRONMENT VARIABLE"

**Solution:** Create `.env.local` file with all required variables from this guide.

### Error: "AUTH_SECRET TOO SHORT"

**Solution:** Generate a longer secret using the commands above (must be 32+ characters).

### Error: "INVALID URL FORMAT"

**Solution:** Check that URLs don't have typos and include the protocol (http:// or https://).

### OAuth buttons don't appear

**Solution:** This is normal if OAuth is not configured. Set the OAuth environment variables if you want to enable social login.

### Backend connection fails

**Solution:** 
1. Verify your backend is running
2. Check `NEXT_PUBLIC_BACKEND_URL` is set correctly
3. Check for CORS configuration on backend

---

## Security Best Practices

1. **Never commit `.env.local` to git** (it's already in `.gitignore`)
2. **Use different `AUTH_SECRET` for dev/staging/production**
3. **Rotate secrets regularly** in production
4. **Use HTTPS in production** for all URLs
5. **Keep OAuth secrets secure** - never expose them publicly

---

## Need help?

Check the code documentation:
- `lib/env.ts` - Environment validation logic
- `auth.config.ts` - Authentication configuration
- `lib/api.js` - API client configuration

