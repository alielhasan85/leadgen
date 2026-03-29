export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Contacts</h1>
        <p className="text-zinc-500 mt-1">
          Import your existing CRM contacts to prevent duplicate outreach and build your ideal customer profile.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-zinc-500">Coming in Phase 3</p>
        <p className="text-xs text-zinc-400 mt-1">CSV upload · duplicate detection · existing customer suppression</p>
      </div>
    </div>
  )
}
