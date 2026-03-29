import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      onboarded: boolean
      isActive: boolean
    } & DefaultSession['user']
  }
}
