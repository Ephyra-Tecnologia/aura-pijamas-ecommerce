import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { CartDrawer, ProductModal, Toast, WhatsAppButton } from '@/components/index'

export const metadata: Metadata = {
  title: 'Aura Pijamas',
  description: 'Pijamas feitos para quem valoriza o descanso como ritual.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main>{children}</main>
        <CartDrawer />
        <ProductModal />
        <Toast />
        <WhatsAppButton phone="11922521920" />
      </body>
    </html>
  )
}
