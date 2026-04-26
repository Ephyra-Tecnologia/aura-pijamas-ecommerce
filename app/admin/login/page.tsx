'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/admin')
    } else {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Image
            src="/assets/aura-header.png"
            alt="Aura Pijamas"
            height={56}
            width={180}
            style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
          <p style={{ marginTop: 12, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--stone)' }}>
            Painel Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--sand)',
                padding: '10px 0',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                color: 'var(--dark)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--sand)',
                padding: '10px 0',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                color: 'var(--dark)',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--dark)',
              color: 'var(--cream)',
              border: 'none',
              padding: '16px',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}