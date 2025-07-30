import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"];
  }
  
  interface User {
    role?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email_verified?: string | null;
    accessToken?: string | null;
    username?: string | null;
  }
} 