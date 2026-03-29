/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Card, CardContent, Input, Label } from '@menumize/ui';
import { cn } from '@menumize/utils';
import { signIn } from 'next-auth/react';

import loginImg from '@/public/login-img.jpg';
import TermsOfServiceModal from '@/components/modals/TermsOfServiceModal';
import PrivacyPolicyModal from '@/components/modals/PrivacyPolicyModal';
import { sendMagicLinkAction } from '@/lib/actions/auth.actions';

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  locale: string;
  error?: string;
  email?: string;
}

export function LoginForm({
  className,
  locale,
  error: errorProp,
  email: emailProp,
  ...props
}: LoginFormProps) {
  const t = useTranslations('auth.login');
  const searchParams = useSearchParams();

  const [isMagicLoading, setIsMagicLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const [error, setError] = React.useState<string | null>(errorProp ?? null);
  const [emailFromUrl, setEmailFromUrl] = React.useState<string>(emailProp ?? '');

  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);

  // Determine if we should show the inline warning
  const queryError = searchParams.get('error') || undefined;
  const showLinkedWarning = (errorProp ?? queryError) === 'OAuthAccountNotLinked';

  // Pick up ?email and map error messages to friendly text
  React.useEffect(() => {
    const em = searchParams.get('email');
    if (!emailProp && em) setEmailFromUrl(em);

    const code = errorProp ?? queryError ?? null;
    if (code === 'OAuthAccountNotLinked') {
      setError(
        t('errors.oauthAccountNotLinked', {
          default:
            'This email already has an account. Please sign in with a magic link first, then link Google from Settings → Connections.',
        }),
      );
    } else if (code === 'EmailSignin') {
      setError(t('errors.emailSignIn', { default: 'We couldn’t sign you in by email.' }));
    } else if (code) {
      setError(t('errors.unexpectedError', { default: 'Something went wrong. Please try again.' }));
    } else if (!code && !errorProp) {
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, emailProp, errorProp]);

  async function handleGoogle() {
    try {
      setIsGoogleLoading(true);
      // Force account chooser to avoid the sticky Google profile
      await signIn('google', { redirectTo: `/${locale}`, prompt: 'select_account' });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function sendMagic(to: string) {
    if (!to.trim()) return;
    setIsMagicLoading(true);
    setError(null);
    try {
      // ✅ Use rate-limited server action (3 requests per 5 minutes per email)
      const result = await sendMagicLinkAction(to.trim().toLowerCase());

      if (!result.success) {
        // Show user-friendly error message (includes rate limit message)
        setError(result.error);
        return;
      }

      // Success! Redirect to check-email page
      window.location.href = `/${locale}/check-email?email=${encodeURIComponent(to)}`;
    } catch (e) {
      console.error('Magic link error', e);
      setError(t('errors.unexpectedError', { default: 'Something went wrong. Please try again.' }));
    } finally {
      setIsMagicLoading(false);
    }
  }

  async function handleMagicSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    const email = (formData.get('email') as string) || '';
    if (!email.trim()) {
      setError(t('errors.emailRequired', { default: 'Email is required.' }));
      return;
    }
    await sendMagic(email);
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left: Form */}
          <form className="p-6 md:p-8 space-y-6" onSubmit={handleMagicSubmit}>
            <div className="flex flex-col items-center text-center space-y-1">
              <h1 className="text-2xl font-bold">{t('title', { default: 'Welcome back' })}</h1>
              <p className="text-muted-foreground">
                {t('subtitle', { default: 'Login to your MenuMize account' })}
              </p>
            </div>

            {/* Inline warning for OAuthAccountNotLinked */}
            {showLinkedWarning && (
              <div
                role="alert"
                className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 p-3 text-sm space-y-2"
              >
                <div className="font-medium">
                  {t('linkedTitle', { default: 'Use your email to sign in' })}
                </div>
                <p>
                  {t('linkedBody', {
                    default:
                      'It looks like you already have an account with this email. Please sign in with a magic link first, then link Google from Settings → Connections.',
                  })}
                </p>
              </div>
            )}

            {/* Email */}
            <div className="grid gap-3">
              <Label htmlFor="email">{t('email', { default: 'Email' })}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t('emailPlaceholder', { default: 'email@example.com' })}
                defaultValue={emailFromUrl}
                disabled={isMagicLoading}
              />
              <p className="text-xs text-muted-foreground">
                {t('magicHint', { default: 'We’ll email you a secure sign-in link.' })}
              </p>
            </div>

            {/* Error (don’t duplicate when the yellow notice is shown) */}
            {error && !showLinkedWarning && (
              <div className="text-destructive text-sm font-medium" aria-live="polite">
                {error}
              </div>
            )}

            {/* Send magic link */}
            <Button type="submit" className="w-full" disabled={isMagicLoading}>
              {isMagicLoading
                ? t('sendingLink', { default: 'Sending link…' })
                : t('sendMagic', { default: 'Email me a magic link' })}
            </Button>

            {/* Google button — hidden in linked-warning mode */}
            {!showLinkedWarning && (
              <>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    {t('orContinueWith', { default: 'Or continue with' })}
                  </span>
                </div>

                <div className="flex">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full relative bg-gray-50 hover:bg-gray-100"
                    onClick={handleGoogle}
                    disabled={isGoogleLoading}
                  >
                    <Image
                      src="/google.svg"
                      alt="google"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-cover"
                    />
                    <span>
                      {isGoogleLoading
                        ? t('redirecting', { default: 'Redirecting…' })
                        : t('loginWithGoogle', { default: 'Continue with Google' })}
                    </span>
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Right: Image */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src={loginImg}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>

      {/* Terms / Privacy */}
      <div className="text-muted-foreground text-center text-xs">
        {t('termsAgreement', { default: 'By clicking continue, you agree to our' })}{' '}
        <button
          className="text-xs text-primary underline underline-offset-3 hover:font-bold"
          onClick={() => setIsTermsOpen(true)}
        >
          {t('termsOfService', { default: 'Terms of Service' })}
        </button>{' '}
        {t('and', { default: 'and' })}{' '}
        <button
          className="text-xs text-primary underline underline-offset-3 hover:font-bold"
          onClick={() => setIsPrivacyOpen(true)}
        >
          {t('privacyPolicy', { default: 'Privacy Policy' })}
        </button>
        .
      </div>

      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
