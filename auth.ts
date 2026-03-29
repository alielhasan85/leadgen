import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { cache } from 'react'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { ensureTrialSubscriptionForUser } from '@/lib/auth/subscription'

const isProd = process.env.NODE_ENV === 'production'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    verifyRequest: '/check-email',
    error: '/login',
  },

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,   // 30 days
    updateAge: 24 * 60 * 60,      // refresh session DB row every 24h
  },

  cookies: {
    sessionToken: {
      name: isProd ? '__Host-leadgen.session-token' : 'leadgen.session-token',
      options: {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        priority: 'high',
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || 'LeadGen GCC <noreply@leadgengcc.com>',
      maxAge: 15 * 60,
      normalizeIdentifier: (id) => id.trim().toLowerCase(),
    }),
  ],

  secret: process.env.AUTH_SECRET,
  trustHost: true,

  callbacks: {
    async signIn({ user }) {
      // Block disabled accounts
      if ((user as Record<string, unknown>)?.isActive === false) {
        return '/login?error=disabled'
      }
      return true
    },

    async session({ session, user }) {
      if (!session?.user || !user) return session

      session.user.id = user.id
      session.user.onboarded = (user as Record<string, unknown>).onboarded as boolean ?? false
      session.user.isActive = (user as Record<string, unknown>).isActive !== false

      return session
    },
  },

  events: {
    async createUser({ user }) {
      if (user?.id) await ensureTrialSubscriptionForUser(user.id)
    },

    async signIn({ user }) {
      if (!user?.id) return

      // Safety net: create trial if somehow missed on createUser
      await ensureTrialSubscriptionForUser(user.id)

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })
    },
  },
}

export const { handlers, signIn, signOut, auth: uncachedAuth } = NextAuth(authConfig)

/**
 * Cached auth() for per-request deduplication.
 * Database sessions hit the DB on every auth() call — React cache()
 * ensures each request only queries once per request cycle.
 */
export const auth = cache(uncachedAuth)
