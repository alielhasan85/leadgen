import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (!session.user.onboarded) redirect('/signup/profile')

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-zinc-900">LeadGen GCC</span>
        <span className="text-sm text-zinc-500">{session.user.email}</span>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
