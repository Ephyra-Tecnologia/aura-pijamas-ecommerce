'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminConfiguracoes() {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    hero_tag: 'Coleção Sonhar',
    hero_title: 'Pijamas <em>Aura</em><br>feito para sonhar...',
    hero_desc: 'Aura é o conjunto invisível de energia, emoção e presença. E nós queremos que você transmita a sua melhor versão ao dormir.',
    hero_cta: 'Explorar a coleção',
    announce_text: 'Frete grátis para compras acima de R$250 · Coleção Outono chegando em breve',
    banner_hero: '',
    banner_sobre: '',
    banner_ed1: '',
    banner_ed2: '',
    banner_ed3: '',
  })

  useEffect(() => {
    fetch('/api/configuracoes')
      .then(r => r.json())
      .then(data => setConfig(c => ({ ...c, ...data })))
  }, [])

  const handleUpload = async (key: string, file: File) => {
    setUploading(key)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setConfig(c => ({ ...c, [key]: url }))
    setUploading(null)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/configuracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = {
    background: 'white', border: '1px solid var(--sand)',
    padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-sans)',
    outline: 'none', color: 'var(--dark)', width: '100%',
  }

  const labelStyle = {
    fontSize: 10, letterSpacing: '0.15em',
    textTransform: 'uppercase' as const, color: 'var(--stone)',
  }

  const BannerUpload = ({ label, configKey }: { label: string; configKey: string }) => {
    const ref = useRef<HTMLInputElement>(null)
    const url = config[configKey as keyof typeof config]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>{label}</label>
        <div
          onClick={() => ref.current?.click()}
          style={{ border: '2px dashed var(--sand)', padding: '20px', cursor: 'pointer', background: 'white', position: 'relative', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {uploading === configKey ? (
            <p style={{ fontSize: 12, color: 'var(--stone)' }}>Enviando...</p>
          ) : url ? (
            <>
              <Image src={url} alt={label} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Trocar imagem</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, color: 'var(--stone)', marginBottom: 8 }}>+</p>
              <p style={{ fontSize: 12, color: 'var(--stone)' }}>Clique para adicionar</p>
            </div>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleUpload(configKey, e.target.files[0]) }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--dark)', color: 'var(--cream)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Aura Admin</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/admin" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/produtos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Produtos</Link>
          <Link href="/admin/pedidos" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Pedidos</Link>
          <Link href="/admin/configuracoes" style={{ color: 'var(--cream)', textDecoration: 'none' }}>Configurações</Link>
          <Link href="/api/auth/signout" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sair</Link>
        </div>
      </div>

      <div style={{ padding: '48px 40px', maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300 }}>Configurações da loja</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: saved ? '#1e8449' : 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '12px 28px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'background 0.3s' }}
          >
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Aviso topo */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, marginBottom: 24 }}>Aviso do topo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>Texto da barra de aviso</label>
              <input style={inputStyle} value={config.announce_text} onChange={e => setConfig(c => ({ ...c, announce_text: e.target.value }))} />
            </div>
          </div>

          {/* Hero */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, marginBottom: 24 }}>Hero (banner principal)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <BannerUpload label="Imagem do hero" configKey="banner_hero" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={labelStyle}>Tag (ex: Coleção Sonhar)</label>
                <input style={inputStyle} value={config.hero_tag} onChange={e => setConfig(c => ({ ...c, hero_tag: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={labelStyle}>Título</label>
                <input style={inputStyle} value={config.hero_title} onChange={e => setConfig(c => ({ ...c, hero_title: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={labelStyle}>Descrição</label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={config.hero_desc} onChange={e => setConfig(c => ({ ...c, hero_desc: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={labelStyle}>Texto do botão</label>
                <input style={inputStyle} value={config.hero_cta} onChange={e => setConfig(c => ({ ...c, hero_cta: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Banners editoriais */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, marginBottom: 24 }}>Banners editoriais</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <BannerUpload label="Banner 1 (Tecidos)" configKey="banner_ed1" />
              <BannerUpload label="Banner 2 (Destaque)" configKey="banner_ed2" />
              <BannerUpload label="Banner 3 (Bestsellers)" configKey="banner_ed3" />
            </div>
          </div>

          {/* Banner sobre */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, marginBottom: 24 }}>Seção Sobre</h2>
            <BannerUpload label="Foto da seção sobre" configKey="banner_sobre" />
          </div>

        </div>
      </div>
    </div>
  )
}