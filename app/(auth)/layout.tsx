// export const dynamic = 'force-dynamic';
// export const revalidate = 0;
// export const runtime = 'nodejs'; // optional

import type React from 'react';
import { APP_NAME } from '@menumize/utils';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { LanguageSwitcher } from '@/components/platform/language-switcher';
import { Link } from '@/i18n/navigation';
import { routing, isRTL } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params; // ✅ no await

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col" dir={isRTL(locale) ? 'rtl' : 'ltr'}>
      <header className="bg-background w-full">
        <div className="container mt-4 mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <div className="flex-1">
            <Link href="/" locale={locale} className="flex items-center gap-2">
              <Image
                src={logo || '/placeholder.svg'}
                alt={APP_NAME}
                width={200}
                height={40}
                priority
                className="h-8 w-auto sm:h-9 md:h-10 lg:h-12"
              />
            </Link>
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
          {children}
        </div>
      </main>
      <footer className="hidden sm:block bg-background py-4 text-center text-sm text-muted-foreground w-full">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
