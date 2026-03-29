export default function SettingsProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Business Profile</h1>
        <p className="text-zinc-500 mt-1">
          Update your business name, industry, and what you sell. The AI uses this when writing emails.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-zinc-500">Coming soon</p>
        <p className="text-xs text-zinc-400 mt-1">Edit name · industry · what you sell · email address</p>
      </div>
    </div>
  )
}
