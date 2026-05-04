'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function AdminConfiguracoes() {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    announce_text: 'Frete grátis para compras acima de R$250 · Coleção Outono chegando em breve',
    hero_tag: 'Coleção Sonhar',
    hero_title: 'Pijamas <em>Aura</em><br>feito para sonhar...',
    hero_desc: 'Aura é o conjunto invisível de energia, emoção e presença. E nós queremos que você transmita a sua melhor versão ao dormir.',
    hero_cta: 'Explorar a coleção',
    hero_cta_href: '#colecao',
    hero_text_color: '',
    banner_hero: '',
    ed1_tag: 'Tecidos naturais', ed1_title: '100% Algodão', ed1_link_text: 'Descobrir', ed1_href: '/colecoes', ed1_text_color: '', banner_ed1: '',
    ed2_tag: 'Edição limitada', ed2_title: 'Pijama Americano', ed2_link_text: 'Ver coleção', ed2_href: '/colecoes', ed2_text_color: '', banner_ed2: '',
    ed3_tag: 'Bestsellers', ed3_title: 'Favoritos', ed3_link_text: 'Explorar', ed3_href: '/colecoes', ed3_text_color: '', banner_ed3: '',
    banner_sobre: '', about_overline: 'Nossa filosofia',
    about_title: 'Valorizamos o <em>desacelerar</em>,<br />o sentir e o viver o momento.',
    about_desc: 'Pijamas Aura nasceu para proporcionar conforto, presença e clima de leveza na sua melhor hora do dia.',
    about_btn_text: 'Sobre a Aura', about_btn_href: '/sobre',
  })

  useEffect(() => {
    fetch('/api/configuracoes').then(r => r.json()).then(data => setConfig(c => ({ ...c, ...data })))
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
    await fetch('/api/configuracoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const set = (key: string, value: string) => setConfig(c => ({ ...c, [key]: value }))

  const inputStyle: React.CSSProperties = { background: 'white', border: '1px solid var(--sand)', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dark)', width: '100%' }
  const labelStyle: React.CSSProperties = { fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--stone)' }

  const field = (label: string, key: string, textarea = false, placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      {textarea
        ? <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={config[key as keyof typeof config]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} value={config[key as keyof typeof config]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />}
    </div>
  )

  const colorField = (label: string, key: string, hint = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {config[key as keyof typeof config] && <div style={{ width: 28, height: 28, background: config[key as keyof typeof config], border: '1px solid var(--sand)', flexShrink: 0 }} />}
        <input style={{ ...inputStyle, fontFamily: 'monospace' }} value={config[key as keyof typeof config]} onChange={e => set(key, e.target.value)} placeholder={hint || '#1C1410 (vazio = cor padrão)'} />
      </div>
    </div>
  )

  const BannerUpload = ({ label, configKey }: { label: string; configKey: string }) => {
    const ref = useRef<HTMLInputElement>(null)
    const url = config[configKey as keyof typeof config]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>{label}</label>
        <div onClick={() => ref.current?.click()} style={{ border: '2px dashed var(--sand)', cursor: 'pointer', background: 'white', position: 'relative', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {uploading === configKey ? <p style={{ fontSize: 12, color: 'var(--stone)' }}>Enviando...</p>
            : url ? (
              <><Image src={url} alt={label} fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Trocar imagem</span>
                </div></>
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: 20, color: 'var(--stone)', marginBottom: 4 }}>+</p>
                <p style={{ fontSize: 11, color: 'var(--stone)' }}>Clique para adicionar</p>
              </div>
            )}
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleUpload(configKey, e.target.files[0]) }} />
      </div>
    )
  }

  const card = (title: string, children: React.ReactNode) => (
    <div style={{ background: 'white', border: '1px solid var(--sand)', padding: 28 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300, marginBottom: 20 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )

  return (
    <div style={{ padding: '40px', maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 300 }}>Configurações da loja</h1>
        <button onClick={handleSave} disabled={saving} style={{ background: saved ? '#1e8449' : 'var(--dark)', color: 'var(--cream)', border: 'none', padding: '12px 28px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'background 0.3s' }}>
          {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {card('🔔 Aviso do topo', <>{field('Texto da barra de aviso', 'announce_text')}</>)}
        {card('🖼 Hero — Banner principal', <>
          <BannerUpload label="Imagem do hero" configKey="banner_hero" />
          {field('Tag (ex: Coleção Sonhar)', 'hero_tag')}
          {field('Título (aceita <em> e <br>)', 'hero_title')}
          {field('Descrição', 'hero_desc', true)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Texto do botão', 'hero_cta')}{field('Link do botão', 'hero_cta_href')}
          </div>
          {colorField('Cor do texto (hex)', 'hero_text_color', '#1C1410 = escuro padrão, #FDFAF7 = claro')}
        </>)}
        {card('📸 Banner editorial 1', <>
          <BannerUpload label="Imagem" configKey="banner_ed1" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Tag', 'ed1_tag')}{field('Título', 'ed1_title')}
            {field('Texto do link', 'ed1_link_text')}{field('Link (href)', 'ed1_href')}
          </div>
          {colorField('Cor do texto (hex)', 'ed1_text_color', '#4A3728 = escuro, #FDFAF7 = claro')}
        </>)}
        {card('📸 Banner editorial 2', <>
          <BannerUpload label="Imagem" configKey="banner_ed2" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Tag', 'ed2_tag')}{field('Título', 'ed2_title')}
            {field('Texto do link', 'ed2_link_text')}{field('Link (href)', 'ed2_href')}
          </div>
          {colorField('Cor do texto (hex)', 'ed2_text_color', '#F7F3EE = claro, #1C1410 = escuro')}
        </>)}
        {card('📸 Banner editorial 3', <>
          <BannerUpload label="Imagem" configKey="banner_ed3" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Tag', 'ed3_tag')}{field('Título', 'ed3_title')}
            {field('Texto do link', 'ed3_link_text')}{field('Link (href)', 'ed3_href')}
          </div>
          {colorField('Cor do texto (hex)', 'ed3_text_color', '#FDFAF7 = claro, #1C1410 = escuro')}
        </>)}
        {card('🌿 Seção Sobre', <>
          <BannerUpload label="Foto" configKey="banner_sobre" />
          {field('Texto "Nossa filosofia"', 'about_overline')}
          {field('Título (aceita <em> e <br />)', 'about_title')}
          {field('Descrição', 'about_desc', true)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Texto do botão', 'about_btn_text')}{field('Link do botão', 'about_btn_href')}
          </div>
        </>)}
      </div>
    </div>
  )
}