'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/categorias', label: 'Categorias' },
  { href: '/admin/cupons', label: 'Cupons' },
  { href: '/admin/configuracoes', label: 'Configurações' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/admin" style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--cream)', textDecoration: 'none' }}>
          Aura Admin
        </Link>
        <div style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', alignItems: 'center' }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{ color: active ? 'var(--cream)' : 'var(--stone)', textDecoration: 'none', transition: 'color 0.2s' }}>
                {item.label}
              </Link>
            )
          })}
          <Link href="/api/auth/signout" style={{ color: 'var(--accent)', textDecoration: 'none', marginLeft: 8 }}>
            Sair
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}