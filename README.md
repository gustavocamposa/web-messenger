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
- Mensagens e usuários persistidos em arquivo JSON (`lowdb`)
- Validação dos dados na API (destinatário com UUID válido, texto não vazio)
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
- Express 5
- WebSocket (`ws`)
- JWT (`jsonwebtoken`)
- `bcryptjs`
- LowDB (persistência em JSON)
- `dotenv` e `cors`

## Estrutura do projeto

```text
web-messenger/
├── backend/
│   ├── data/              # acesso aos dados (db, users, messages)
│   ├── src/
│   │   ├── errors/        # AppError
│   │   ├── middleware/    # autenticação e tratamento de erros
│   │   ├── routes/        # rotas de mensagens, usuários, auth e health
│   │   ├── utils/         # geração e validação de token
│   │   ├── websocket.js   # servidor WebSocket e conexões por usuário
│   │   └── index.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/    # Auth, HealthCheck
│       ├── pages/         # Login, Register, PaginaPrincipal
│       └── styles/
├── FASE-1.md ... FASE-5.md
└── README.md
```

## Como executar

Pré-requisito: Node.js instalado.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Abra o arquivo `.env` e defina um valor para o segredo do JWT:

```env
JWT_SECRET=um-segredo-longo-e-aleatorio
```

Inicie o servidor (execute a partir da pasta `backend`, pois o arquivo `db.json` é criado nela):

```bash
npm start
```

O backend sobe em `http://localhost:3000`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:5173`.

### 3. Testando

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

Erros: `400` (destinatário inválido ou texto vazio) e `401` (token ausente, inválido ou expirado).

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
- A persistência é em arquivo JSON, adequada para estudo, não para produção.
- Ainda não há testes automatizados.
- Ainda não há deploy.

## Próximos passos

- [ ] Lista de conversas e histórico das últimas 50 mensagens por conversa
- [ ] Presença online/offline em tempo real
- [ ] Middleware de logging centralizado
- [ ] Variáveis de ambiente para as URLs do frontend e a porta do backend
- [ ] Validações adicionais (formato de email, tamanho de senha e de mensagem)
- [ ] Migração para TypeScript
- [ ] Banco de dados PostgreSQL com Prisma
- [ ] Testes automatizados
- [ ] Docker e CI com GitHub Actions
- [ ] Deploy

## Autor

**Gustavo Campos Alves**
[GitHub](https://github.com/gustavocamposa) · [LinkedIn](https://www.linkedin.com/in/gustavocamposa)

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE`.