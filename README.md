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
- **Checkout responsivo** — formulário em 3 etapas, busca de CEP via ViaCEP, cálculo de frete
- **Pagamentos híbridos** — Pix via MercadoPago + Cartão via Stripe (Checkout hospedado)
- **Galeria de imagens** — swipe no mobile, miniaturas no desktop
- **Tabela de medidas** — embutida no modal de produto
- **Admin completo** — CRUD de produtos, pedidos, categorias, banners e configurações
- **Ordenação de produtos** — arrasta ou usa setas ↑↓ no painel admin
- **Múltiplas categorias** — relação many-to-many, nav dinâmico gerado a partir das categorias
- **Upload de imagens** — Google Cloud Storage
- **Botão WhatsApp flutuante** — com mensagem pré-preenchida
- **Páginas de conteúdo** — A Aura, Trocas e Devoluções, Cuidados com as Peças
- **Fontes customizadas** — Eyesome (display) + Cormorant Garamond + Jost
- **Deploy automatizado** — GitHub Actions via IAP Tunnel para GCP

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL 16 |
| ORM | Prisma 7 |
| Estilização | CSS customizado (design próprio) |
| Autenticação | NextAuth.js v5 |
| Estado global | Zustand |
| Storage | Google Cloud Storage |
| Pagamento (Pix) | MercadoPago |
| Pagamento (Cartão) | Stripe Checkout |
| Servidor | GCP VM (Ubuntu 22.04) |
| Proxy | Caddy (SSL automático) |
| Process manager | PM2 |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |

---

## 🚀 Deploy

O deploy é automático via **GitHub Actions** a cada push na branch `main`.

```
push main → GitHub Actions → IAP Tunnel → GCP VM → build + restart
```

Para fazer deploy manual:

```bash
cd /root/aura-pijamas-ecommerce
git pull
npm install
npx prisma generate
npm run build
pm2 restart aura-pijamas
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
cp .env.example .env
# Edite o .env com suas credenciais
npx prisma migrate dev
npm run dev
```

### Variáveis de ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"

# Auth
BETTER_AUTH_SECRET="seu_secret_aqui"
ADMIN_EMAIL="admin@aurapijamas.com.br"
ADMIN_PASSWORD="sua_senha_aqui"

# Google Cloud Storage
GCS_BUCKET_NAME="nome-do-bucket"
GCS_PROJECT_ID="seu-projeto"
GCS_CLIENT_EMAIL="sa@projeto.iam.gserviceaccount.com"
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# Stripe (cartão de crédito)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# MercadoPago (Pix)
MP_ACCESS_TOKEN="APP_USR-..."
MP_WEBHOOK_SECRET="seu_webhook_secret"

# URL pública
NEXT_PUBLIC_BASE_URL="https://aurapijamas.com.br"
```

---

## 📁 Estrutura do projeto

```
aura-pijamas-ecommerce/
├── app/
│   ├── page.tsx             # Home
│   ├── colecoes/            # Catálogo com filtro por categoria
│   ├── checkout/            # Checkout em 3 etapas + Pix + Stripe
│   │   ├── sucesso/         # Pós-pagamento aprovado
│   │   ├── pendente/        # Pós-pagamento pendente
│   │   └── cancelado/       # Pós-pagamento cancelado
│   ├── a-aura/              # Sobre a marca
│   ├── trocas-devolucoes/   # Política de trocas
│   ├── cuidados/            # Cuidados com as peças
│   ├── admin/               # Painel administrativo
│   │   ├── produtos/        # CRUD + ordenação
│   │   ├── pedidos/         # Gestão de pedidos
│   │   ├── categorias/      # CRUD de categorias
│   │   └── configuracoes/   # Banners e textos
│   └── api/                 # API Routes
│       ├── produtos/        # CRUD + reorder
│       ├── pedidos/         # CRUD pedidos
│       ├── categorias/      # CRUD categorias
│       ├── upload/          # Upload GCS
│       └── pagamento/       # Stripe + MercadoPago + Webhooks
├── components/              # Header, Footer, ProductModal, CartDrawer, WhatsAppButton...
├── lib/                     # Prisma, Stripe, MercadoPago, Storage
├── store/                   # Estado global (Zustand)
├── prisma/                  # Schema
└── public/                  # Assets, fontes (Eyesome)
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
```

---

## 📦 Comandos úteis

```bash
# Ver logs em tempo real
pm2 logs aura-pijamas

# Status dos processos
pm2 status

# Reiniciar com novas env vars
pm2 restart aura-pijamas --update-env

# Abrir Prisma Studio
npx prisma studio
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
