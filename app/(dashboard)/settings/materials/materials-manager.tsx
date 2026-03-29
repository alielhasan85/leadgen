'use client'

import * as React from 'react'
import { uploadSettingsMaterialsAction, deleteMaterialAction } from './_actions/materials'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Material = {
  id: string
  originalName: string
  fileType: string
  fileSizeBytes: number | null
  createdAt: Date
}

const ACCEPT = '.pdf,.docx,.txt'
const MAX_MB = 10

function formatBytes(bytes: number | null) {
  if (!bytes) return '—'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MaterialsManager({ initialMaterials }: { initialMaterials: Material[] }) {
  const [materials, setMaterials] = React.useState<Material[]>(initialMaterials)
  const [files, setFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const next = Array.from(incoming).filter((f) => !files.some((e) => e.name === f.name))
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

  function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (files.length === 0) return

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    startTransition(async () => {
      const result = await uploadSettingsMaterialsAction(formData)
      if (result.error && !result.count) {
        setError(result.error)
      } else {
        setSuccess(`${result.count} file${result.count !== 1 ? 's' : ''} uploaded successfully`)
        setFiles([])
        // Refresh the page to get updated list
        window.location.reload()
      }
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteMaterialAction(id)
      if (result.error) {
        setError(result.error)
      } else {
        setMaterials((prev) => prev.filter((m) => m.id !== id))
      }
      setDeletingId(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Existing materials */}
      <Card>
        <CardHeader>
          <CardTitle>Your materials</CardTitle>
          <CardDescription>
            The AI uses these to understand what you sell and write personalized emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-sm text-zinc-500">No materials uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {materials.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-medium uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded w-10 text-center shrink-0">
                      {m.fileType}
                    </span>
                    <span className="text-sm truncate font-medium">{m.originalName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatBytes(m.fileSizeBytes)}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(m.createdAt)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    disabled={isPending && deletingId === m.id}
                    onClick={() => handleDelete(m.id)}
                  >
                    {deletingId === m.id ? '…' : 'Remove'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upload new */}
      <Card>
        <CardHeader>
          <CardTitle>Upload new materials</CardTitle>
          <CardDescription>PDF, Word (.docx), or plain text — up to {MAX_MB} MB each.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">Click to upload</span> or drag and drop
              </p>
            </div>

            <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />

            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.name} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium uppercase text-muted-foreground w-8">{f.name.split('.').pop()}</span>
                      <span className="text-sm truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <button type="button" onClick={() => removeFile(f.name)} className="ml-2 text-muted-foreground hover:text-destructive shrink-0">✕</button>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="text-destructive text-sm font-medium" role="alert">{error}</p>}
            {success && <p className="text-green-600 text-sm font-medium" role="status">{success}</p>}

            <Button type="submit" disabled={isPending || files.length === 0} className="w-full">
              {isPending ? 'Uploading…' : `Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
