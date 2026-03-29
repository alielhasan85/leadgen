'use client'

import * as React from 'react'
import { uploadMaterialsAction, skipMaterialsAction } from './_actions/materials'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ACCEPT = '.pdf,.docx,.txt'
const MAX_MB = 10

export default function UploadForm() {
  const [files, setFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const inputRef = React.useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const next = Array.from(incoming).filter(
      (f) => !files.some((existing) => existing.name === f.name),
    )
    setFiles((prev) => [...prev, ...next])
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    startTransition(async () => {
      const result = await uploadMaterialsAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await skipMaterialsAction()
    })
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Step 3 of 3</span>
        </div>
        <CardTitle className="text-2xl">Upload your marketing materials</CardTitle>
        <CardDescription>
          The AI reads these to understand what you sell and writes personalized emails on your behalf.
          PDF, Word (.docx), or plain text — up to {MAX_MB} MB each.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT — max {MAX_MB} MB</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {/* File list */}
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.name} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium uppercase text-muted-foreground w-8">
                      {f.name.split('.').pop()}
                    </span>
                    <span className="text-sm truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(f.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(f.name)}
                    className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="text-destructive text-sm font-medium" role="alert">{error}</p>
          )}

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Uploading…' : files.length > 0 ? `Upload ${files.length} file${files.length > 1 ? 's' : ''} & Continue` : 'Continue'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              disabled={isPending}
              onClick={handleSkip}
            >
              Skip for now — I&apos;ll upload later
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
