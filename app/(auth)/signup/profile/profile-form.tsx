'use client'

import * as React from 'react'
import { completeOnboardingAction, type OnboardingValues } from './_actions/onboarding'
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

export default function ProfileForm({
  initialValues,
}: {
  initialValues?: Partial<OnboardingValues>
}) {
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const [values, setValues] = React.useState<OnboardingValues>({
    name: initialValues?.name ?? '',
    businessName: initialValues?.businessName ?? '',
    industry: (initialValues?.industry as OnboardingValues['industry']) ?? 'other',
    whatTheySell: initialValues?.whatTheySell ?? '',
  })

  function set(field: keyof OnboardingValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await completeOnboardingAction(values)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome to LeadGen GCC</CardTitle>
        <CardDescription className="text-center">
          Tell us about your business so we can personalize your lead generation.
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
              This is used by AI to write personalized outreach emails on your behalf.
            </p>
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving…' : 'Start Free Trial'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
