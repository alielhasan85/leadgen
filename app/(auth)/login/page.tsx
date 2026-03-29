// app/[locale]/(auth)/login/page.tsx

import { redirect } from '@/i18n/navigation';
import { auth } from '@/auth';
import { LoginForm } from './login-form';

export default async function LoginPage({
  params,
  searchParams = {},
}: {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { locale } = await params;
  const session = await auth();

  // If already signed in, skip the page
  if (session?.user) {
    if (session.user.profileComplete) {
      redirect({ href: '/venues', locale });
    } else {
      redirect({ href: '/signup/profile', locale });
    }
  }

  const resolved = await searchParams;
  const email = Array.isArray(resolved.email) ? resolved.email[0] : resolved.email;
  const error = Array.isArray(resolved.error) ? resolved.error[0] : resolved.error;

  return (
    <div className="w-full max-w-sm md:max-w-3xl">
      <LoginForm locale={locale} email={email} error={error ?? undefined} />
    </div>
  );
}
