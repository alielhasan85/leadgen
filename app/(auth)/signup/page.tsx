

// apps/platform/app/[locale]/(auth)/signup/page.tsx
import { redirect } from '@/i18n/navigation';

export default async function SignupRedirect({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  redirect({ href: '/login?mode=signup', locale });
}
