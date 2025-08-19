import NextAuth, { type DefaultSession } from "next-auth";

export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN" | "SUPERADMIN";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"];
  }
  interface User {
    userId: number;
    role: UserRole;
    firstName: string;
    lastName: string;
    email_verified: boolean;
    accessToken: string;
    username: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: number;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    accessToken: string;
    username: string;
  }
}
