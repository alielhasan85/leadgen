import { DiscoverShell } from "./_components/discover-shell"

export default function DiscoverPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Discover Leads</h1>
        <p className="text-zinc-500 mt-1">
          Search for businesses by sector and city. Results are enriched with
          Google Maps data and saved to the shared database.
        </p>
      </div>
      <DiscoverShell />
    </div>
  )
}
