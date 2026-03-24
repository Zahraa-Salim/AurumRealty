/**
 * AuthLayout — app/(auth)/layout.tsx
 *
 * Minimal layout for authentication pages (/login, /forgot-password etc).
 * No Navigation, Footer, or Dashboard chrome — just the page content on
 * the cream background. The (auth) route group is invisible to the router.
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
