export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Campaigns</h1>
        <p className="text-zinc-500 mt-1">
          Organise your searches into named campaigns. Each campaign defines a sector, city, language, and tone.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-zinc-500">Coming in Phase 4</p>
        <p className="text-xs text-zinc-400 mt-1">Create campaign · track status · per-campaign metrics · follow-up settings</p>
      </div>
    </div>
  )
}
