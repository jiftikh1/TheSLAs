import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { DEV_USERS } from "@/lib/auth-dev";
import { generateUniqueUsername } from "@/lib/username";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
      industry?: string;
      companySize?: string;
      seniority?: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: string;
    industry?: string;
    companySize?: string;
    seniority?: string;
  }
}

const isDevelopment = process.env.NODE_ENV === "development";

async function ensureUsername(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (user?.username) return user.username;

  const username = await generateUniqueUsername(async (candidate) => {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    return !!existing;
  });

  await prisma.user.update({ where: { id: userId }, data: { username } });
  return username;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Development-only credentials provider (bypasses LinkedIn)
    ...(isDevelopment
      ? [
          Credentials({
            id: "dev-credentials",
            name: "Development Login",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;

              const devUserTemplate = DEV_USERS.find(
                (u) => u.email === credentials.email
              );
              if (!devUserTemplate) return null;

              let user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
              });

              if (!user) {
                const username = await generateUniqueUsername(async (candidate) => {
                  const existing = await prisma.user.findUnique({ where: { username: candidate } });
                  return !!existing;
                });

                user = await prisma.user.create({
                  data: {
                    email: devUserTemplate.email,
                    name: devUserTemplate.name,
                    linkedinId: `dev-${devUserTemplate.email}`,
                    username,
                    role: devUserTemplate.role,
                    industry: devUserTemplate.industry,
                    companySize: devUserTemplate.companySize,
                    seniority: devUserTemplate.seniority,
                  },
                });
              } else if (!user.username) {
                // Backfill username for existing dev users
                await ensureUsername(user.id);
                user = await prisma.user.findUnique({ where: { id: user.id } }) ?? user;
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name ?? undefined,
                image: user.image ?? undefined,
                username: user.username ?? undefined,
                role: user.role ?? undefined,
                industry: user.industry ?? undefined,
                companySize: user.companySize ?? undefined,
                seniority: user.seniority ?? undefined,
              };
            },
          }),
        ]
      : []),
    // LinkedIn OAuth (production)
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID || "placeholder",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "placeholder",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      async profile(profile) {
        // LinkedIn OpenID gives us: sub, email, name, given_name, family_name, picture
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          linkedinId: profile.sub,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = user.username;
        session.user.role = user.role;
        session.user.industry = user.industry;
        session.user.companySize = user.companySize;
        session.user.seniority = user.seniority;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "linkedin" && profile && user.id) {
        try {
          // Assign username on first LinkedIn sign-in
          await ensureUsername(user.id);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              linkedinId: profile.sub as string,
              // Name and picture are already handled by the adapter
            },
          });
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
});
