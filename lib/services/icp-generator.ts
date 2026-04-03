// ============================================================
// ICP Generator — AI-powered Ideal Customer Profile builder
// Called during campaign creation (Step 4 of the wizard)
// Takes user's business context + target sector → returns
// structured ICP criteria that drive all scoring for the campaign
//
// Flow:
//   1. Read user's profile + materials from DB
//   2. Build prompt explaining what they sell and who they're targeting
//   3. Call Claude → parse JSON response → validate with Zod
//   4. Return result to UI — user reads + confirms before anything is saved
//
// The returned `promptSummary` is shown to the user so they can see
// exactly what inputs were used to generate their ICP
// ============================================================

import { callClaude } from './claude'
import { ICPCriteriaSchema, type ICPCriteria, type ICPGeneratorResult } from '@/lib/types/icp'

// Context passed in from the campaign creation wizard server action
export interface ICPGeneratorInput {
  // From User model
  businessName: string
  whatTheySell: string

  // Target sector chosen in Step 2 of the wizard
  targetSector: string // "restaurant" | "salon" | "office" | "retail" | ...

  // Full text extracted from all uploaded materials (joined)
  // Pass empty string if user has no materials yet
  materialsText: string
}

// ---- System prompt — tells Claude its role ----

const SYSTEM_PROMPT = `You are a B2B sales strategist specialising in GCC markets (Qatar, UAE, Saudi Arabia, Kuwait, Bahrain, Oman).

Your job is to define an Ideal Customer Profile (ICP) for a B2B business. You will be given:
- What the business sells
- Which type of business they want to target
- Their marketing materials (if available)

You must return a JSON object that defines the perfect target customer — specific, realistic, and tailored to GCC market conditions.

RULES:
- Be specific about thresholds — vague answers like "moderate followers" are useless
- Think about what signals indicate this business NEEDS what the user sells
- mustNotHaveSignals = hard deal-breakers (they already solved the problem, or they're the wrong fit)
- mustHaveSignals = only use if truly required — keep this list small
- scoringWeights must sum to approximately 100
- aiRationale must explain your reasoning in plain English — the user will read this to decide if they agree
- Return ONLY valid JSON — no markdown, no explanation outside the JSON`

// ---- Main export ----

export async function generateICP(input: ICPGeneratorInput): Promise<ICPGeneratorResult> {
  const { businessName, whatTheySell, targetSector, materialsText } = input

  const hasMaterials = materialsText.trim().length > 0
  const materialsSection = hasMaterials
    ? `\n\nMARKETING MATERIALS (excerpts):\n${materialsText.slice(0, 3000)}`
    : '\n\nNo marketing materials uploaded yet.'

  // This is the prompt the user can read — plain English summary of inputs
  const promptSummary = `Business: ${businessName}
What they sell: ${whatTheySell}
Target sector: ${targetSector}
Materials provided: ${hasMaterials ? 'Yes' : 'No'}`

  const userMessage = `BUSINESS PROFILE:
Name: ${businessName}
What they sell: ${whatTheySell}
Target sector: ${targetSector}${materialsSection}

Generate an ICP JSON for this business targeting "${targetSector}" businesses in GCC.

Return this exact JSON structure (no other text):
{
  "targetDescription": "one sentence describing the ideal target",
  "minPriceLevel": <1-4>,
  "minReviewCount": <integer>,
  "minRating": <0.0-5.0>,
  "minBusinessAgeMonths": <integer>,
  "instagramFollowersMin": <integer>,
  "instagramFollowersMax": <integer>,
  "mustNotHaveSignals": ["hasDigitalMenu" | "hasQrCode" | "hasOnlineOrdering" | "hasWebsite" | "hasInstagram" | "instagramIsActive"],
  "mustHaveSignals": [],
  "scoringWeights": {
    "noDigitalMenu": <0-50>,
    "priceLevel": <0-20>,
    "reviewCount": <0-20>,
    "rating": <0-15>,
    "businessAge": <0-15>,
    "instagramFollowers": <0-20>,
    "instagramActive": <0-15>,
    "hasWebsite": <0-10>
  },
  "aiRationale": "plain English explanation of why you chose these criteria, 3-5 sentences"
}`

  // Call Claude
  const raw = await callClaude(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 })

  // Strip markdown code fences if Claude added them despite instructions
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

  // Parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`ICP Generator: Claude returned invalid JSON.\n\nRaw response:\n${raw}`)
  }

  // Validate with Zod
  const result = ICPCriteriaSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(
      `ICP Generator: Claude returned JSON that failed validation.\n\nErrors: ${result.error.message}\n\nRaw: ${raw}`
    )
  }

  const criteria: ICPCriteria = result.data

  return { criteria, promptSummary }
}
