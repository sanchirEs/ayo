import Credentials from "next-auth/providers/credentials";

import type { NextAuthConfig } from "next-auth";
import { InvalidLoginError } from "@/auth.errors";
import { type UserRole } from "@/types/next-auth";
export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          if (credentials?.credentialsMethod === "oauth") {
            return {
              id: String(credentials.id || ''),
              userId: Number(credentials.id || 0),
              email: String(credentials.email || ''),
              firstName: String(credentials.firstName || ''),
              lastName: String(credentials.lastName || ''),
              username: String(credentials.username || ''),
              role: String(credentials.role || 'CUSTOMER') as UserRole,
              image: String(credentials.image || ''),
              email_verified: Boolean(credentials.email_verified),
              accessToken: String(credentials.accessToken || '')
            };
          }
          return null;
        }
        const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseUrl) {
          throw new InvalidLoginError("BACKEND_URL is not configured");
        }
        const res = await fetch(
          `${baseUrl}/api/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: credentials?.identifier,
              password: credentials?.password,
            }),
          }
        );
        if (!res.ok) {
          let errorMessage = "Нэвтрэх үед алдаа гарлаа";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use status text
            errorMessage = res.statusText || errorMessage;
          }
          throw new InvalidLoginError(errorMessage);
        }
        const data = await res.json();
        if (data.data) {
          // Map backend user data to NextAuth expected format
          const user = data.data;
          return {
            id: String(user.id),
            userId: Number(user.id),
            email: String(user.email || ''),
            firstName: String(user.firstName || ''),
            lastName: String(user.lastName || ''),
            username: String(user.username || ''),
            role: String(user.role || 'CUSTOMER') as UserRole,
            image: String(user.image || ''),
            email_verified: Boolean(user.emailVerified),
            accessToken: String(user.accessToken || '')
          };
        } else {
          return null;
        }
      },
    }),
    // OAuth providers for Google and Facebook
    Credentials({
      id: "oauth",
      name: "OAuth",
      async authorize(credentials) {
        if (credentials?.credentialsMethod === "oauth") {
          return {
            id: String(credentials.id || ''),
            userId: Number(credentials.id || 0),
            email: String(credentials.email || ''),
            firstName: String(credentials.firstName || ''),
            lastName: String(credentials.lastName || ''),
            username: String(credentials.username || ''),
            role: String(credentials.role || 'CUSTOMER') as UserRole,
            image: String(credentials.image || ''),
            email_verified: Boolean(credentials.email_verified),
            accessToken: String(credentials.accessToken || '')
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;
        token.accessToken = user.accessToken as string;
        token.userId = user.userId as number;
        token.email = user.email as string;
        token.firstName = user.firstName as string;
        token.lastName = user.lastName as string;
        token.username = user.username as string;
        token.image = user.image as string;
        token.email_verified = user.email_verified as boolean;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as UserRole;
        session.user.accessToken = token.accessToken as string;
        session.user.userId = token.userId as number;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.username = token.username as string;
        session.user.image = token.image as string;
        session.user.email_verified = token.email_verified as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
