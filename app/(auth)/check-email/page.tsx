import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
} from '@menumize/ui';
import { ResendLinkButton } from './checkMail';

type PageProps = {
  // In Next 15, these are async
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string | string[] }>;
};

export default async function CheckEmailPage({ params, searchParams }: PageProps) {
  // Await the objects first
  const [{ locale }, sp] = await Promise.all([params, searchParams]);

  // Coerce email to a simple string
  const emailParam = sp.email;
  const email = Array.isArray(emailParam) ? (emailParam[0] ?? '') : (emailParam ?? '');

  // Keep text aligned with your provider's maxAge (you set 15 minutes in auth.ts)
  const expiresText = '15 minutes';

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We’ve sent a secure sign-in link to{' '}
            {email ? <span className="font-medium">{email}</span> : 'your email'}. The link expires
            in {expiresText}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">Open the email on this device and click the link to continue.</p>
          </div>

          <p className="text-sm text-muted-foreground">
            Didn’t get it? Check your spam folder or resend below.
          </p>

          {email ? (
            <ResendLinkButton email={email} />
          ) : (
            <div className="text-sm text-muted-foreground">
              Return to{' '}
              <Link href={`/${locale}/login`} className="underline">
                Login
              </Link>{' '}
              and try again.
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/login`}>Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
