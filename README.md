# Órion Finanças

**Plataforma gamificada de educação financeira.** O Órion une um **gerenciador financeiro** (registro de entradas/saídas, metas e simuladores) a uma **trilha de aprendizado gamificada** (módulos, lições, quizzes, modo batalha, XP, moedas, vidas e ofensiva/streak), incentivando jovens a desenvolver o hábito de organizar e entender as próprias finanças.

> O conteúdo tem caráter **exclusivamente educacional**, baseado em fontes oficiais (ENEF, Banco Central do Brasil e CVM), e **não constitui recomendação de investimento**. Os valores usados na área de Finanças são **simulados** (não é dinheiro real).

---

## Sumário

- [Funcionalidades](#-funcionalidades)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Como rodar o projeto](#-como-rodar-o-projeto)
  - [1. Backend (API)](#1-backend-api)
  - [2. Frontend (Web)](#2-frontend-web)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Scripts disponíveis](#-scripts-disponíveis)
- [Pacotes / Dependências](#-pacotes--dependências)
- [Deploy](#-deploy)

---

## Funcionalidades

- **Autenticação** com JWT em cookies HTTP-only, cadastro com aceite de Termos/LGPD e recuperação de senha por e-mail.
- **Área de Finanças** (ambiente simulado): registro de entradas/saídas, categorias reutilizáveis, saldo antes de cada transação, gráficos de resumo/tendência e simuladores educativos (juros compostos, regra 50/30/20, metas).
- **Trilha de Aprendizado**: módulos e lições em formato de jornada, com leitura de conteúdo, quizzes (múltipla escolha, associação, arrastar-e-soltar) e **modo batalha**.
- **Gamificação**: XP, moedas fictícias, vidas, ofensiva (streak) e missões diárias.
- **Loja**: avatares/itens cosméticos comprados com moedas fictícias.
- **Metas financeiras** com acompanhamento de progresso.
- **Assinatura PRO** (integração de pagamento via AbacatePay) com benefícios como vidas infinitas.
- **Tema claro/escuro** persistente.
- **Acessibilidade**: integração com VLibras.
- **Painel administrativo** (gestão de usuários, missões, quizzes, assinaturas e feedbacks).
- **LGPD**: exportação de dados em PDF e exclusão/anonimização de conta.

---

## Arquitetura e Tecnologias

O projeto é dividido em **dois serviços independentes**:

### Frontend (`orionfinancas-fe`)
- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS 4** + CSS Modules
- **Framer Motion** (animações)
- **Recharts** (gráficos)
- **lucide-react** (ícones)
- **@dnd-kit** (arrastar e soltar nos quizzes)
- **react-hot-toast** (notificações)

### Backend (`orionfinancas-be`)
- **Node.js** + **Express 4**
- **MongoDB** (driver oficial `mongodb`)
- **JWT** (`jsonwebtoken`) + cookies (`cookie-parser`)
- **bcrypt** (hash de senhas)
- **Helmet** + **CORS** + **express-rate-limit** (segurança)
- **Resend** / **Nodemailer** (envio de e-mails)
- **PDFKit** (geração de PDF para exportação de dados — LGPD)
- **Jest** + **Supertest** + **mongodb-memory-server** (testes)

---

## Estrutura do repositório

```
tcc-2025-1-e-2-orion/
├── orionfinancas-fe/        # Aplicação web (Next.js)
│   ├── src/
│   │   ├── app/             # Rotas (App Router): (public), (auth), (user), admin
│   │   ├── components/      # Componentes reutilizáveis (layout, ui, common...)
│   │   ├── contexts/        # UserContext, ThemeContext
│   │   ├── services/        # Cliente da API
│   │   └── styles/          # globals.css, home.css, theme.css
│   └── public/              # Imagens e assets estáticos
│
└── orionfinancas-be/        # API REST (Express)
    ├── config/              # Conexão com o MongoDB
    ├── routes/              # Definição das rotas da API
    ├── controllers/         # Regras de negócio
    ├── middlewares/         # Autenticação, validações
    ├── services/            # Serviços (e-mail, etc.)
    ├── scripts/             # Scripts de seed/manutenção
    ├── tests/               # Testes automatizados (Jest)
    └── index.js             # Ponto de entrada da API
```

> Ajuste os nomes das pastas (`orionfinancas-fe` / `orionfinancas-be`) caso no repositório final eles tenham outros nomes (ex.: `frontend` / `backend`).


---

## Pré-requisitos

- **Node.js 18+** (recomendado 20+)
- **npm** (ou yarn/pnpm)
- **MongoDB**: uma instância local **ou** uma string de conexão do **MongoDB Atlas**
- O banco de dados utilizado pela API se chama **`orion_financas_db`**

---

## Como rodar o projeto

Clone o repositório e rode **backend** e **frontend** em terminais separados.

### 1. Backend (API)

```bash
cd orionfinancas-be

# Instalar dependências
npm install

# Criar o arquivo .env (veja a seção "Variáveis de ambiente")

# Iniciar a API
npm start
```

A API sobe por padrão em **http://localhost:3000** e expõe as rotas sob o prefixo **`/api`** (ex.: `http://localhost:3000/api/auth`).
Health check: `GET /health`.

> Se rodar o backend na porta 3000, lembre de subir o frontend em outra porta (veja abaixo).

### 2. Frontend (Web)

```bash
cd orionfinancas-fe

# Instalar dependências
npm install

# Criar o arquivo .env.local (veja a seção "Variáveis de ambiente")

# Ambiente de desenvolvimento
npm run dev
```

O frontend sobe em **http://localhost:3000** por padrão. Como a API também usa a 3000, rode o front em outra porta:

```bash
# Exemplo: frontend na porta 3001
npm run dev -- -p 3001
```

E configure `NEXT_PUBLIC_API_URL` apontando para a API (ex.: `http://localhost:3000/api`).

---

## Variáveis de ambiente

### Backend — `orionfinancas-be/.env`

| Variável | Descrição |
|----------|-----------|
| `MONGODB_URI` | String de conexão do MongoDB (local ou Atlas). |
| `PORT` | Porta da API (padrão: `3000`). |
| `SECRET_KEY` | Segredo usado para assinar o JWT de autenticação. |
| `JWT_RESET_SECRET` | Segredo para o token de recuperação de senha. |
| `ALLOWED_ORIGINS` | Origens permitidas no CORS, separadas por vírgula (ex.: `http://localhost:3001,https://orionfinancas.vercel.app`). |
| `FRONTEND_URL` | URL base do frontend (usada em links de e-mail). |
| `BASE_URL` | URL pública da própria API (usada no keep-alive anti cold-start). |
| `RESEND_KEY` | Chave da API do Resend (envio de e-mails). |
| `EMAIL_USER` | E-mail remetente / de contato. |
| `ABACATEPAY_KEY` | Chave da API de pagamentos (AbacatePay). |
| `ABACATEPAY_WEBHOOK_SECRET` | Segredo de validação do webhook de pagamento. |
| `TERMS_VERSION` | Versão atual dos Termos de Uso aceitos. |
| `NODE_ENV` | `development`, `production` ou `test`. |

**Exemplo (`.env`):**
```env
MONGODB_URI=mongodb://localhost:27017
PORT=3000
SECRET_KEY=troque-por-um-segredo-forte
JWT_RESET_SECRET=outro-segredo-forte
ALLOWED_ORIGINS=http://localhost:3001
FRONTEND_URL=http://localhost:3001
BASE_URL=http://localhost:3000
RESEND_KEY=
EMAIL_USER=seu-email@exemplo.com
ABACATEPAY_KEY=
ABACATEPAY_WEBHOOK_SECRET=
TERMS_VERSION=1.0
NODE_ENV=development
```

### Frontend — `orionfinancas-fe/.env.local`

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base da API (ex.: `http://localhost:3000/api`). |

**Exemplo (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Scripts disponíveis

### Backend (`orionfinancas-be`)

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia a API (`node index.js`). |
| `npm test` | Executa os testes com **Jest**. |
| `npm run seed-missions` | Popula as missões no banco. |
| `npm run update-missions` | Atualiza campos das missões existentes. |
| `node seedAvatarShop.js` | Popula os avatares cosméticos da Loja (idempotente). |
| `node seedCustomAvatars.js` | Cria avatares e os atribui gratuitamente ao inventário. |

### Frontend (`orionfinancas-fe`)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Ambiente de desenvolvimento (com hot reload). |
| `npm run build` | Build de produção. |
| `npm start` | Serve o build de produção. |
| `npm run lint` | Análise estática com ESLint. |

---

## Pacotes / Dependências

### Backend
**Produção:** `express`, `mongodb`, `jsonwebtoken`, `bcrypt`, `cookie-parser`, `cors`, `helmet`, `express-rate-limit`, `body-parser`, `dotenv`, `resend`, `nodemailer`, `pdfkit`
**Desenvolvimento:** `jest`, `supertest`, `mongodb-memory-server`

### Frontend
**Produção:** `next`, `react`, `react-dom`, `next-auth`, `framer-motion`, `recharts`, `lucide-react`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `react-hot-toast`
**Desenvolvimento:** `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`, `@types/*`

---

## Deploy

- **Frontend:** [Vercel](https://vercel.com) — build automático a partir do repositório. Defina `NEXT_PUBLIC_API_URL` apontando para a API em produção.
- **Backend:** [Render](https://render.com) (ou similar) — defina todas as variáveis de ambiente da API. O `index.js` possui um *keep-alive* que faz ping em `/health` a cada 14 min para evitar *cold start* no plano gratuito.
- **Banco de dados:** [MongoDB Atlas](https://www.mongodb.com/atlas).

> Em produção, configure `ALLOWED_ORIGINS` com o domínio do frontend para o CORS funcionar com cookies (`credentials: true`).

---

## Autoria

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) — **Órion Finanças**, 2025.
