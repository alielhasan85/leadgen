'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateICPAction } from '../_actions/generate-icp'
import { createCampaignAction, saveICPTemplateAction } from '../_actions/create-campaign'
import type { ICPGeneratorResult } from '@/lib/types/icp'

// ---- Constants ----

const SECTORS = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'cafe', label: 'Cafes & Coffee Shops' },
  { value: 'salon', label: 'Salons & Barbershops' },
  { value: 'spa', label: 'Spas & Wellness' },
  { value: 'gym', label: 'Gyms & Fitness' },
  { value: 'hotel', label: 'Hotels & Hospitality' },
  { value: 'retail', label: 'Retail Shops' },
  { value: 'office', label: 'Offices & Co-working' },
  { value: 'pharmacy', label: 'Pharmacies' },
  { value: 'clinic', label: 'Clinics & Medical' },
  { value: 'other', label: 'Other' },
]

const CITIES = ['Doha', 'Dubai', 'Abu Dhabi', 'Riyadh', 'Jeddah', 'Kuwait City', 'Manama', 'Muscat']

const AREAS_BY_CITY: Record<string, string[]> = {
  Doha: ['Al Sadd', 'West Bay', 'The Pearl', 'Lusail', 'Al Wakra', 'Al Rayyan', 'Msheireb', 'Al Dafna', 'Ain Khaled', 'Al Gharafa'],
  Dubai: ['Downtown', 'Business Bay', 'JBR', 'Marina', 'Deira', 'Bur Dubai', 'DIFC', 'Al Quoz', 'JLT', 'Palm Jumeirah'],
  'Abu Dhabi': ['Corniche', 'Al Reem Island', 'Yas Island', 'Saadiyat Island', 'Khalidiyah', 'Al Mushrif'],
  Riyadh: ['Olaya', 'Al Malaz', 'Al Nakheel', 'King Abdullah Road', 'Diplomatic Quarter'],
  Jeddah: ['Al Balad', 'Al Zahraa', 'Al Rawdah', 'Corniche', 'Al Hamra'],
  'Kuwait City': ['Salmiya', 'Hawalli', 'Jabriya', 'Mishref', 'Rumaithiya'],
  Manama: ['Adliya', 'Seef', 'Juffair', 'Diplomatic Area'],
  Muscat: ['Qurum', 'Ruwi', 'Muttrah', 'Madinat Sultan Qaboos'],
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'both', label: 'Both' },
]

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
]

const SIGNAL_LABELS: Record<string, string> = {
  hasDigitalMenu: 'Already has a digital menu',
  hasQrCode: 'Already has a QR code',
  hasOnlineOrdering: 'Already has online ordering (Talabat etc.)',
  hasWebsite: 'Has a website',
  hasInstagram: 'Has Instagram',
  instagramIsActive: 'Instagram is active (posted < 30 days)',
}

// ---- Step indicator ----

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors
              ${i + 1 === current ? 'bg-zinc-900 text-white' : i + 1 < current ? 'bg-zinc-300 text-zinc-600' : 'border border-zinc-200 text-zinc-400'}`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && <div className={`h-px flex-1 ${i + 1 < current ? 'bg-zinc-300' : 'bg-zinc-100'}`} />}
        </React.Fragment>
      ))}
    </div>
  )
}

// ---- ICP display helpers ----

function ICPCriteriaDisplay({ criteria, promptSummary }: { criteria: ICPCriteria; promptSummary: string }) {
  const [showPrompt, setShowPrompt] = React.useState(false)

  return (
    <div className="space-y-4">
      {/* What Claude was told */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <button
          type="button"
          onClick={() => setShowPrompt((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-700"
        >
          <span>How we generated this ICP</span>
          <span>{showPrompt ? '▲ Hide' : '▼ Show inputs'}</span>
        </button>
        {showPrompt && (
          <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-600 font-mono leading-relaxed">
            {promptSummary}
          </pre>
        )}
      </div>

      {/* Target description */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">Ideal target</p>
        <p className="mt-1 text-sm text-blue-800">{criteria.targetDescription}</p>
      </div>

      {/* Numeric thresholds */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Min price level', value: '$'.repeat(criteria.minPriceLevel) + ' and above' },
          { label: 'Min reviews', value: `${criteria.minReviewCount}+ reviews` },
          { label: 'Min Google rating', value: `${criteria.minRating}★ or above` },
          { label: 'Min business age', value: `${criteria.minBusinessAgeMonths}+ months open` },
          { label: 'Instagram followers', value: `${criteria.instagramFollowersMin.toLocaleString()} – ${criteria.instagramFollowersMax.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-zinc-200 bg-white p-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Hard exclusions */}
      {criteria.mustNotHaveSignals.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700 mb-2">Hard exclusions — score = 0 if any match</p>
          <ul className="space-y-1">
            {criteria.mustNotHaveSignals.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-red-800">
                <span className="text-red-400">✕</span>
                {SIGNAL_LABELS[s] ?? s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required signals */}
      {criteria.mustHaveSignals.length > 0 && (
        <div className="rounded-lg border border-green-100 bg-green-50 p-3">
          <p className="text-xs font-semibold text-green-700 mb-2">Required signals — must have all</p>
          <ul className="space-y-1">
            {criteria.mustHaveSignals.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-green-800">
                <span className="text-green-500">✓</span>
                {SIGNAL_LABELS[s] ?? s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scoring weights */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <p className="text-xs font-semibold text-zinc-500 mb-2">Scoring weights (total ≈ 100 pts)</p>
        <div className="space-y-1.5">
          {Object.entries(criteria.scoringWeights)
            .sort(([, a], [, b]) => b - a)
            .map(([key, pts]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${Math.min(pts, 50) * 2}%` }} />
                <span className="text-xs text-zinc-600 min-w-0">{key}</span>
                <span className="ml-auto text-xs font-mono text-zinc-500">{pts} pts</span>
              </div>
            ))}
        </div>
      </div>

      {/* AI rationale */}
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
        <p className="text-xs font-semibold text-amber-700 mb-1">Why Claude chose these criteria</p>
        <p className="text-sm text-amber-900 leading-relaxed">{criteria.aiRationale}</p>
      </div>
    </div>
  )
}

// ---- Main wizard ----

export default function CampaignWizard() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)

  // Step 1 fields
  const [name, setName] = React.useState('')
  const [language, setLanguage] = React.useState<'en' | 'ar' | 'both'>('en')
  const [tone, setTone] = React.useState<'professional' | 'friendly' | 'formal'>('professional')

  // Step 2 fields
  const [businessType, setBusinessType] = React.useState('')

  // Step 3 fields
  const [city, setCity] = React.useState('')
  const [area, setArea] = React.useState('')

  // Step 4 — ICP
  const [icpResult, setIcpResult] = React.useState<ICPGeneratorResult | null>(null)
  const [icpGenerating, setIcpGenerating] = React.useState(false)
  const [icpError, setIcpError] = React.useState<string | null>(null)

  // Save template
  const [saveTemplateName, setSaveTemplateName] = React.useState('')
  const [savingTemplate, setSavingTemplate] = React.useState(false)
  const [templateSaved, setTemplateSaved] = React.useState(false)
  const [savedTemplateId, setSavedTemplateId] = React.useState<string | undefined>()

  // Final submit
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // ---- Step navigation ----

  function canAdvance() {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return businessType.length > 0
    if (step === 3) return city.length > 0
    return false
  }

  async function handleStepNext() {
    if (step === 3) {
      // Moving to step 4 — generate ICP
      setStep(4)
      setIcpResult(null)
      setIcpError(null)
      setIcpGenerating(true)
      const res = await generateICPAction(businessType)
      setIcpGenerating(false)
      if (res.error) { setIcpError(res.error); return }
      setIcpResult(res.result!)
    } else {
      setStep((s) => s + 1)
    }
  }

  async function handleSaveTemplate() {
    if (!icpResult || !saveTemplateName.trim()) return
    setSavingTemplate(true)
    const res = await saveICPTemplateAction({
      name: saveTemplateName,
      targetSector: businessType,
      criteria: icpResult.criteria,
      aiRationale: icpResult.criteria.aiRationale,
    })
    setSavingTemplate(false)
    if (res.templateId) {
      setTemplateSaved(true)
      setSavedTemplateId(res.templateId)
    }
  }

  async function handleConfirm() {
    if (!icpResult) return
    setSubmitting(true)
    setSubmitError(null)
    const res = await createCampaignAction({
      name,
      businessType,
      city,
      area: area || undefined,
      language,
      tone,
      icpCriteria: icpResult.criteria,
      icpTemplateId: savedTemplateId,
    })
    setSubmitting(false)
    if (res.error) { setSubmitError(res.error); return }
    router.push('/campaigns')
  }

  // ---- Render ----

  return (
    <div className="max-w-2xl">
      <StepIndicator current={step} total={4} />

      {/* STEP 1 — Name + language + tone */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Name your campaign</CardTitle>
            <CardDescription>
              Give this search run a name so you can track it later. Set the language and tone for emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Campaign name</Label>
              <Input
                id="name"
                placeholder="Doha Restaurants — West Bay — March 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="language">Email language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tone">Email tone</Label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 — Target sector */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Who are you targeting?</CardTitle>
            <CardDescription>
              Choose the type of business you want to find leads for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setBusinessType(s.value)}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium text-left transition-colors
                    ${businessType === s.value
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3 — Location */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Where are you searching?</CardTitle>
            <CardDescription>
              Choose a city and optionally narrow down to a specific area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>City</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCity(c); setArea('') }}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                      ${city === c
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {city && AREAS_BY_CITY[city] && (
              <div className="grid gap-1.5">
                <Label>Area <span className="text-zinc-400 font-normal">(optional)</span></Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AREAS_BY_CITY[city].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setArea(area === a ? '' : a)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                        ${area === a
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 4 — ICP Builder */}
      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Ideal Customer Profile</CardTitle>
              <CardDescription>
                AI generated this based on your business profile and materials. Read it, then confirm or go back to adjust.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {icpGenerating && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-zinc-100 rounded w-3/4" />
                  <div className="h-4 bg-zinc-100 rounded w-1/2" />
                  <div className="h-20 bg-zinc-100 rounded" />
                  <p className="text-sm text-zinc-500 text-center pt-2">Analysing your profile and materials…</p>
                </div>
              )}

              {icpError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-700 font-medium">Failed to generate ICP</p>
                  <p className="text-sm text-red-600 mt-1">{icpError}</p>
                </div>
              )}

              {icpResult && (
                <ICPCriteriaDisplay
                  criteria={icpResult.criteria}
                  promptSummary={icpResult.promptSummary}
                />
              )}
            </CardContent>
          </Card>

          {/* Save as template */}
          {icpResult && !templateSaved && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-zinc-700 mb-2">Save as reusable template</p>
                <div className="flex gap-2">
                  <Input
                    placeholder='e.g. "Restaurants — No Digital Menu"'
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!saveTemplateName.trim() || savingTemplate}
                    onClick={handleSaveTemplate}
                  >
                    {savingTemplate ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {templateSaved && (
            <p className="text-sm text-green-600 font-medium">✓ Template saved — reuse it in future campaigns</p>
          )}

          {submitError && (
            <p className="text-sm text-red-600 font-medium">{submitError}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => step > 1 ? setStep((s) => s - 1) : router.push('/campaigns')}
        >
          {step === 1 ? 'Cancel' : '← Back'}
        </Button>

        {step < 4 && (
          <Button
            type="button"
            disabled={!canAdvance()}
            onClick={handleStepNext}
          >
            {step === 3 ? 'Generate ICP →' : 'Next →'}
          </Button>
        )}

        {step === 4 && icpResult && (
          <Button
            type="button"
            disabled={submitting || icpGenerating}
            onClick={handleConfirm}
          >
            {submitting ? 'Creating…' : 'Confirm & Create Campaign'}
          </Button>
        )}

        {step === 4 && icpError && (
          <Button type="button" onClick={handleStepNext}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
