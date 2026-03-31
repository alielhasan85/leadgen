import CampaignWizard from './campaign-wizard'

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">New Campaign</h1>
        <p className="text-zinc-500 mt-1">
          Define who you're targeting — AI will generate your Ideal Customer Profile.
        </p>
      </div>
      <CampaignWizard />
    </div>
  )
}
