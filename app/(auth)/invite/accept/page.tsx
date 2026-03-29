// apps/platform/app/[locale]/(auth)/invite/accept/page.tsx
export const dynamic = 'force-dynamic'; // avoid any cached session weirdness

import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@menumize/ui';
import { auth } from '@/auth';
import { getInviteInfoAction } from '@/lib/actions/userRoles/people.actions';
import AcceptInviteForm from './AcceptInviteForm';

export default async function AcceptInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  if (!token) redirect(`/${locale}/login?error=missing_token`);

  const info = await getInviteInfoAction(token);
  if (!info.ok) {
    const msg =
      info.reason === 'EXPIRED'
        ? 'This invite has expired.'
        : info.reason === 'ALREADY_ACCEPTED'
        ? 'This invite was already accepted.'
        : 'Invalid invite link.';

    return (
      <div className="container mx-auto max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invitation</CardTitle>
            <CardDescription>{msg}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const session = await auth();
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null;
  const invitedEmail = info.email.toLowerCase();

  let state: 'unauth' | 'mismatch' | 'match' = 'unauth';
  if (sessionEmail) state = sessionEmail === invitedEmail ? 'match' : 'mismatch';

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>
          <CardDescription>
            Join <strong>{info.venueName}</strong> as <strong>{info.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AcceptInviteForm
            locale={locale}
            token={token}
            email={invitedEmail}
            venueId={info.venueId}
            state={state}
            sessionEmail={sessionEmail}
            currentName={info.currentName}
            expiresAt={info.expiresAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
