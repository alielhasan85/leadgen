import { redirect } from 'next/navigation'

// /signup redirects to /login — sign-up is handled via the login page
export default function SignupRedirect() {
  redirect('/login')
}
