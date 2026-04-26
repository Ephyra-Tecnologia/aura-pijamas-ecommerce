import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: 'var(--dark)',
        color: 'var(--cream)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>
          Aura Admin
        </span>
        <div style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/admin/produtos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Produtos</Link>
          <Link href="/admin/pedidos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Pedidos</Link>
          <Link href="/api/auth/signout" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sair</Link>
        </div>
      </div>

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
    </div>
  )
}