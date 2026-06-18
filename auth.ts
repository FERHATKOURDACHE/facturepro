import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

function getGoogleProvider() {
  const clientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return Google({
    clientId,
    clientSecret,
  });
}

async function findOrCreateOAuthUser(params: {
  email: string;
  name?: string | null;
}) {
  const email = params.email.trim().toLowerCase();

  if (!email) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (!existingUser.name && params.name) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: { name: params.name },
      });
    }

    return existingUser;
  }

  return prisma.user.create({
    data: {
      email,
      name: params.name ?? email,
      plan: "FREE",
    },
  });
}

const googleProvider = getGoogleProvider();

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/connexion",
  },

  providers: [
    ...(googleProvider ? [googleProvider] : []),

    Credentials({
      name: "Email et mot de passe",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "vous@exemple.com",
        },
        password: {
          label: "Mot de passe",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();

        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          plan: user.plan,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const email = String(user?.email ?? token.email ?? "")
          .trim()
          .toLowerCase();

        const dbUser = await findOrCreateOAuthUser({
          email,
          name: user?.name ?? token.name,
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name ?? dbUser.email;
          token.email = dbUser.email;
          token.plan = dbUser.plan;
        }

        return token;
      }

      if (user) {
        token.id = user.id;
        token.plan = user.plan;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.plan = String(token.plan ?? "FREE");
      }

      return session;
    },
  },
});
