import { prisma } from '@/lib/prisma'

/**
 * Creates a 7-day free trial subscription for new users.
 * Safe to call multiple times — no-ops if subscription already exists.
 */
export async function ensureTrialSubscriptionForUser(userId: string): Promise<void> {
  const existing = await prisma.subscription.findFirst({
    where: { userId },
    select: { id: true },
  })
  if (existing) return

  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 7)

  await prisma.subscription.create({
    data: {
      userId,
      tier: 'FREE',
      status: 'TRIALING',
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      trialEndsAt: trialEnd,
    },
  })
}
