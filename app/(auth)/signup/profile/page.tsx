export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true, name: true, businessName: true, industry: true, whatTheySell: true },
  })

  if (!user) redirect('/login?error=user_missing')
  if (user.onboarded) redirect('/dashboard')

  return (
    <div className="w-full max-w-lg">
      <ProfileForm
        initialValues={{
          name: user.name ?? '',
          businessName: user.businessName ?? '',
          industry: user.industry ?? '',
          whatTheySell: user.whatTheySell ?? '',
        }}
      />
    </div>
  )
}
