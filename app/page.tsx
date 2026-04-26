import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import { Editorial, AboutStrip, Features, Newsletter, Footer } from '@/components/index'

export default function Home() {
  return (
    <>
      <Hero />
      <ProductGrid />
      <Editorial />
      <AboutStrip />
      <Features />
      <Newsletter />
      <Footer />
    </>
  )
}
