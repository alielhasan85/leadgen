"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { searchAndEnrichPlaces } from "@/lib/services/google-maps"

// ---- types ----

export interface BusinessResult {
  id: string
  name: string
  address: string | null
  area: string | null
  city: string
  sector: string
  phone: string | null
  website: string | null
  googleRating: number | null
  googleReviewCount: number | null
  googlePriceLevel: number | null
  hasWebsite: boolean
  isNew: boolean // true = just discovered, wasn't in DB before
}

export interface DiscoverState {
  results: BusinessResult[]
  query: { keyword: string; city: string } | null
  error: string | null
}

// ---- action ----

export async function discoverBusinesses(
  _prev: DiscoverState | null,
  formData: FormData
): Promise<DiscoverState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { results: [], query: null, error: "Not authenticated" }
  }

  const keyword = (formData.get("keyword") as string)?.trim()
  const city = (formData.get("city") as string)?.trim()

  if (!keyword || !city) {
    return { results: [], query: null, error: "Sector and city are required" }
  }

  let places
  try {
    places = await searchAndEnrichPlaces(keyword, city)
  } catch (err) {
    console.error("[discover] Google Maps error:", err)
    return {
      results: [],
      query: { keyword, city },
      error: "Google Maps search failed. Check your API key and billing.",
    }
  }

  const results: BusinessResult[] = []

  for (const place of places) {
    const existing = await prisma.masterBusiness.findUnique({
      where: { googlePlaceId: place.placeId },
      select: { id: true },
    })

    const upserted = await prisma.masterBusiness.upsert({
      where: { googlePlaceId: place.placeId },
      update: {
        name: place.name,
        address: place.address,
        area: place.area,
        phone: place.phone,
        website: place.website,
        hasWebsite: !!place.website,
        googleRating: place.rating,
        googleReviewCount: place.reviewCount,
        googlePriceLevel: place.priceLevel,
        googleOpenNow: place.openNow,
        lastEnrichedAt: new Date(),
      },
      create: {
        name: place.name,
        googlePlaceId: place.placeId,
        sector: place.sector,
        address: place.address,
        area: place.area,
        city: place.city,
        country: cityToCountry(place.city),
        phone: place.phone,
        website: place.website,
        hasWebsite: !!place.website,
        googleRating: place.rating,
        googleReviewCount: place.reviewCount,
        googlePriceLevel: place.priceLevel,
        googleOpenNow: place.openNow,
        lastEnrichedAt: new Date(),
      },
    })

    results.push({
      id: upserted.id,
      name: upserted.name,
      address: upserted.address,
      area: upserted.area,
      city: upserted.city,
      sector: upserted.sector,
      phone: upserted.phone,
      website: upserted.website,
      googleRating: upserted.googleRating,
      googleReviewCount: upserted.googleReviewCount,
      googlePriceLevel: upserted.googlePriceLevel,
      hasWebsite: upserted.hasWebsite,
      isNew: !existing,
    })
  }

  return { results, query: { keyword, city }, error: null }
}

function cityToCountry(city: string): string {
  const map: Record<string, string> = {
    doha: "QA",
    dubai: "AE",
    "abu dhabi": "AE",
    sharjah: "AE",
    riyadh: "SA",
    jeddah: "SA",
    dammam: "SA",
    "kuwait city": "KW",
    manama: "BH",
    muscat: "OM",
  }
  return map[city.toLowerCase()] ?? "QA"
}
