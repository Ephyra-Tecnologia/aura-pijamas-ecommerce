import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div style={{ padding: '48px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 300, marginBottom: 8 }}>
          Bem-vinda! 🌙
        </h1>
        <p style={{ color: 'var(--stone)', fontSize: 14, marginBottom: 48 }}>
          Painel de gestão da Aura Pijamas
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 800 }}>
          {[
            { label: 'Produtos ativos', value: '—', href: '/admin/produtos' },
            { label: 'Pedidos hoje', value: '—', href: '/admin/pedidos' },
            { label: 'Faturamento mês', value: '—', href: '/admin/pedidos' },
          ].map((card, i) => (
            <Link key={i} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                border: '1px solid var(--sand)',
                padding: '32px 24px',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', color: 'var(--dark)', marginBottom: 8 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)' }}>
                  {card.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  )
}