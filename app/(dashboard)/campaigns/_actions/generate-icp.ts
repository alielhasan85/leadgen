'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { generateICP } from '@/lib/services/icp-generator'
import type { ICPGeneratorResult } from '@/lib/types/icp'

export interface GenerateICPActionResult {
  error?: string
  result?: ICPGeneratorResult
}

// Called from Step 4 of the campaign creation wizard.
// Reads the user's profile + materials from DB, calls Claude, returns
// the generated ICP for the user to read and confirm BEFORE anything is saved.
export async function generateICPAction(targetSector: string): Promise<GenerateICPActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  if (!targetSector.trim()) return { error: 'Target sector is required' }

  // Fetch user's business profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessName: true, whatTheySell: true },
  })

  if (!user?.businessName || !user?.whatTheySell) {
    return { error: 'Complete your business profile in Settings → Business Profile before generating an ICP.' }
  }

  // Fetch all active materials and join their extracted text
  const materials = await prisma.material.findMany({
    where: { userId: session.user.id, deletedAt: null },
    select: { contentExtracted: true, originalName: true },
    orderBy: { createdAt: 'desc' },
  })

  const materialsText = materials
    .map((m) => `[${m.originalName}]\n${m.contentExtracted}`)
    .join('\n\n---\n\n')

  try {
    const result = await generateICP({
      businessName: user.businessName,
      whatTheySell: user.whatTheySell,
      targetSector,
      materialsText,
    })

    return { result }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { error: `ICP generation failed: ${message}` }
  }
}
