/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/platform/app/[locale]/(auth)/invite/accept/AcceptInviteForm.tsx
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@menumize/ui';
import { acceptInviteAction } from '@/lib/actions/userRoles/people.actions';
import { signIn, signOut } from 'next-auth/react';

type Props = {
  locale: string;
  token: string;
  email: string; // invited email
  venueId: string;
  state: 'unauth' | 'mismatch' | 'match';
  sessionEmail: string | null;
  currentName: string | null;
  expiresAt: Date | string;
};

export default function AcceptInviteForm({
  locale,
  token,
  email,
  venueId,
  state,
  sessionEmail,
  currentName,
  expiresAt,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // profile fields (only used in "match")
  const [name, setName] = React.useState(currentName ?? '');
  const [phone, setPhone] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [language, setLanguage] = React.useState(''); // "en", "ar", ...

  const acceptUrl = `/${locale}/invite/accept?token=${encodeURIComponent(token)}`;

  async function doMagicLink() {
    setError(null);
    setNotice('Sending a secure sign-in link… Check your inbox.');
    await signIn('resend', { email, redirect: false, callbackUrl: acceptUrl });
  }

  async function doGoogle() {
    setError(null);
    await signIn('google', { callbackUrl: acceptUrl, prompt: 'select_account' });
  }

  async function switchAccount() {
    await signOut({ callbackUrl: acceptUrl });
  }

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const res = await acceptInviteAction({
        token,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        language: language.trim() || undefined,
      });

      if ((res as any)?.ok) {
        router.push(`/${locale}/venues/${venueId}/dashboard`);
        router.refresh();
        return;
      }

      // Defensive: should rarely hit now because we gate by state
      const reason = (res as any)?.reason;
      if (reason === 'AUTH_REQUIRED') {
        setError(`Please sign in as ${email} to accept this invite.`);
      } else if (reason === 'EMAIL_MISMATCH') {
        setError(
          `You're signed in as ${sessionEmail ?? 'another account'}. Please switch to ${email}.`,
        );
      } else if (reason === 'EXPIRED') {
        setError('This invite has expired.');
      } else if (reason === 'ALREADY_ACCEPTED') {
        setError('This invite was already accepted.');
      } else if (reason === 'INVALID') {
        setError('Invalid invite link.');
      } else {
        setError('Failed to accept invite. Please try again.');
      }
    });
  };

  const Exp = (
    <p className="text-xs text-muted-foreground">Expires {new Date(expiresAt).toLocaleString()}</p>
  );

  // ────────────────────── RENDER ──────────────────────
  if (state === 'unauth') {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-muted p-3 text-sm">
          Invitation for <span className="font-medium">{email}</span>
          <div>{Exp}</div>
        </div>

        <p className="text-sm text-muted-foreground">
          Please sign in as <strong>{email}</strong> to accept this invitation.
        </p>

        {notice && <p className="text-sm text-green-600">{notice}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={doGoogle}>
            Continue with Google
          </Button>
          <Button type="button" variant="secondary" onClick={doMagicLink}>
            Email me a magic link
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'mismatch') {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-muted p-3 text-sm">
          Invitation for <span className="font-medium">{email}</span>
          <div>{Exp}</div>
        </div>

        <p className="text-sm text-destructive">
          You’re signed in as <strong>{sessionEmail}</strong>. This invite is for{' '}
          <strong>{email}</strong>.
        </p>

        {notice && <p className="text-sm text-green-600">{notice}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={doGoogle}>
            Continue with Google
          </Button>
          <Button type="button" variant="secondary" onClick={doMagicLink}>
            Email me a magic link
          </Button>
          <Button type="button" variant="ghost" onClick={switchAccount}>
            Switch account
          </Button>
        </div>
      </div>
    );
  }

  // state === 'match'
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-md bg-muted p-3 text-sm">
        Invitation for <span className="font-medium">{email}</span>
        <div>{Exp}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job title (optional)</Label>
          <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language (optional)</Label>
          <Input
            id="language"
            placeholder="e.g., en, ar"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
      </div>

      {notice && <p className="text-sm text-green-600">{notice}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Accepting…' : 'Accept invite'}
        </Button>
      </div>
    </form>
  );
}
