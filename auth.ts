import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/connexion",
    },

    providers: [
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
        async jwt({ token, user }) {
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