import Credentials from "next-auth/providers/credentials";

import type { NextAuthConfig } from "next-auth";
import { InvalidLoginError } from "@/auth.errors";
export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          if (credentials?.credentialsMethod === "oauth") {
            const user = {
              accessToken: credentials.accessToken,
              userId: credentials.id,
              email: credentials.email,
              firstName: credentials.firstName,
              lastName: credentials.lastName,
              username: credentials.username,
              image: credentials.image,
              email_verified: credentials.email_verified,
              role: credentials.role,
            };

            return user;
          }
          return null;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
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
          const errorMessage = await res.json();
          // console.log("aldaanii messageeeee", errorMessage);
          throw new InvalidLoginError(errorMessage.message);
        }
        const data = await res.json();
        // console.log("login", data);
        if (data.data) {
          return data.data;
        } else {
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig; 