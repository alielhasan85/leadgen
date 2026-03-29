'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { extractText, MAX_FILE_SIZE, ALLOWED_TYPES } from '@/lib/file-parser'

export async function uploadSettingsMaterialsAction(formData: FormData): Promise<{ error?: string; count?: number }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id
  const files = formData.getAll('files') as File[]
  const validFiles = files.filter((f) => f && f.size > 0)

  if (validFiles.length === 0) return { error: 'No files selected' }

  const errors: string[] = []
  let saved = 0

  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) { errors.push(`${file.name} exceeds 10 MB limit`); continue }
    if (!ALLOWED_TYPES.includes(file.type)) { errors.push(`${file.name} is not supported (PDF, DOCX, TXT)`); continue }

    try {
      const { text, fileType } = await extractText(file)
      await prisma.material.create({
        data: { userId, filename: file.name, originalName: file.name, fileType, contentExtracted: text, fileSizeBytes: file.size, isProcessed: true },
      })
      saved++
    } catch {
      errors.push(`Failed to parse ${file.name}`)
    }
  }

  if (saved === 0) return { error: errors.join('. ') || 'Upload failed' }
  return { count: saved, ...(errors.length > 0 ? { error: `${saved} uploaded. Failed: ${errors.join(', ')}` } : {}) }
}

export async function deleteMaterialAction(materialId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const material = await prisma.material.findUnique({ where: { id: materialId } })
  if (!material || material.userId !== session.user.id) return { error: 'Not found' }

  await prisma.material.update({ where: { id: materialId }, data: { deletedAt: new Date() } })
  return {}
}
