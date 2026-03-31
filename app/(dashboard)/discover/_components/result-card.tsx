"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { BusinessResult } from "../_actions/search"
import {
  IconStar,
  IconPhone,
  IconWorld,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react"

const PRICE_LEVELS = ["", "$", "$$", "$$$", "$$$$"]

const SECTOR_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  hotel: "Hotel",
  salon: "Salon",
  spa: "Spa",
  gym: "Gym",
  retail: "Retail",
  real_estate: "Real Estate",
  automotive: "Automotive",
  pharmacy: "Pharmacy",
  supermarket: "Supermarket",
  bar: "Bar",
  nightclub: "Nightclub",
  travel: "Travel",
  business: "Business",
}

interface ResultCardProps {
  business: BusinessResult
}

export function ResultCard({ business }: ResultCardProps) {
  return (
    <Card className="bg-white border-zinc-200 hover:border-zinc-300 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-zinc-900 text-sm leading-tight">
                {business.name}
              </h3>
              {business.isNew && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50"
                >
                  <IconSparkles size={10} className="mr-1" />
                  New
                </Badge>
              )}
            </div>
            {(business.area || business.city) && (
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <IconMapPin size={11} />
                {[business.area, business.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <Badge variant="secondary" className="text-xs shrink-0 capitalize">
            {SECTOR_LABELS[business.sector] ?? business.sector}
          </Badge>
        </div>

        {/* Signals row */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-zinc-500">
          {business.googleRating != null && (
            <span className="flex items-center gap-1">
              <IconStar size={12} className="text-amber-400 fill-amber-400" />
              <span className="font-medium text-zinc-700">{business.googleRating}</span>
              {business.googleReviewCount != null && (
                <span className="text-zinc-400">
                  ({business.googleReviewCount.toLocaleString()})
                </span>
              )}
            </span>
          )}
          {business.googlePriceLevel != null && business.googlePriceLevel > 0 && (
            <span className="text-zinc-500">
              {PRICE_LEVELS[business.googlePriceLevel]}
            </span>
          )}
          {business.hasWebsite && (
            <span className="flex items-center gap-1 text-blue-500">
              <IconWorld size={12} />
              Has website
            </span>
          )}
          {!business.hasWebsite && (
            <span className="flex items-center gap-1 text-zinc-400">
              <IconWorld size={12} />
              No website
            </span>
          )}
        </div>

        {/* Contact row */}
        {(business.phone || business.website) && (
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <IconPhone size={12} />
                {business.phone}
              </a>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors truncate max-w-[200px]"
              >
                <IconWorld size={12} />
                {business.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
