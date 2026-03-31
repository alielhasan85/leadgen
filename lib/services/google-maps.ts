// ============================================================
// Google Places API service
// Uses legacy Places API (textsearch + details)
// Called only from server-side code (actions/API routes)
// ============================================================

const API_KEY = process.env.GOOGLE_MAPS_API_KEY!
const BASE = "https://maps.googleapis.com/maps/api/place"

// Maps Google place types → our internal sector values
const SECTOR_MAP: Record<string, string> = {
  restaurant: "restaurant",
  cafe: "cafe",
  food: "restaurant",
  meal_delivery: "restaurant",
  meal_takeaway: "restaurant",
  bar: "bar",
  night_club: "nightclub",
  lodging: "hotel",
  beauty_salon: "salon",
  hair_care: "salon",
  spa: "spa",
  gym: "gym",
  pharmacy: "pharmacy",
  supermarket: "supermarket",
  grocery_or_supermarket: "supermarket",
  clothing_store: "retail",
  shopping_mall: "retail",
  electronics_store: "retail",
  real_estate_agency: "real_estate",
  travel_agency: "travel",
  car_dealer: "automotive",
  car_repair: "automotive",
}

function deriveSector(types: string[]): string {
  for (const type of types) {
    if (SECTOR_MAP[type]) return SECTOR_MAP[type]
  }
  return "business"
}

// Extracts neighbourhood from Google's vicinity string
// e.g. "Al Sadd, Doha" → "Al Sadd"
function extractArea(vicinity: string, city: string): string | null {
  const parts = vicinity.split(",").map((p) => p.trim())
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]
    if (last.toLowerCase().includes(city.toLowerCase())) {
      return parts[parts.length - 2]
    }
  }
  return parts[0] && parts[0].toLowerCase() !== city.toLowerCase()
    ? parts[0]
    : null
}

// ---- internal types ----

interface RawTextSearchPlace {
  placeId: string
  name: string
  formattedAddress: string
  vicinity: string
  lat: number
  lng: number
  rating: number | null
  reviewCount: number | null
  priceLevel: number | null
  openNow: boolean | null
  types: string[]
}

// ---- public type ----

export interface EnrichedPlace {
  placeId: string
  name: string
  address: string
  area: string | null
  city: string
  lat: number
  lng: number
  rating: number | null
  reviewCount: number | null
  priceLevel: number | null
  openNow: boolean | null
  sector: string
  phone: string | null
  website: string | null
}

// ---- API calls ----

async function textSearch(query: string): Promise<RawTextSearchPlace[]> {
  const params = new URLSearchParams({ query, key: API_KEY })
  const res = await fetch(`${BASE}/textsearch/json?${params}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Text Search HTTP ${res.status}`)

  const data = await res.json()
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API: ${data.status} — ${data.error_message ?? ""}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results ?? []).map((r: any) => ({
    placeId: r.place_id,
    name: r.name,
    formattedAddress: r.formatted_address,
    vicinity: r.vicinity ?? r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    rating: r.rating ?? null,
    reviewCount: r.user_ratings_total ?? null,
    priceLevel: r.price_level ?? null,
    openNow: r.opening_hours?.open_now ?? null,
    types: r.types ?? [],
  }))
}

async function getPlaceDetails(
  placeId: string
): Promise<{ phone: string | null; website: string | null }> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "formatted_phone_number,website",
    key: API_KEY,
  })
  const res = await fetch(`${BASE}/details/json?${params}`, {
    cache: "no-store",
  })
  if (!res.ok) return { phone: null, website: null }
  const data = await res.json()
  return {
    phone: data.result?.formatted_phone_number ?? null,
    website: data.result?.website ?? null,
  }
}

// ---- main export ----

export async function searchAndEnrichPlaces(
  keyword: string,
  city: string
): Promise<EnrichedPlace[]> {
  const places = await textSearch(`${keyword} in ${city}`)
  if (places.length === 0) return []

  // Fetch phone + website for all results in parallel
  const details = await Promise.all(places.map((p) => getPlaceDetails(p.placeId)))

  return places.map((place, i) => ({
    placeId: place.placeId,
    name: place.name,
    address: place.formattedAddress,
    area: extractArea(place.vicinity, city),
    city,
    lat: place.lat,
    lng: place.lng,
    rating: place.rating,
    reviewCount: place.reviewCount,
    priceLevel: place.priceLevel,
    openNow: place.openNow,
    sector: deriveSector(place.types),
    phone: details[i].phone,
    website: details[i].website,
  }))
}
