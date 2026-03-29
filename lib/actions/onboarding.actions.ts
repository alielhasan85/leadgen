'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  industry: z.enum(['marketing_agency', 'cctv', 'food_supplier', 'saas', 'restaurant', 'other']),
  whatTheySell: z.string().min(10, 'Please describe what you sell (at least 10 characters)'),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>

export async function completeOnboardingAction(values: OnboardingValues): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const parsed = onboardingSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      businessName: parsed.data.businessName,
      industry: parsed.data.industry,
      whatTheySell: parsed.data.whatTheySell,
      // onboarded is set to true after step 3 (materials upload)
    },
  })

  redirect('/signup/materials')
}
