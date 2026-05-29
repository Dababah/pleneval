import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.username = (user as any).username;
      }

      // Handle session update on the client
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
        if (session.username) token.username = session.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).username = token.username;
        if (token.name) session.user.name = token.name;

        // SUNTIKKAN 'as string' DI SINI UNTUK MENJINAKKAN TYPESCRIPT
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
  trustHost: true,
  ...authConfig,
});