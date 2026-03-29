import type React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background w-full border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <span className="text-xl font-bold tracking-tight">LeadGen GCC</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
          {children}
        </div>
      </main>

      <footer className="hidden sm:block bg-background py-4 text-center text-sm text-muted-foreground w-full border-t">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} LeadGen GCC. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
