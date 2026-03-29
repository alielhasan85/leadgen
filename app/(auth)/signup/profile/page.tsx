// apps/platform/app/[locale]/(auth)/signup/profile/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { redirect as i18nRedirect } from '@/i18n/navigation';
import { auth } from '@/auth';
import { prisma } from 'db';
import { invalidateSessionCache } from '@/lib/auth/session-cache';
import ProfileForm from './profile-form';

function redirectTo(href: string, locale: string): never {
  i18nRedirect({ href, locale });
  throw new Error('redirect');
}

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  const { locale } = await params;

  const session = await auth();
  if (!session?.user?.id) redirectTo('/login', locale);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      profileComplete: true,
      lastActiveVenueId: true,
      name: true,
      businessName: true,
      jobTitle: true,
      phoneE164: true,
      phoneCountry: true,
    },
  });
  if (!user) redirectTo('/login?error=user_missing', locale);

  if (user.profileComplete) {
    // Session cache may be stale (profileComplete=false cached) - bust it before redirect
    await invalidateSessionCache();
    const dest = user.lastActiveVenueId
      ? '/venues/' + user.lastActiveVenueId + '/dashboard'
      : '/venues';
    redirectTo(dest, locale);
  }

  return (
    <ProfileForm
      initialValues={{
        name: user.name ?? '',
        phone: user.phoneE164 ?? '',
        businessName: user.businessName ?? '',
        countryCode: (user.phoneCountry as string | undefined) ?? undefined,
      }}
    />
  );
}
