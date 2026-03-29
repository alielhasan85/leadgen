import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import UploadForm from './upload-form'

export default async function MaterialsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.onboarded) redirect('/dashboard')

  return (
    <div className="w-full max-w-lg">
      <UploadForm />
    </div>
  )
}
