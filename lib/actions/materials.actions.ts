'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']

async function extractText(file: File): Promise<{ text: string; fileType: string }> {
  const buffer = Buffer.from(await file.arrayBuffer())

  if (file.type === 'application/pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const result = await pdfParse(buffer)
    return { text: result.text.trim(), fileType: 'pdf' }
  }

  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value.trim(), fileType: 'docx' }
  }

  // plain text
  return { text: buffer.toString('utf-8').trim(), fileType: 'txt' }
}

export async function uploadMaterialsAction(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id
  const files = formData.getAll('files') as File[]

  const validFiles = files.filter((f) => f && f.size > 0)

  if (validFiles.length === 0) {
    // Skip — mark onboarded and go to dashboard
    await prisma.user.update({ where: { id: userId }, data: { onboarded: true } })
    redirect('/dashboard')
  }

  const errors: string[] = []

  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name} exceeds 10 MB limit`)
      continue
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name} is not a supported file type (PDF, DOCX, TXT)`)
      continue
    }

    try {
      const { text, fileType } = await extractText(file)

      await prisma.material.create({
        data: {
          userId,
          filename: file.name,
          originalName: file.name,
          fileType,
          contentExtracted: text,
          fileSizeBytes: file.size,
          isProcessed: true,
        },
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
