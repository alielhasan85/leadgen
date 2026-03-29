// Shared file parsing utility — used by onboarding and settings materials upload

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export async function extractText(file: File): Promise<{ text: string; fileType: string }> {
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

  return { text: buffer.toString('utf-8').trim(), fileType: 'txt' }
}
