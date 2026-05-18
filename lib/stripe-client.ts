import { loadStripe, Stripe } from '@stripe/stripe-js'

let _stripePromise: Promise<Stripe | null> | null = null

export function getStripeClient(): Promise<Stripe | null> {
  if (!_stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
    if (!pk) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não configurado')
      return Promise.resolve(null)
    }
    _stripePromise = loadStripe(pk)
  }
  return _stripePromise
}
