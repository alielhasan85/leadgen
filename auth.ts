/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import ResendProvider from 'next-auth/providers/resend';
import { cache } from 'react';

import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from 'db';

import { routing } from './i18n/routing';
import { USER_ROLES, type Role } from '@menumize/types';
// import { loadMemberships } from '@/lib/actions/userRoles/auth-memberships';
import { sendMagicLinkEmail } from '@/lib/auth/email-magic';

// ✅ Billing helpers (exported from db)
import { ensureTrialSubscriptionForUser } from 'db';

// const loadMembershipsCached = cache((userId: string) => loadMemberships(userId));
// const getLatestSubscriptionCached = cache((userId: string) => getLatestSubscription(userId));

/** Toggle: if true, only invited/employed users (or owners) can sign in */
const INVITE_ONLY = false;
const isProd = process.env.NODE_ENV === 'production';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    verifyRequest: '/check-email',
    error: '/login',
  },

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  // ✅ Hardened cookie configuration (Issue #4 - 2026-02-13)
  // __Host- prefix in production prevents subdomain attacks
  // CRITICAL: __Host- prefix REQUIRES no domain attribute (exact host match only)
  cookies: {
    sessionToken: {
      name: isProd ? '__Host-menumize.session-token' : 'menumize.session-token',
      options: {
        // ❌ REMOVED: domain cannot be set with __Host- prefix
        // domain: isProd ? '.menumize.com' : undefined,
        path: '/',
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        sameSite: 'lax', // CSRF protection + OAuth compatibility
        secure: isProd, // HTTPS-only in production
        priority: 'high', // Prevents cookie eviction under memory pressure
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    ResendProvider({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || 'Menumize <login@menumize.com>',
      maxAge: 15 * 60,
      normalizeIdentifier: (id) => id.trim().toLowerCase(),
      async sendVerificationRequest({ identifier, url, expires }) {
        await sendMagicLinkEmail({
          to: identifier,
          url,
          expiresAt: expires ?? new Date(Date.now() + 15 * 60 * 1000),
        });
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,
  trustHost: true,

  callbacks: {
    async signIn({ user }) {
      const locale = routing?.defaultLocale ?? 'en';
      const email = (user?.email || '').toLowerCase();

      // ✅ Block disabled users
      if ((user as any)?.isActive === false) {
        return `/${locale}/login?error=disabled`;
      }

      // Invite-only gate
      if (INVITE_ONLY && email) {
        const [ownerVenue, staff, invite] = await Promise.all([
          prisma.venue.findFirst({ where: { userId: user.id }, select: { id: true } }),
          prisma.venueStaff.findFirst({
            where: { userId: user.id, isActive: true },
            select: { id: true },
          }),
          prisma.userInvite.findFirst({
            where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
            select: { id: true },
          }),
        ]);

        const allowed = !!ownerVenue || !!staff || !!invite;
        if (!allowed) return `/${locale}/login?error=not_invited`;
      }

      // Owner onboarding vs staff/invite pass-through
      if ((user as any)?.profileComplete === false) {
        const [staff, liveInvite] = await Promise.all([
          prisma.venueStaff.findFirst({
            where: { userId: user.id, isActive: true },
            select: { id: true },
          }),
          email
            ? prisma.userInvite.findFirst({
                where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
                select: { id: true },
              })
            : null,
        ]);

        if (!staff && !liveInvite) {
          return `/${locale}/signup/profile`;
        }
      }

      return true;
    },

    async session({ session, user }) {
      if (!session?.user || !user) return session;

      session.user.id = user.id;

      const roleRaw = (user as any).role as string | undefined;
      const isValidRole = !!roleRaw && USER_ROLES.some((r) => r.value === roleRaw);
      session.user.role = (isValidRole ? roleRaw : 'USER') as Role;

      session.user.profileComplete = (user as any).profileComplete ?? false;
      session.user.isActive = (user as any).isActive !== false;

      // ❌ Remove these from session():
      // const [memberships, sub] = await Promise.all([...])
      // (session as any).memberships = memberships;
      // (session as any).billing = ...

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      if (user?.id) await ensureTrialSubscriptionForUser(user.id);
    },

    async signIn({ user }) {
      if (user?.id) {
        // ✅ safety net for old accounts
        await ensureTrialSubscriptionForUser(user.id);

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date(), loginCount: { increment: 1 } },
        });

        await prisma.user.updateMany({
          where: { id: user.id, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
};

export const { handlers, signIn, signOut, auth: uncachedAuth } = NextAuth(authConfig);

/**
 * Cached version of auth() for per-request deduplication.
 * Use this in server actions/components to avoid multiple DB queries per request.
 *
 * Why: Database session strategy hits DB on every auth() call.
 * With polling + user navigation, you get 10-20+ concurrent session queries.
 * React cache() ensures each request cycle only queries once.
 */
export const auth = cache(uncachedAuth);
