'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { extractText, MAX_FILE_SIZE, ALLOWED_TYPES } from '@/lib/file-parser'

export async function uploadMaterialsAction(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id
  const files = formData.getAll('files') as File[]
  const validFiles = files.filter((f) => f && f.size > 0)

  if (validFiles.length === 0) {
    await prisma.user.update({ where: { id: userId }, data: { onboarded: true } })
    redirect('/dashboard')
  }

  const errors: string[] = []

  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) { errors.push(`${file.name} exceeds 10 MB limit`); continue }
    if (!ALLOWED_TYPES.includes(file.type)) { errors.push(`${file.name} is not a supported type (PDF, DOCX, TXT)`); continue }

    try {
      const { text, fileType } = await extractText(file)
      await prisma.material.create({
        data: { userId, filename: file.name, originalName: file.name, fileType, contentExtracted: text, fileSizeBytes: file.size, isProcessed: true },
      })
    } catch {
      errors.push(`Failed to parse ${file.name}`)
    }
  }

  if (errors.length > 0 && validFiles.length === errors.length) {
    return { error: errors.join('. ') }
  }

  await prisma.user.update({ where: { id: userId }, data: { onboarded: true } })
  redirect('/dashboard')
}

export async function skipMaterialsAction(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  })

  redirect('/dashboard')
}
