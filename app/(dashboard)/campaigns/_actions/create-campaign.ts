'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ICPCriteria } from '@/lib/types/icp'

// icpCriteria is passed separately — it's already validated by ICPCriteriaSchema
// in icp-generator.ts, so we don't re-validate the full JSON shape here
const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  businessType: z.string().min(1, 'Target sector is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  language: z.enum(['en', 'ar', 'both']),
  tone: z.enum(['friendly', 'professional', 'formal']),
  icpTemplateId: z.string().optional(),
})

export interface CreateCampaignInput {
  name: string
  businessType: string
  city: string
  area?: string
  language: 'en' | 'ar' | 'both'
  tone: 'friendly' | 'professional' | 'formal'
  icpCriteria: ICPCriteria
  icpTemplateId?: string
}

export interface CreateCampaignResult {
  error?: string
  campaignId?: string
}

export async function createCampaignAction(
  values: CreateCampaignInput
): Promise<CreateCampaignResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  // Validate scalar fields only — icpCriteria validated upstream
  const { icpCriteria, icpTemplateId, ...scalars } = values
  const parsed = createCampaignSchema.safeParse({ ...scalars, icpTemplateId })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  if (!icpCriteria) return { error: 'ICP criteria are required' }

  const { name, businessType, city, area, language, tone } = parsed.data

  const searchQuery = area
    ? `${businessType} in ${area}, ${city}`
    : `${businessType} in ${city}`

  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      name,
      businessType,
      city,
      area: area ?? null,
      language,
      tone,
      searchQuery,
      icpCriteria: icpCriteria as object,
      icpTemplateId: parsed.data.icpTemplateId ?? null,
      status: 'DRAFT',
    },
  })

  revalidatePath('/campaigns')
  return { campaignId: campaign.id }
}

// Save an ICP as a reusable named template
export interface SaveICPTemplateInput {
  name: string
  targetSector: string
  criteria: ICPCriteria
  aiRationale: string
}

export async function saveICPTemplateAction(
  values: SaveICPTemplateInput
): Promise<{ error?: string; templateId?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  if (!values.name?.trim()) return { error: 'Template name is required' }
  if (!values.targetSector?.trim()) return { error: 'Target sector is required' }
  if (!values.criteria) return { error: 'ICP criteria are required' }

  const template = await prisma.iCPTemplate.create({
    data: {
      userId: session.user.id,
      name: values.name,
      targetSector: values.targetSector,
      criteria: values.criteria as object,
      aiRationale: values.aiRationale,
    },
  })

  revalidatePath('/campaigns')
  return { templateId: template.id }
}
