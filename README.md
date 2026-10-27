# Web Messenger

Aplicação web de mensagens em tempo real, desenvolvida como projeto de estudo com **React** no frontend e **Node.js + Express** no backend.

Usuários criam conta, fazem login e trocam mensagens. As mensagens novas chegam ao destinatário na hora, via **WebSocket**, e ficam salvas no servidor.

O projeto foi construído em fases (veja os arquivos `FASE-1.md` a `FASE-5.md`), com o objetivo de praticar o desenvolvimento Full Stack de ponta a ponta: API REST, autenticação, persistência e comunicação em tempo real.

## Status

| Fase | Tema | Situação |
| --- | --- | --- |
| 1 | API REST de mensagens, validação e Health Check | Concluída |
| 2 | Identidade do usuário (UUID) | Concluída |
| 3 | Cadastro, login e rotas protegidas | Concluída |
| 4 | Persistência de usuários e mensagens | Concluída |
| 5 | WebSocket e tempo real | Em andamento |

**Fase 5, o que já funciona:** conexão WebSocket autenticada com JWT e entrega imediata de novas mensagens.

**Fase 5, o que falta:** lista de conversas, histórico das últimas 50 mensagens por conversa, presença online/offline e middleware de logging centralizado.

## Funcionalidades

- Cadastro e login com senha protegida por hash (`bcryptjs`)
- Autenticação com JWT (expira em 7 dias) e middleware para rotas protegidas
- Login persistente no navegador e logout
- Lista de usuários disponíveis, sem incluir o próprio usuário
- Envio de mensagens para outro usuário
- Recebimento de mensagens em tempo real por WebSocket
- Mensagens e usuários persistidos em PostgreSQL (Drizzle ORM, com migrations)
- Validação dos dados na API (destinatário existente com UUID válido, texto não vazio e com até 2000 caracteres)
- Tratamento centralizado de erros (`AppError` + middleware)
- Endpoint de Health Check, consultado pelo frontend a cada 1 minuto
- Sessão encerrada automaticamente quando a API retorna `401`

## Tecnologias

**Frontend**

- React 19
- Vite
- JavaScript
- CSS
- ESLint

**Backend**

- Node.js
- TypeScript (`tsx` em desenvolvimento, `tsc` no build)
- Express 5
- WebSocket (`ws`)
- JWT (`jsonwebtoken`)
- `bcryptjs`
- PostgreSQL 17 (via Docker Compose)
- Drizzle ORM e Drizzle Kit (schema e migrations)
- `dotenv` e `cors`

## Estrutura do projeto

```text
web-messenger/
├── backend/
│   ├── data/              # schema do banco e acesso aos dados (db, users, messages)
│   ├── drizzle/           # migrations SQL geradas pelo Drizzle Kit
│   ├── src/
│   │   ├── errors/        # AppError
│   │   ├── middleware/    # autenticação e tratamento de erros
│   │   ├── routes/        # rotas de mensagens, usuários, auth e health
│   │   ├── utils/         # geração e validação de token
│   │   ├── types.ts       # tipos compartilhados (User, Message, eventos)
│   │   ├── websocket.ts   # servidor WebSocket e conexões por usuário
│   │   └── index.ts
│   ├── drizzle.config.ts
│   └── .env.example
├── docker-compose.yml     # PostgreSQL
├── frontend/
│   └── src/
│       ├── components/    # Auth, HealthCheck
│       ├── pages/         # Login, Register, PaginaPrincipal
│       └── styles/
├── FASE-1.md ... FASE-5.md
└── README.md
```

## Como executar

Pré-requisitos: Node.js e Docker (Docker Desktop no Windows) instalados.

### 1. Banco de dados

Na raiz do projeto, suba o PostgreSQL:

```bash
docker compose up -d
```

Os dados ficam no volume `postgres-data` e continuam lá quando o container é reiniciado.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Abra o arquivo `.env` e defina um valor para o segredo do JWT. O `DATABASE_URL` do exemplo já aponta para o banco do `docker-compose.yml`:

```env
PORT=3000
JWT_SECRET=um-segredo-longo-e-aleatorio
DATABASE_URL=postgres://messenger:messenger@localhost:5432/messenger
```

Crie as tabelas aplicando as migrations (necessário na primeira vez e sempre que houver uma migration nova):

```bash
npm run db:migrate
```

Inicie o servidor em modo de desenvolvimento (reinicia ao salvar):

```bash
npm run dev
```

Ou gere o build e rode a versão compilada:

```bash
npm run build
npm start
```

O backend sobe em `http://localhost:3000`.

Outros scripts úteis:

| Script | O que faz |
| --- | --- |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |
| `npm run db:generate` | Gera uma migration nova após alterar `data/schema.ts` |
| `npm run db:studio` | Abre o Drizzle Studio para ver os dados no navegador |

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:5173`.

### 4. Testando

1. Abra duas abas (ou uma aba normal e uma anônima).
2. Crie duas contas diferentes.
3. Em uma conta, selecione a outra como destinatário e envie uma mensagem.
4. A mensagem aparece na outra aba sem recarregar a página.

## API

### Rotas públicas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Estado da API |
| `POST` | `/register` | Cria uma conta |
| `POST` | `/login` | Autentica e retorna o token |

**`GET /health`**

```json
{
  "timestamp": "2026-10-27T12:00:00.000Z",
  "uptime": 120.42
}
```

**`POST /register`**

```json
{ "email": "ana@email.com", "password": "minha-senha" }
```

Resposta `201`:

```json
{ "id": "uuid-do-usuario", "email": "ana@email.com" }
```

Erros: `400` (campos ausentes) e `409` (email já cadastrado).

**`POST /login`**

Mesmo corpo do registro. Resposta `200`:

```json
{ "token": "jwt...", "id": "uuid-do-usuario" }
```

Erros: `400` (campos ausentes) e `401` (credenciais inválidas).

### Rotas protegidas

Enviam o header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/me` | Retorna o id do usuário autenticado |
| `GET` | `/users` | Lista os outros usuários (`id` e `email`) |
| `GET` | `/messages` | Lista as mensagens recebidas |
| `POST` | `/messages` | Envia uma mensagem |

**`POST /messages`**

```json
{ "to": "uuid-do-destinatario", "text": "Olá!" }
```

Resposta `201`:

```json
{
  "id": "uuid-da-mensagem",
  "from": "uuid-do-remetente",
  "to": "uuid-do-destinatario",
  "text": "Olá!",
  "createdAt": "2026-10-27T12:00:00.000Z",
  "fromEmail": "ana@email.com"
}
```

Erros: `400` (destinatário inválido, texto vazio ou com mais de 2000 caracteres), `401` (token ausente, inválido ou expirado) e `404` (destinatário não encontrado).

### WebSocket

```text
ws://localhost:3000?token=<jwt>
```

A conexão é recusada (código `1008`) se o token for inválido ou o usuário não existir. Quando alguém envia uma mensagem, o destinatário conectado recebe:

```json
{
  "type": "message:new",
  "message": { "id": "...", "from": "...", "to": "...", "text": "...", "createdAt": "...", "fromEmail": "..." }
}
```

Um mesmo usuário pode estar conectado em várias abas ao mesmo tempo, e todas recebem o evento.

## Limitações conhecidas

- A URL da API está fixa em `localhost:3000` no frontend.
- O frontend ainda está em JavaScript.
- Ainda não há testes automatizados.
- Ainda não há deploy.

## Próximos passos

- [ ] Lista de conversas e histórico das últimas 50 mensagens por conversa
- [ ] Presença online/offline em tempo real
- [ ] Middleware de logging centralizado
- [x] Porta do backend configurável (`PORT`)
- [ ] Variável de ambiente para a URL da API no frontend
- [x] Limite de 2000 caracteres por mensagem
- [ ] Validações adicionais (formato de email, tamanho de senha)
- [x] Migração do backend para TypeScript
- [ ] Migração do frontend para TypeScript
- [x] Banco de dados PostgreSQL com Drizzle
- [ ] Testes automatizados
- [x] PostgreSQL com Docker Compose
- [ ] CI com GitHub Actions
- [ ] Deploy

## Autor

**Gustavo Campos Alves**
[GitHub](https://github.com/gustavocamposa) · [LinkedIn](https://www.linkedin.com/in/gustavocamposa)

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE`.