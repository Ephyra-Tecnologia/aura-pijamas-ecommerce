import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

function getPeriodRange(period: string) {
  const now = new Date()
  const end = new Date(now)
  const start = new Date(now)

  switch (period) {
    case 'hoje':
      start.setHours(0, 0, 0, 0)
      break
    case '7d':
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      break
    case '3m':
      start.setMonth(start.getMonth() - 3)
      start.setHours(0, 0, 0, 0)
      break
    case '12m':
    default:
      start.setFullYear(start.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
  }

  const diff = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - diff)
  const prevEnd = new Date(start)

  return { start, end, prevStart, prevEnd }
}

function groupByPeriod(orders: any[], period: string) {
  const groups: Record<string, { valor: number; pedidos: number }> = {}

  const getKey = (date: Date) => {
    if (period === 'hoje') {
      return `${String(date.getHours()).padStart(2, '0')}h`
    } else if (period === '12m' || period === '3m') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      if (period === '12m') return months[date.getMonth()]
      // 3m: agrupar por semana
      const weekNum = Math.ceil(date.getDate() / 7)
      return `${months[date.getMonth()]} S${weekNum}`
    } else {
      // 7d ou 30d: por dia
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
    }
  }

  // Pré-preenche slots vazios
  const now = new Date()
  if (period === 'hoje') {
    for (let h = 0; h <= now.getHours(); h++) {
      groups[`${String(h).padStart(2, '0')}h`] = { valor: 0, pedidos: 0 }
    }
  } else if (period === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const k = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      groups[k] = { valor: 0, pedidos: 0 }
    }
  } else if (period === '30d') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const k = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      groups[k] = { valor: 0, pedidos: 0 }
    }
  } else if (period === '3m') {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i * 7)
      const weekNum = Math.ceil(d.getDate() / 7)
      groups[`${months[d.getMonth()]} S${weekNum}`] = { valor: 0, pedidos: 0 }
    }
  } else {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      groups[months[d.getMonth()]] = { valor: 0, pedidos: 0 }
    }
  }

  orders.forEach(order => {
    const key = getKey(new Date(order.createdAt))
    if (groups[key] !== undefined) {
      groups[key].valor += order.total
      groups[key].pedidos += 1
    }
  })

  return Object.entries(groups).map(([label, data]) => ({ label, ...data }))
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const period = req.nextUrl.searchParams.get('period') ?? '30d'
  const { start, end, prevStart, prevEnd } = getPeriodRange(period)

  // Busca todos os dados em paralelo
  const [orders, prevOrders, allProducts, pendingOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end }, status: { in: ['PAID', 'PENDING', 'PROCESSING'] } },
      include: { items: { include: { product: { select: { name: true, images: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: prevStart, lte: prevEnd }, status: { in: ['PAID', 'PENDING', 'PROCESSING'] } },
      select: { total: true },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, stock: true, active: true, images: true, price: true },
    }),
    prisma.order.findMany({
      where: { status: 'PENDING' },
      select: { id: true },
    }),
  ])

  const paidOrders = orders.filter(o => o.status === 'PAID')

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const faturamento = paidOrders.reduce((s, o) => s + o.total, 0)
  const faturamentoAnterior = prevOrders.reduce((s, o) => s + o.total, 0)
  const totalPedidos = orders.length
  const totalPedidosAnterior = prevOrders.length
  const ticketMedio = paidOrders.length > 0 ? faturamento / paidOrders.length : 0

  const unidadesVendidas = paidOrders.reduce((sum, o) =>
    sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)

  const variacaoFaturamento = faturamentoAnterior > 0
    ? ((faturamento - faturamentoAnterior) / faturamentoAnterior) * 100
    : null

  const variacaoPedidos = totalPedidosAnterior > 0
    ? ((totalPedidos - totalPedidosAnterior) / totalPedidosAnterior) * 100
    : null

  // ── Gráfico ────────────────────────────────────────────────────────────────
  const grafico = groupByPeriod(paidOrders, period)

  // ── Top produtos mais vendidos ─────────────────────────────────────────────
  const produtoMap: Record<string, { name: string; image: string; vendas: number; receita: number }> = {}
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      const id = item.productId
      if (!produtoMap[id]) {
        produtoMap[id] = {
          name: item.product?.name ?? 'Produto removido',
          image: item.product?.images?.[0] ?? '',
          vendas: 0,
          receita: 0,
        }
      }
      produtoMap[id].vendas += item.quantity
      produtoMap[id].receita += item.price * item.quantity
    })
  })
  const topProdutos = Object.values(produtoMap)
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5)

  // ── Pedidos recentes ────────────────────────────────────────────────────────
  const pedidosRecentes = orders.slice(0, 8).map(o => ({
    id: o.id,
    name: o.name,
    email: o.email,
    total: o.total,
    status: o.status,
    items: o.items.length,
    createdAt: o.createdAt,
  }))

  // ── Estoque baixo ───────────────────────────────────────────────────────────
  const estoqueBaixo = allProducts
    .filter(p => p.active && p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map(p => ({ id: p.id, name: p.name, stock: p.stock, image: p.images?.[0] ?? '' }))

  // ── Insights ────────────────────────────────────────────────────────────────
  const insights: string[] = []

  if (variacaoFaturamento !== null) {
    if (variacaoFaturamento > 20) insights.push(`🚀 Faturamento cresceu ${variacaoFaturamento.toFixed(0)}% em relação ao período anterior`)
    else if (variacaoFaturamento < -20) insights.push(`📉 Faturamento caiu ${Math.abs(variacaoFaturamento).toFixed(0)}% em relação ao período anterior`)
  }

  if (topProdutos[0]) insights.push(`⭐ Produto estrela: ${topProdutos[0].name} (${topProdutos[0].vendas} vendas)`)

  if (pendingOrders.length > 0) insights.push(`⏳ ${pendingOrders.length} pedido${pendingOrders.length > 1 ? 's' : ''} aguardando confirmação de pagamento`)

  if (estoqueBaixo.length > 0) insights.push(`⚠️ ${estoqueBaixo.length} produto${estoqueBaixo.length > 1 ? 's' : ''} com estoque crítico — repor logo`)

  const melhorDia = grafico.reduce((best, g) => g.valor > best.valor ? g : best, { label: '', valor: 0 })
  if (melhorDia.valor > 0) insights.push(`📅 Melhor período: ${melhorDia.label} com ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(melhorDia.valor)}`)

  return NextResponse.json({
    kpis: {
      faturamento,
      faturamentoAnterior,
      variacaoFaturamento,
      totalPedidos,
      totalPedidosAnterior,
      variacaoPedidos,
      ticketMedio,
      unidadesVendidas,
      pedidosPendentes: pendingOrders.length,
      pedidosPagos: paidOrders.length,
      totalProdutosAtivos: allProducts.filter(p => p.active).length,
    },
    grafico,
    topProdutos,
    pedidosRecentes,
    estoqueBaixo,
    insights,
    period,
    updatedAt: new Date().toISOString(),
  })
}
