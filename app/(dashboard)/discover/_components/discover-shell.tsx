"use client"

import { useActionState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { IconSearch } from "@tabler/icons-react"
import { discoverBusinesses, type DiscoverState } from "../_actions/search"
import { ResultCard } from "./result-card"
import { useState } from "react"

const GCC_CITIES = [
  { value: "Doha", label: "Doha, Qatar" },
  { value: "Dubai", label: "Dubai, UAE" },
  { value: "Abu Dhabi", label: "Abu Dhabi, UAE" },
  { value: "Riyadh", label: "Riyadh, Saudi Arabia" },
  { value: "Jeddah", label: "Jeddah, Saudi Arabia" },
  { value: "Kuwait City", label: "Kuwait City, Kuwait" },
  { value: "Manama", label: "Manama, Bahrain" },
  { value: "Muscat", label: "Muscat, Oman" },
]

const SECTORS = [
  { value: "restaurants", label: "Restaurants" },
  { value: "cafes", label: "Cafes & Coffee Shops" },
  { value: "hotels", label: "Hotels" },
  { value: "beauty salons", label: "Beauty Salons" },
  { value: "gyms", label: "Gyms & Fitness" },
  { value: "retail stores", label: "Retail Stores" },
  { value: "real estate agencies", label: "Real Estate Agencies" },
  { value: "marketing agencies", label: "Marketing Agencies" },
  { value: "CCTV security companies", label: "CCTV & Security" },
  { value: "food suppliers", label: "Food Suppliers" },
  { value: "pharmacies", label: "Pharmacies" },
  { value: "spas", label: "Spas & Wellness" },
]

const initial: DiscoverState = { results: [], query: null, error: null }

export function DiscoverShell() {
  const [keyword, setKeyword] = useState("")
  const [city, setCity] = useState("Doha")
  const [state, setstate] = useState<DiscoverState>(initial)
  const [isPending, startTransition] = useTransition()

  function handleSearch() {
    if (!keyword || !city) return
    const fd = new FormData()
    fd.set("keyword", keyword)
    fd.set("city", city)
    startTransition(async () => {
      const result = await discoverBusinesses(null, fd)
      setstate(result)
    })
  }

  const hasSearched = state.query !== null
  const hasResults = state.results.length > 0

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select value={keyword} onValueChange={setKeyword}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select a sector to search..." />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GCC_CITIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isPending || !keyword}
          className="gap-2 shrink-0"
        >
          <IconSearch size={15} />
          {isPending ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Error */}
      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      {/* Loading skeletons */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {/* Results */}
      {!isPending && hasResults && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            {state.results.length} businesses found for{" "}
            <span className="font-medium text-zinc-600">
              {state.query?.keyword}
            </span>{" "}
            in{" "}
            <span className="font-medium text-zinc-600">{state.query?.city}</span>
            {" "}—{" "}
            {state.results.filter((r) => r.isNew).length} new to database
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.results.map((business) => (
              <ResultCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}

      {/* Zero results */}
      {!isPending && hasSearched && !hasResults && !state.error && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-zinc-500">No businesses found</p>
          <p className="text-xs text-zinc-400 mt-1">
            Try a different sector or city
          </p>
        </div>
      )}

      {/* Initial empty state */}
      {!isPending && !hasSearched && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-zinc-500">
            Select a sector and city to start discovering leads
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Results are enriched with Google Maps data and saved to the database
          </p>
        </div>
      )}
    </div>
  )
}
