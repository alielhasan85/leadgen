/** Client component kept in the same file for convenience */
'use client';
import { useState, useTransition } from 'react';
import { Button as UIButton } from '@menumize/ui';
import { resendMagicLinkAction } from '@/lib/actions/auth/resend-magic-link.action';

export function ResendLinkButton({ email }: { email: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <UIButton
        variant="secondary"
        className="w-full"
        disabled={isPending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await resendMagicLinkAction(email);
            setMsg(
              res.ok ? 'Sent! Check your inbox.' : (res.message ?? 'Couldn’t send. Try again.'),
            );
          });
        }}
      >
        {isPending ? 'Sending...' : 'Resend magic link'}
      </UIButton>

      {msg && (
        <p className={`text-sm ${msg.startsWith('Sent') ? 'text-green-600' : 'text-destructive'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
