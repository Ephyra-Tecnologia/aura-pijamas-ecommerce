# 🌙 Aura Pijamas — E-commerce

> Loja de pijamas construída do zero com Next.js, PostgreSQL e deploy em GCP.

![Status](https://img.shields.io/badge/status-em%20produção-4CAF50?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![GCP](https://img.shields.io/badge/GCP-VM%20+%20Storage-4285F4?style=flat-square&logo=google-cloud)

---

## ✨ Features

- **Loja completa** — catálogo com filtro por categoria, modal de produto com galeria de imagens (swipe mobile), carrinho com persistência
- **Páginas de produto** — URL única por produto (`/produtos/slug`) com galeria, tamanhos e SEO/OG tags para compartilhamento
- **Checkout responsivo** — formulário em 3 etapas, busca de CEP via ViaCEP, cálculo de frete
- **Pagamentos via Pagar.me** — Pix com QR code + Cartão de crédito com parcelamento real (até 10x, 2x ou 3x sem juros conforme valor)
- **Cupons de desconto** — criação e validação de cupons no admin, aplicados no checkout
- **E-mails transacionais** — confirmação de pedido e atualização de status via Resend
- **Gestão de estoque** — decremento automático por tamanho após compra; produto desativado ao zerar
- **Soft delete de produtos** — produtos excluídos ficam visíveis apenas no admin para histórico de pedidos
- **Galeria de imagens** — swipe no mobile, setas e miniaturas no desktop
- **Tabela de medidas** — embutida no modal e na página do produto
- **Admin completo** — CRUD de produtos, pedidos, categorias, cupons, banners e configurações
- **Rastreio de pedidos** — código de rastreio no admin, exibido no e-mail de envio
- **Ordenação de produtos** — arrasta ou usa setas ↑↓ no painel admin
- **Múltiplas categorias** — relação many-to-many, nav dinâmico gerado a partir das categorias
- **Upload de imagens** — Google Cloud Storage
- **Botão WhatsApp flutuante** — com mensagem pré-preenchida
- **Páginas de conteúdo** — A Aura, Trocas e Devoluções, Cuidados com as Peças
- **Deploy automatizado** — GitHub Actions via IAP Tunnel para GCP

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Banco de dados | PostgreSQL 16 |
| ORM | Prisma 7 |
| Estilização | CSS customizado (design próprio) |
| Autenticação | NextAuth.js v5 |
| Estado global | Zustand |
| Storage | Google Cloud Storage |
| Pagamento | Pagar.me v5 (Pix + Cartão parcelado) |
| E-mail | Resend |
| Servidor | GCP VM (Ubuntu 22.04) |
| Proxy reverso | Caddy (SSL automático) |
| Process manager | PM2 |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |

---

## 🚀 Deploy

O deploy é automático via **GitHub Actions** a cada push na branch `main`.

```
push main → GitHub Actions → IAP Tunnel → GCP VM → build + restart
```

Para fazer deploy manual no servidor:

```bash
cd /root/aura-pijamas-ecommerce
git fetch origin && git reset --hard origin/main
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 reload aura-pijamas --update-env
```

---

## ⚙️ Configuração local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16
- Conta no GCP (Cloud Storage)

### Instalação

```bash
git clone git@github.com:heyconche/aura-pijamas-ecommerce.git
cd aura-pijamas-ecommerce
npm install
cp .env.example .env.local
# Edite o .env.local com suas credenciais
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Variáveis de ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"

# Auth
AUTH_SECRET="string_aleatoria_longa"

# Google Cloud Storage
GCS_BUCKET_NAME="nome-do-bucket"
GCS_PROJECT_ID="seu-projeto"
GCS_KEY_FILE="/caminho/para/gcs-credentials.json"

# Pagar.me (Pix + Cartão parcelado)
PAGARME_SECRET_KEY="sk_..."
PAGARME_WEBHOOK_SECRET="..."
PGTO_PRIVATE_KEY="sk_..."
PGTO_PUBLIC_KEY="pk_..."

# Resend (e-mails transacionais)
RESEND_API_KEY="re_..."

# Stripe (legado — não utilizado ativamente)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# URL pública
NEXT_PUBLIC_BASE_URL="https://aurapijamas.com.br"
```

---

## 📁 Estrutura do projeto

```
aura-pijamas-ecommerce/
├── app/
│   ├── page.tsx                  # Home
│   ├── colecoes/                 # Catálogo com filtro por categoria
│   ├── produtos/[slug]/          # Página de produto (SEO + OG)
│   ├── checkout/                 # Checkout em 3 etapas + Pix + Cartão
│   │   ├── sucesso/              # Pós-pagamento aprovado
│   │   ├── pendente/             # Pós-pagamento pendente
│   │   └── cancelado/            # Pós-pagamento cancelado
│   ├── a-aura/                   # Sobre a marca
│   ├── trocas-devolucoes/        # Política de trocas
│   ├── cuidados/                 # Cuidados com as peças
│   ├── admin/                    # Painel administrativo (protegido)
│   │   ├── produtos/             # CRUD + soft delete + ordenação
│   │   ├── pedidos/              # Gestão + status + rastreio
│   │   ├── categorias/           # CRUD de categorias
│   │   ├── cupons/               # CRUD de cupons de desconto
│   │   └── configuracoes/        # Banners e textos da home
│   └── api/
│       ├── produtos/             # CRUD + reorder + soft delete
│       ├── pedidos/              # CRUD + status + e-mail
│       ├── categorias/           # CRUD categorias
│       ├── cupons/[code]/        # Validação pública de cupom
│       ├── admin/cupons/         # CRUD admin de cupons
│       ├── upload/               # Upload para GCS
│       └── pagamento/
│           ├── route.ts          # Pagar.me — Pix e Cartão
│           ├── webhook/          # Webhook unificado (Pagar.me + Stripe)
│           └── webhook-pagarme/  # Webhook Pagar.me dedicado
├── components/                   # Header, Footer, ProductModal, CartDrawer...
├── lib/                          # Prisma, Pagar.me, Resend, Storage, Email
├── store/                        # Estado global (Zustand)
├── prisma/                       # Schema + migrations
└── public/                       # Assets, fontes (Eyesome)
```

---

## 🏗 Infraestrutura GCP

```
Cloudflare (DNS + CDN + SSL)
    ↓
GCP VM e2-small (Ubuntu 22.04)
    ├── Caddy (reverse proxy + SSL)
    ├── Next.js via PM2 (:3000)
    └── PostgreSQL 16

GCP Cloud NAT (saída para internet)
GCP Cloud Storage (imagens dos produtos)
GCP IAP Tunnel (acesso SSH seguro para CI/CD)
```

---

## 📦 Comandos úteis

```bash
# Ver logs em tempo real
pm2 logs aura-pijamas

# Status dos processos
pm2 status

# Reiniciar com novas env vars
pm2 reload aura-pijamas --update-env

# Abrir Prisma Studio
npx prisma studio

# Aplicar migrations em produção
npx prisma migrate deploy
```

---

## 🌙 Sobre o projeto

A **Aura Pijamas** é uma loja de pijamas focada em conforto e presença. Este e-commerce foi construído do zero com controle total sobre cada detalhe.

- **Sem plataformas de e-commerce** — código 100% próprio
- **Custo mínimo** — ~R$25/mês de infraestrutura fixa
- **Design próprio** — identidade visual única, não um template
- **Stack moderna** — fácil de evoluir e manter

---

<p align="center">
  Feito com 🌙 por <a href="https://github.com/heyconche">heyconche</a>
</p>
