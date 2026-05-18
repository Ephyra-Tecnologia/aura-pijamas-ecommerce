'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// ── Types ───────────────────────────────────────────────────────────────────

type Period = 'hoje' | '7d' | '30d' | '3m' | '12m'

interface KPIs {
  faturamento: number
  faturamentoAnterior: number
  variacaoFaturamento: number | null
  totalPedidos: number
  totalPedidosAnterior: number
  variacaoPedidos: number | null
  ticketMedio: number
  unidadesVendidas: number
  pedidosPendentes: number
  pedidosPagos: number
  totalProdutosAtivos: number
}

interface GraficoPoint { label: string; valor: number; pedidos: number }
interface TopProduto { name: string; image: string; vendas: number; receita: number }
interface PedidoRecente {
  id: string; name: string; email: string; total: number
  status: string; items: number; createdAt: string
}
interface EstoqueItem { id: string; name: string; stock: number; image: string }

interface DashboardData {
  kpis: KPIs
  grafico: GraficoPoint[]
  topProdutos: TopProduto[]
  pedidosRecentes: PedidoRecente[]
  estoqueBaixo: EstoqueItem[]
  insights: string[]
  period: string
  updatedAt: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const pct = (v: number | null) =>
  v === null ? null : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

const periodLabels: Record<Period, string> = {
  hoje: 'Hoje',
  '7d': '7 dias',
  '30d': '30 dias',
  '3m': '3 meses',
  '12m': '12 meses',
}

const statusLabel: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const statusColor: Record<string, string> = {
  PAID: '#16a34a',
  PENDING: '#d97706',
  PROCESSING: '#2563eb',
  CANCELLED: '#dc2626',
  REFUNDED: '#6b7280',
}

// ── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ data }: { data: GraficoPoint[] }) {
  if (!data || data.length === 0) return null

  const W = 800
  const H = 220
  const PAD = { top: 24, right: 20, bottom: 36, left: 64 }

  const maxVal = Math.max(...data.map(d => d.valor), 1)
  const minVal = 0

  const xs = data.map((_, i) => PAD.left + (i / (data.length - 1 || 1)) * (W - PAD.left - PAD.right))
  const y = (v: number) => PAD.top + (1 - (v - minVal) / (maxVal - minVal)) * (H - PAD.top - PAD.bottom)

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y(data[i].valor).toFixed(1)}`).join(' ')
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${(H - PAD.bottom).toFixed(1)} L ${xs[0].toFixed(1)} ${(H - PAD.bottom).toFixed(1)} Z`

  // Y axis ticks
  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxVal / ticks) * i)

  // Show label every N points to avoid crowding
  const step = data.length <= 8 ? 1 : data.length <= 16 ? 2 : Math.ceil(data.length / 8)

  const [hover, setHover] = useState<number | null>(null)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8956A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#B8956A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={y(t)}
              x2={W - PAD.right} y2={y(t)}
              stroke="#E8DDD0" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={y(t) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#C4B5A5"
              fontFamily="Jost, sans-serif"
            >
              {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={area} fill="url(#grad)" />

        {/* Line */}
        <path d={path} fill="none" stroke="#B8956A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover zones */}
        {xs.map((x, i) => (
          <rect
            key={i}
            x={x - (W / data.length) / 2}
            y={PAD.top}
            width={W / data.length}
            height={H - PAD.top - PAD.bottom}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {/* Dots */}
        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={y(data[i].valor)}
            r={hover === i ? 6 : 3.5}
            fill={hover === i ? '#B8956A' : '#FDFAF7'}
            stroke="#B8956A"
            strokeWidth="2"
            style={{ transition: 'r 0.15s' }}
          />
        ))}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % step !== 0) return null
          return (
            <text
              key={i}
              x={xs[i]}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#C4B5A5"
              fontFamily="Jost, sans-serif"
            >
              {d.label}
            </text>
          )
        })}

        {/* Hover tooltip */}
        {hover !== null && (() => {
          const x = xs[hover]
          const yv = y(data[hover].valor)
          const d = data[hover]
          const ttW = 130
          const ttH = 52
          const ttX = Math.min(Math.max(x - ttW / 2, PAD.left), W - PAD.right - ttW)
          const ttY = Math.max(yv - ttH - 12, PAD.top)
          return (
            <g>
              <rect x={ttX} y={ttY} width={ttW} height={ttH} rx="6" fill="#1C1410" opacity="0.92" />
              <text x={ttX + ttW / 2} y={ttY + 18} textAnchor="middle" fontSize="11" fill="#E8DDD0" fontFamily="Jost, sans-serif" fontWeight="400">
                {d.label}
              </text>
              <text x={ttX + ttW / 2} y={ttY + 34} textAnchor="middle" fontSize="12" fill="#B8956A" fontFamily="Jost, sans-serif" fontWeight="300">
                {brl(d.valor)}
              </text>
              <text x={ttX + ttW / 2} y={ttY + 48} textAnchor="middle" fontSize="10" fill="#C4B5A5" fontFamily="Jost, sans-serif">
                {d.pedidos} pedido{d.pedidos !== 1 ? 's' : ''}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, variacao, icon, accent,
}: {
  label: string
  value: string
  sub?: string
  variacao?: number | null
  icon: string
  accent?: boolean
}) {
  const isPos = variacao !== null && variacao !== undefined && variacao > 0
  const isNeg = variacao !== null && variacao !== undefined && variacao < 0

  return (
    <div style={{
      background: accent ? 'var(--bark)' : 'white',
      border: `1px solid ${accent ? 'var(--bark)' : 'var(--sand)'}`,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {variacao !== null && variacao !== undefined && (
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            padding: '3px 8px',
            background: isPos ? '#dcfce7' : isNeg ? '#fee2e2' : '#f3f4f6',
            color: isPos ? '#16a34a' : isNeg ? '#dc2626' : '#6b7280',
            borderRadius: 20,
            letterSpacing: '0.02em',
          }}>
            {pct(variacao)}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 28,
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
        color: accent ? 'var(--sand)' : 'var(--dark)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: accent ? '#C4B5A5' : 'var(--stone)',
        fontFamily: 'var(--font-sans)',
      }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: accent ? '#C4B5A5' : 'var(--stone)', fontFamily: 'var(--font-sans)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (p: Period, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/admin/dashboard?period=${p}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
        const d = new Date()
        setLastUpdate(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  // Auto-refresh a cada 60s
  useEffect(() => {
    const timer = setInterval(() => fetchData(period, true), 60_000)
    return () => clearInterval(timer)
  }, [period, fetchData])

  const kpis = data?.kpis

  return (
    <div style={{ padding: '40px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 300, color: 'var(--dark)', marginBottom: 4 }}>
            Bem-vinda, Barbara 🌙
          </h1>
          <p style={{ fontSize: 12, color: 'var(--stone)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>
            {lastUpdate ? `Atualizado às ${lastUpdate}` : 'Carregando dados...'}
            {refreshing && ' · atualizando...'}
          </p>
        </div>

        {/* Period filter */}
        <div style={{ display: 'flex', gap: 6, background: 'white', border: '1px solid var(--sand)', padding: 4, borderRadius: 4 }}>
          {(Object.keys(periodLabels) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: period === p ? 400 : 300,
                letterSpacing: '0.05em',
                background: period === p ? 'var(--bark)' : 'transparent',
                color: period === p ? 'var(--sand)' : 'var(--stone)',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.2s',
              }}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--stone)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
          Carregando dashboard...
        </div>
      ) : data ? (
        <>
          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <KpiCard
              icon="💰"
              label="Faturamento"
              value={brl(kpis!.faturamento)}
              variacao={kpis!.variacaoFaturamento}
              sub={`período anterior: ${brl(kpis!.faturamentoAnterior)}`}
              accent
            />
            <KpiCard
              icon="📦"
              label="Pedidos"
              value={String(kpis!.totalPedidos)}
              variacao={kpis!.variacaoPedidos}
              sub={`${kpis!.pedidosPagos} pagos · ${kpis!.pedidosPendentes} pendentes`}
            />
            <KpiCard
              icon="🧾"
              label="Ticket médio"
              value={brl(kpis!.ticketMedio)}
            />
            <KpiCard
              icon="👗"
              label="Peças vendidas"
              value={String(kpis!.unidadesVendidas)}
            />
            <KpiCard
              icon="🏷️"
              label="Produtos ativos"
              value={String(kpis!.totalProdutosAtivos)}
            />
            <KpiCard
              icon="⏳"
              label="Aguardando pgto."
              value={String(kpis!.pedidosPendentes)}
              sub={kpis!.pedidosPendentes > 0 ? 'verificar pedidos' : 'tudo em dia ✓'}
            />
          </div>

          {/* Insights */}
          {data.insights.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {data.insights.map((insight, i) => (
                <div key={i} style={{
                  background: 'white',
                  border: '1px solid var(--sand)',
                  padding: '10px 16px',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--dark)',
                  borderRadius: 2,
                }}>
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '28px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 20, color: 'var(--dark)', marginBottom: 2 }}>
                  Faturamento
                </h2>
                <p style={{ fontSize: 11, color: 'var(--stone)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {periodLabels[period]}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 300, color: 'var(--accent)' }}>
                  {brl(kpis!.faturamento)}
                </div>
                {kpis!.variacaoFaturamento !== null && (
                  <div style={{
                    fontSize: 11,
                    color: kpis!.variacaoFaturamento! > 0 ? '#16a34a' : '#dc2626',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {pct(kpis!.variacaoFaturamento)} vs período anterior
                  </div>
                )}
              </div>
            </div>
            <LineChart data={data.grafico} />
          </div>

          {/* Bottom grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>

            {/* Recent orders */}
            <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 20, color: 'var(--dark)' }}>
                  Pedidos recentes
                </h2>
                <Link href="/admin/pedidos" style={{ fontSize: 11, color: 'var(--stone)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  Ver todos →
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
                  <thead>
                    <tr>
                      {['Cliente', 'Total', 'Itens', 'Status', 'Data'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', paddingBottom: 10, borderBottom: '1px solid var(--sand)', fontWeight: 400 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.pedidosRecentes.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < data.pedidosRecentes.length - 1 ? '1px solid #F7F3EE' : 'none' }}>
                        <td style={{ padding: '11px 0', fontSize: 13, color: 'var(--dark)' }}>
                          <div>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--stone)' }}>{p.email}</div>
                        </td>
                        <td style={{ padding: '11px 8px', fontSize: 13, color: 'var(--dark)', whiteSpace: 'nowrap' }}>
                          {brl(p.total)}
                        </td>
                        <td style={{ padding: '11px 8px', fontSize: 12, color: 'var(--stone)', textAlign: 'center' }}>
                          {p.items}
                        </td>
                        <td style={{ padding: '11px 8px' }}>
                          <span style={{
                            fontSize: 10,
                            padding: '3px 8px',
                            borderRadius: 20,
                            background: `${statusColor[p.status]}18`,
                            color: statusColor[p.status],
                            fontWeight: 400,
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                          }}>
                            {statusLabel[p.status] ?? p.status}
                          </span>
                        </td>
                        <td style={{ padding: '11px 0', fontSize: 11, color: 'var(--stone)', whiteSpace: 'nowrap' }}>
                          {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {data.pedidosRecentes.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--stone)' }}>
                          Nenhum pedido no período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Top produtos */}
              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, color: 'var(--dark)' }}>
                    Top produtos
                  </h2>
                  <Link href="/admin/produtos" style={{ fontSize: 11, color: 'var(--stone)', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    Gerenciar →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.topProdutos.length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--stone)', fontFamily: 'var(--font-sans)' }}>Nenhuma venda no período</p>
                  )}
                  {data.topProdutos.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 14, color: 'var(--stone)', fontFamily: 'var(--font-sans)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      {p.image ? (
                        <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, background: 'var(--cream)', borderRadius: 2, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--dark)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--stone)', fontFamily: 'var(--font-sans)' }}>
                          {p.vendas} un · {brl(p.receita)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estoque baixo */}
              <div style={{ background: 'white', border: '1px solid var(--sand)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, color: 'var(--dark)' }}>
                    Estoque crítico
                  </h2>
                  {data.estoqueBaixo.length > 0 && (
                    <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 20 }}>
                      {data.estoqueBaixo.length} alerta{data.estoqueBaixo.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {data.estoqueBaixo.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#16a34a', fontFamily: 'var(--font-sans)' }}>✓ Estoque em dia</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.estoqueBaixo.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, background: 'var(--cream)', borderRadius: 2, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: 'var(--dark)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 11, color: p.stock === 0 ? '#dc2626' : '#d97706', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                            {p.stock === 0 ? 'Sem estoque' : `${p.stock} unidade${p.stock > 1 ? 's' : ''}`}
                          </div>
                        </div>
                        <Link href={`/admin/produtos`} style={{ fontSize: 11, color: 'var(--stone)', fontFamily: 'var(--font-sans)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          Repor →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Produtos', href: '/admin/produtos', icon: '👗' },
              { label: 'Pedidos', href: '/admin/pedidos', icon: '📦' },
              { label: 'Categorias', href: '/admin/categorias', icon: '🏷️' },
              { label: 'Configurações', href: '/admin/configuracoes', icon: '⚙️' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white',
                  border: '1px solid var(--sand)',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--sand)')}
                >
                  <span style={{ fontSize: 20 }}>{link.icon}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--dark)', letterSpacing: '0.05em' }}>
                    {link.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--stone)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
          Erro ao carregar dados. Tente novamente.
        </div>
      )}
    </div>
  )
}
