'use client'

import * as React from 'react'
import { updateProfileAction, type ProfileValues } from './_actions/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const INDUSTRIES = [
  { value: 'marketing_agency', label: 'Marketing Agency' },
  { value: 'cctv', label: 'CCTV / Security' },
  { value: 'food_supplier', label: 'Food Supplier' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'restaurant', label: 'Restaurant / F&B' },
  { value: 'other', label: 'Other' },
] as const

export default function ProfileForm({ initialValues }: { initialValues: ProfileValues }) {
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const [values, setValues] = React.useState<ProfileValues>(initialValues)

  function set(field: keyof ProfileValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateProfileAction(values)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>
          The AI uses this information when writing outreach emails on your behalf.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              placeholder="Ali Hassan"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          {/* Business name */}
          <div className="grid gap-1.5">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              placeholder="Digital Growth Agency"
              value={values.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          {/* Industry */}
          <div className="grid gap-1.5">
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={values.industry}
              onChange={(e) => set('industry', e.target.value)}
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          {/* What they sell */}
          <div className="grid gap-1.5">
            <Label htmlFor="whatTheySell">What do you sell?</Label>
            <textarea
              id="whatTheySell"
              placeholder="e.g. Social media management for restaurants in Qatar"
              value={values.whatTheySell}
              onChange={(e) => set('whatTheySell', e.target.value)}
              required
              disabled={isPending}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Used by the AI to personalize outreach emails.
            </p>
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm font-medium" role="status">
              Saved!
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
