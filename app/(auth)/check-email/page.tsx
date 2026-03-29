import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = params?.email ?? ''

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardContent className="pt-6 pb-8 px-8 flex flex-col items-center text-center gap-4">
          <div className="text-4xl">📬</div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a sign-in link to{' '}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              'your email address'
            )}
            . Click the link to sign in — it expires in 15 minutes.
          </p>
          <p className="text-muted-foreground text-xs">
            Didn&apos;t get it? Check your spam folder or{' '}
            <Link href="/login" className="underline underline-offset-3 hover:text-foreground">
              try again
            </Link>
            .
          </p>
          <Button variant="outline" asChild className="mt-2 w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
