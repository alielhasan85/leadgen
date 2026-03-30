import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import ProfileForm from './profile-form'

export default async function SettingsProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, businessName: true, industry: true, whatTheySell: true },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Business Profile</h1>
        <p className="text-zinc-500 mt-1">
          Update your business name, industry, and what you sell. The AI uses this when writing emails.
        </p>
      </div>
      <ProfileForm
        initialValues={{
          name: user?.name ?? '',
          businessName: user?.businessName ?? '',
          industry: (user?.industry as 'marketing_agency' | 'cctv' | 'food_supplier' | 'saas' | 'restaurant' | 'other') ?? 'other',
          whatTheySell: user?.whatTheySell ?? '',
        }}
      />
    </div>
  )
}
