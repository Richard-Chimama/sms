import { type Session, type User as AuthUser } from "next-auth";
import { type JWT } from "next-auth/jwt";
import type { AuthOptions } from "next-auth/";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

interface User extends AuthUser {
  id: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      if (user && 'id' in user) {
        token.id = user.id;
        token.role = (user as User).role;
        token.firstName = (user as User).firstName;
        token.lastName = (user as User).lastName;
      }
      return token;
    },
    async session({ session, token, user, trigger }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          firstName: token.firstName as string | null,
          lastName: token.lastName as string | null
        } as User;
      }
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            firstName: true,
            lastName: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    })
  ]
}; 