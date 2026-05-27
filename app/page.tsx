import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import { Editorial, AboutStrip, Features, Newsletter, Footer } from '@/components/index'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getConfigs() {
  try {
    const settings = await prisma.setting.findMany()
    const result: Record<string, string> = {}
    settings.forEach((s: { key: string; value: string }) => { result[s.key] = s.value })
    return result
  } catch {
    return {}
  }
}

export default async function Home() {
  const config = await getConfigs()

  return (
    <>
      <Hero config={config} />
      <ProductGrid />
      <Editorial config={config} />
      <AboutStrip config={config} />
      <Features />
      <Newsletter />
      <Footer />
    </>
  )
}