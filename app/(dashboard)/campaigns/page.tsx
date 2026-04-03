import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'

export default async function CampaignsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      businessType: true,
      city: true,
      area: true,
      status: true,
      leadsFound: true,
      leadsScored: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Campaigns</h1>
          <p className="text-zinc-500 mt-1">
            Each campaign is a search run with its own ICP, sector, and location.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">+ New Campaign</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-zinc-500">No campaigns yet</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">
            Create your first campaign to start finding leads
          </p>
          <Button asChild>
            <Link href="/campaigns/new">Create Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{c.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {c.businessType} · {c.area ? `${c.area}, ` : ''}{c.city}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Leads</p>
                  <p className="text-sm font-medium text-zinc-900">{c.leadsFound}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                  ${c.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                    c.status === 'RUNNING' ? 'bg-blue-50 text-blue-700' :
                    c.status === 'DRAFT' ? 'bg-zinc-100 text-zinc-500' :
                    'bg-amber-50 text-amber-700'}`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
