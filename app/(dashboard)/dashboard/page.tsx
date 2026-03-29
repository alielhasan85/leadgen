import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [leadCount, campaignCount] = await Promise.all([
    prisma.userLead.count({ where: { userId } }),
    prisma.campaign.count({ where: { userId } }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Welcome back. Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Total Leads</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{leadCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Campaigns</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{campaignCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Emails Sent</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
        <p className="text-zinc-500 text-sm">No campaigns yet.</p>
        <p className="text-zinc-400 text-sm mt-1">Create your first campaign to start finding leads.</p>
      </div>
    </div>
  )
}
