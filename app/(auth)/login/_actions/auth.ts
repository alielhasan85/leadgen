'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function sendMagicLinkAction(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await signIn('resend', { email, redirect: false })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Failed to send magic link. Please try again.' }
    }
    // signIn throws a NEXT_REDIRECT — that means it worked
    return { success: true }
  }
}
