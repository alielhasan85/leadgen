import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [leadCount, campaignCount, materialCount] = await Promise.all([
    prisma.userLead.count({ where: { userId } }),
    prisma.campaign.count({ where: { userId } }),
    prisma.material.count({ where: { userId, deletedAt: null } }),
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

      {materialCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-900">No marketing materials uploaded</p>
            <p className="text-sm text-amber-700 mt-0.5">The AI needs your brochures or pitch deck to write personalized emails.</p>
          </div>
          <Link href="/settings/materials" className="shrink-0 text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700">
            Upload now
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
        <p className="text-zinc-500 text-sm">No campaigns yet.</p>
        <p className="text-zinc-400 text-sm mt-1">Create your first campaign to start finding leads.</p>
      </div>
    </div>
  )
}
