import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()

  if (session?.user) {
    if (session.user.onboarded) {
      redirect('/dashboard')
    } else {
      redirect('/signup/profile')
    }
  }

  const params = await searchParams
  const email = Array.isArray(params?.email) ? params.email[0] : params?.email
  const error = Array.isArray(params?.error) ? params.error[0] : params?.error

  return (
    <div className="w-full max-w-sm md:max-w-3xl">
      <LoginForm email={email} error={error} />
    </div>
  )
}
