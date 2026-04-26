# 🌙 Aura Pijamas — E-commerce

> Loja de pijamas artesanal construída do zero com Next.js, PostgreSQL e deploy em GCP.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-B8956A?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![GCP](https://img.shields.io/badge/GCP-VM%20+%20Storage-4285F4?style=flat-square&logo=google-cloud)

---

## ✨ Features

- **Loja completa** — catálogo, modal de produto, carrinho com persistência
- **Checkout** — formulário em 3 etapas com busca de CEP via ViaCEP
- **Pagamentos** — integração com Pagar.me (Pix, cartão, boleto)
- **Frete** — cálculo via Melhor Envio API
- **Admin** — painel de gestão de produtos, pedidos e banners
- **Upload de imagens** — Google Cloud Storage
- **Deploy automatizado** — GitHub Actions via IAP Tunnel

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
| Pagamento | Pagar.me |
| Frete | Melhor Envio |
| E-mail | Resend |
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
# Clone o repositório
git clone git@github.com:heyconche/aura-pijamas-ecommerce.git
cd aura-pijamas-ecommerce

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Rode as migrations
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"

# Auth
AUTH_SECRET="seu_secret_aqui"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"

# Admin
ADMIN_EMAIL="admin@aurapijamas.com.br"
ADMIN_PASSWORD="sua_senha_aqui"

# Google Cloud Storage
GCS_BUCKET_NAME="nome-do-bucket"
GCS_PROJECT_ID="seu-projeto"
GCS_KEY_FILE="/caminho/para/credentials.json"

# Pagar.me
PAGARME_SECRET_KEY="sk_test_..."
PAGARME_PUBLIC_KEY="pk_test_..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="contato@aurapijamas.com.br"
```

---

## 📁 Estrutura do projeto

```
aura-pijamas-ecommerce/
├── app/
│   ├── (loja)/              # Páginas públicas
│   │   ├── page.tsx         # Home
│   │   ├── colecoes/        # Catálogo
│   │   └── checkout/        # Checkout
│   ├── admin/               # Painel administrativo
│   │   ├── page.tsx         # Dashboard
│   │   ├── produtos/        # CRUD de produtos
│   │   └── pedidos/         # Gestão de pedidos
│   └── api/                 # API Routes
│       ├── auth/            # NextAuth
│       ├── produtos/        # CRUD produtos
│       ├── pedidos/         # CRUD pedidos
│       ├── upload/          # Upload GCS
│       └── pagamento/       # Webhook Pagar.me
├── components/              # Componentes React
├── lib/                     # Utilitários (Prisma, Storage)
├── store/                   # Estado global (Zustand)
├── prisma/                  # Schema e migrations
└── public/                  # Assets estáticos
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

# Reiniciar aplicação
pm2 restart aura-pijamas --update-env

# Migrations em produção
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio
```

---

## 🌙 Sobre o projeto

A **Aura Pijamas** é uma loja de pijamas artesanal focada em conforto e presença. Este e-commerce foi construído do zero em um final de semana, priorizando:

- **Controle total** — sem dependência de plataformas de e-commerce
- **Custo mínimo** — ~R$25/mês de infraestrutura fixa
- **Design próprio** — identidade visual única, não um template
- **Escalabilidade** — stack moderna, fácil de evoluir

---

<p align="center">
  Feito com 🌙 por <a href="https://github.com/heyconche">heyconche</a>
</p>