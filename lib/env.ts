/**
 * Environment Variable Validation & Type Safety
 * 
 * This module validates all required environment variables at startup
 * and provides type-safe access throughout the application.
 * 
 * CRITICAL: This prevents silent failures in production by failing fast
 * with clear error messages when configuration is missing or invalid.
 */

// Type definition for validated environment config
export interface EnvConfig {
  // Backend API
  backendUrl: string;
  
  // Authentication
  authSecret: string;
  nextAuthUrl: string;
  
  // OAuth (optional - app works without OAuth)
  googleClientId?: string;
  googleClientSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  
  // Runtime
  nodeEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates a required environment variable
 * Throws error with helpful message if missing
 */
function requireEnv(key: string, envValue: string | undefined): string {
  if (!envValue || envValue.trim() === '') {
    throw new Error(
      `❌ MISSING REQUIRED ENVIRONMENT VARIABLE: ${key}\n\n` +
      `This variable is required for the application to function.\n` +
      `Please check .env.example for setup instructions.\n\n` +
      `To fix:\n` +
      `1. Copy .env.example to .env.local\n` +
      `2. Set ${key} to the appropriate value\n` +
      `3. Restart the development server\n`
    );
  }
  return envValue.trim();
}

/**
 * Validates URL format
 */
function validateUrl(key: string, url: string): string {
  try {
    const parsed = new URL(url);
    
    // Remove trailing slash for consistency
    return parsed.toString().replace(/\/$/, '');
  } catch (error) {
    throw new Error(
      `❌ INVALID URL FORMAT: ${key}="${url}"\n\n` +
      `Expected format: https://domain.com or http://localhost:3000\n` +
      `Please check your environment configuration.\n`
    );
  }
}

/**
 * Validates AUTH_SECRET meets security requirements
 */
function validateAuthSecret(secret: string): void {
  if (secret.length < 32) {
    throw new Error(
      `❌ AUTH_SECRET TOO SHORT: ${secret.length} characters (minimum 32 required)\n\n` +
      `For security, AUTH_SECRET must be at least 32 characters long.\n\n` +
      `Generate a secure secret:\n` +
      `  openssl rand -base64 32\n\n` +
      `Or use an online generator:\n` +
      `  https://generate-secret.vercel.app/32\n`
    );
  }
  
  // Check for placeholder values
  const placeholders = ['your-secret', 'change-this', 'replace-me', 'example'];
  if (placeholders.some(p => secret.toLowerCase().includes(p))) {
    throw new Error(
      `❌ AUTH_SECRET CONTAINS PLACEHOLDER TEXT\n\n` +
      `Detected placeholder value in AUTH_SECRET.\n` +
      `You must generate a unique secret for your application.\n\n` +
      `Generate a secure secret:\n` +
      `  openssl rand -base64 32\n`
    );
  }
}

/**
 * Loads and validates optional environment variable
 */
function optionalEnv(envValue: string | undefined): string | undefined {
  return envValue && envValue.trim() !== '' ? envValue.trim() : undefined;
}

/**
 * Validates and exports environment configuration
 * 
 * IMPORTANT: This runs at module load time (both server and client)
 * On CLIENT: Only validates NEXT_PUBLIC_* variables (secrets not available)
 * On SERVER: Validates all variables including secrets
 */
export function validateAndLoadEnv(): EnvConfig {
  // Determine environment
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv'];
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isClient = typeof window !== 'undefined';
  
  // In development, provide helpful warning if .env.local doesn't exist (server-side only)
  if (isDevelopment && !isClient) {
    const hasEnvFile = process.env.NEXT_PUBLIC_BACKEND_URL !== undefined;
    if (!hasEnvFile) {
      console.warn(
        '\n⚠️  WARNING: No .env.local file detected\n' +
        '   Copy .env.example to .env.local and configure your environment.\n'
      );
    }
  }
  
  // Backend URL (REQUIRED - available on both client and server)
  const backendUrl = validateUrl(
    'NEXT_PUBLIC_BACKEND_URL',
    requireEnv('NEXT_PUBLIC_BACKEND_URL', process.env.NEXT_PUBLIC_BACKEND_URL)
  );
  
  // Auth Secret (REQUIRED - SERVER ONLY)
  // On client, use placeholder (actual auth happens server-side)
  let authSecret: string;
  if (isClient) {
    // Client-side: secrets are not available (and shouldn't be!)
    authSecret = 'client-side-placeholder';
  } else {
    // Server-side: validate the actual secret
    authSecret = requireEnv(
      'AUTH_SECRET or NEXTAUTH_SECRET',
      process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    );
    validateAuthSecret(authSecret);
  }
  
  // NextAuth URL (REQUIRED for production, optional for development)
  let nextAuthUrl: string;
  if (isProduction && !isClient) {
    nextAuthUrl = validateUrl(
      'NEXTAUTH_URL',
      requireEnv('NEXTAUTH_URL', process.env.NEXTAUTH_URL)
    );
  } else {
    // In development or on client, default to localhost:3001 if not set
    nextAuthUrl = process.env.NEXTAUTH_URL 
      ? validateUrl('NEXTAUTH_URL', process.env.NEXTAUTH_URL)
      : 'http://localhost:3001';
  }
  
  // OAuth providers (OPTIONAL - app works without these)
  const googleClientId = optionalEnv(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const googleClientSecret = isClient ? undefined : optionalEnv(process.env.GOOGLE_CLIENT_SECRET);
  const facebookAppId = optionalEnv(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);
  const facebookAppSecret = isClient ? undefined : optionalEnv(process.env.FACEBOOK_APP_SECRET);
  
  // Warn if OAuth is partially configured (server-side only)
  if (!isClient && isDevelopment) {
    if ((googleClientId && !googleClientSecret) || (!googleClientId && googleClientSecret)) {
      console.warn('⚠️  Google OAuth partially configured - set both CLIENT_ID and CLIENT_SECRET');
    }
    if ((facebookAppId && !facebookAppSecret) || (!facebookAppId && facebookAppSecret)) {
      console.warn('⚠️  Facebook OAuth partially configured - set both APP_ID and APP_SECRET');
    }
  }
  
  return {
    backendUrl,
    authSecret,
    nextAuthUrl,
    googleClientId,
    googleClientSecret,
    facebookAppId,
    facebookAppSecret,
    nodeEnv,
    isDevelopment,
    isProduction,
  };
}

/**
 * Validated and typed environment configuration
 * 
 * Import this instead of accessing process.env directly:
 * 
 * ```ts
 * import { env } from '@/lib/env';
 * 
 * const response = await fetch(`${env.backendUrl}/api/v1/products`);
 * ```
 */
export const env = validateAndLoadEnv();

/**
 * Helper to get OAuth provider URLs
 */
export function getOAuthUrls() {
  return {
    google: env.googleClientId ? `${env.backendUrl}/api/v1/auth/google` : null,
    facebook: env.facebookAppId ? `${env.backendUrl}/api/v1/auth/facebook` : null,
  };
}

/**
 * Type guard for checking if OAuth is configured
 * 
 * NOTE: Frontend only needs public IDs (NEXT_PUBLIC_*) to show buttons.
 * Secrets are only needed in backend - frontend doesn't need them.
 */
export function isOAuthConfigured(provider: 'google' | 'facebook'): boolean {
  // Frontend only needs public IDs to show/hide OAuth buttons
  // Secrets are backend-only and not accessible to frontend
  if (provider === 'google') {
    return !!env.googleClientId; // Only check public ID, not secret
  }
  if (provider === 'facebook') {
    return !!env.facebookAppId; // Only check public ID, not secret
  }
  return false;
}

// Log successful validation ONCE per process (development only)
// Use global flag to prevent duplicate logs on hot module reload
if (typeof window === 'undefined' && env.isDevelopment) {
  const globalAny = global as any;
  if (!globalAny.__ENV_VALIDATED__) {
    globalAny.__ENV_VALIDATED__ = true;
    console.log('✅ Environment variables validated successfully');
    console.log(`   Backend: ${env.backendUrl}`);
    console.log(`   NextAuth URL: ${env.nextAuthUrl}`);
    
    // Only log OAuth status if actually configured (frontend only needs public IDs)
    // If not configured, it's normal - OAuth is optional
    const googleConfigured = isOAuthConfigured('google');
    const facebookConfigured = isOAuthConfigured('facebook');
    
    if (googleConfigured || facebookConfigured) {
      if (googleConfigured) {
        console.log(`   Google OAuth: ✅ (public ID configured - secret in backend)`);
      }
      if (facebookConfigured) {
        console.log(`   Facebook OAuth: ✅ (public ID configured - secret in backend)`);
      }
    }
    // If OAuth not configured, don't log anything - it's optional
  }
}

