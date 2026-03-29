import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AppSidebar from '@/components/layout/app-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (!session.user.onboarded) redirect('/signup/profile')

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <AppSidebar user={user} />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
