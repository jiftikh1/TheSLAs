import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { DEV_USERS } from "@/lib/auth-dev";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      industry?: string;
      companySize?: string;
      seniority?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    industry?: string;
    companySize?: string;
    seniority?: string;
  }
}

const isDevelopment = process.env.NODE_ENV === "development";

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

              // Find or create dev user
              const devUserTemplate = DEV_USERS.find(
                (u) => u.email === credentials.email
              );

              if (!devUserTemplate) return null;

              let user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
              });

              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email: devUserTemplate.email,
                    name: devUserTemplate.name,
                    linkedinId: `dev-${devUserTemplate.email}`,
                    role: devUserTemplate.role,
                    industry: devUserTemplate.industry,
                    companySize: devUserTemplate.companySize,
                    seniority: devUserTemplate.seniority,
                  },
                });
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name ?? undefined,
                image: user.image ?? undefined,
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
        // Extract LinkedIn profile data
        // Note: LinkedIn API fields may vary based on permissions
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
      // Include additional user data in session
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.industry = user.industry;
        session.user.companySize = user.companySize;
        session.user.seniority = user.seniority;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Extract additional data from LinkedIn profile on first sign in
      if (account?.provider === "linkedin" && profile) {
        try {
          // Update user with LinkedIn data
          // This is a simplified version - you may need to enhance based on actual LinkedIn API response
          await prisma.user.update({
            where: { id: user.id },
            data: {
              linkedinId: profile.sub as string,
              // You can add logic here to extract role, industry, etc. from LinkedIn profile
              // For MVP, we'll allow users to set these manually later
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
