// ============================================================
// ICP (Ideal Customer Profile) — shared types and Zod schema
// Used by: icp-generator.ts, lib/scoring.ts, campaign wizard UI
// The `criteria` field on ICPTemplate and Campaign models is typed as this
// ============================================================

import { z } from 'zod'

// Signal keys that can appear in mustNotHaveSignals / mustHaveSignals
// These match boolean fields on the MasterBusiness model
export const BUSINESS_SIGNALS = [
  'hasWebsite',
  'hasDigitalMenu',
  'hasQrCode',
  'hasOnlineOrdering',
  'hasInstagram',
  'instagramIsActive',
] as const

export type BusinessSignal = (typeof BUSINESS_SIGNALS)[number]

// Scoring weights — one entry per signal that contributes to the score
// Keys match BusinessSignal or named criteria like 'priceLevel', 'reviewCount', 'rating'
export const ScoringWeightsSchema = z.record(z.string(), z.number().min(0).max(50))

// The full ICP criteria structure — validated by Zod before saving to DB
export const ICPCriteriaSchema = z.object({
  // Plain English summary shown to user at top of ICP Builder UI
  targetDescription: z.string().min(10),

  // Numeric thresholds — businesses below these are deprioritised (soft filter)
  minPriceLevel: z.number().int().min(1).max(4),         // 1 ($) to 4 ($$$$)
  minReviewCount: z.number().int().min(0),               // proxy for business size
  minRating: z.number().min(0).max(5),                   // Google rating
  minBusinessAgeMonths: z.number().int().min(0),         // how long they've been open

  // Instagram follower range — outside this range = wrong fit
  instagramFollowersMin: z.number().int().min(0),
  instagramFollowersMax: z.number().int().min(0),

  // Hard exclusions — if ANY of these signals is true on the business,
  // score = 0 regardless of other criteria. These are deal-breakers.
  // Example: ["hasDigitalMenu"] means skip anyone who already has what you're selling
  mustNotHaveSignals: z.array(z.string()),

  // Required signals — business must have ALL of these to score above 0
  // Example: ["hasWebsite"] for subscribers who only want businesses with web presence
  mustHaveSignals: z.array(z.string()),

  // How many points each matched criterion contributes (max total = 100)
  // Claude generates these weights based on what matters most for the user's product
  scoringWeights: ScoringWeightsSchema,

  // Claude's plain English explanation of why these criteria were chosen
  // Shown in the ICP Builder UI so the user understands the reasoning before confirming
  aiRationale: z.string().min(10),
})

export type ICPCriteria = z.infer<typeof ICPCriteriaSchema>

// What the ICP generator returns — criteria + what Claude was shown (for transparency)
export interface ICPGeneratorResult {
  criteria: ICPCriteria
  // The exact prompt sent to Claude — shown in the UI as "How we generated this"
  // User can read this to understand what inputs were used
  promptSummary: string
}
