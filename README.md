# Criando Lead (Nutshell)

Este repositório contém um formulário React + TypeScript + Vite que envia dados para uma função de API (rodando em Vercel) e cria **Company + Contact + Lead** no Nutshell via API.

O fluxo principal está em:

- **Frontend:** `src/components/Form.tsx`
- **API (backend):** `api/create-lead.ts`

## 🧪 Rodando localmente

### 1) Instalar dependências

```bash
npm install
```

### 2) Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (não commitá-lo) com:

```
NUTSHELL_API_URL=https://api.nutshell.com/v1/json
NUTSHELL_USERNAME=seu_usuario
NUTSHELL_PASSWORD=sua_senha
```

> 🔒 Essas variáveis também devem ser configuradas no painel do Vercel para o deploy em produção.

### 3) Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` (ou a porta mostrada no terminal).

---

## ✅ Como funciona o fluxo de criação de Lead

1. O usuário preenche o formulário na interface.
2. O frontend envia um POST para `/api/create-lead` com os dados do formulário.
3. O endpoint cria, em sequência:
   - uma **Company** (conta)
   - um **Contact** vinculado à Company
   - um **Lead** vinculado à Company + Contact
4. A resposta retorna os IDs gerados e mensagens de sucesso/erro.

---

## 🧩 Opções de faturamento e "venda no ML"

As opções válidas do formulário e da validação de backend estão centralizadas em:

- `src/constants/leadOptions.ts`

Isso evita divergência entre frontend e backend e garante que o valor enviado seja sempre aceito.

---

## 🚀 Deploy para Vercel

### 1) Configurar o projeto

- Conecte seu repositório à Vercel.
- Vercel detecta automaticamente o projeto Vite/React.

### 2) Variáveis de ambiente (obrigatórias)

No painel da Vercel, adicione as mesmas variáveis definidas em `.env`:

- `NUTSHELL_API_URL`
- `NUTSHELL_USERNAME`
- `NUTSHELL_PASSWORD`

### 3) Deploy

Você pode usar a CLI:

```bash
npm install -g vercel
vercel --prod
```

Ou deploy automático pelos commits na branch principal.

---

## 🧰 Scripts úteis

- `npm run dev` — roda o servidor de desenvolvimento
- `npm run build` — compila para produção (gera `dist/`)
- `npm run preview` — pré-visualiza a build de produção
- `npm run lint` — roda o ESLint

---

## 📌 Observações

- O projeto é escrito em **TypeScript** e usa **Vite + React 19**.
- A função de API usa a lib do Vercel (`@vercel/node`) para rodar como serverless.

---

Se precisar de ajuda para ajustar configurações do Nutshell ou do deploy, é só avisar!
