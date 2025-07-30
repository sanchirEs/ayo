import NextAuth from "next-auth";
import authConfig from "@/auth.config";
export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.image = user.image;
        token.username = user.username;
        token.email_verified = user.email_verified;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        // token.user.picture = user.picture;
        // token.user.username = user.username;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.username = token.username as string;
        session.user.email_verified = token.email_verified as string;
        session.user.image = token.image as string;
        session.user.accessToken = token.accessToken as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
}); 