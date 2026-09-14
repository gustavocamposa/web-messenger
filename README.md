# Web Messenger

Aplicação web de mensagens desenvolvida como projeto de estudo, utilizando **React** no frontend e **Node.js + Express** no backend.

O projeto tem como objetivo praticar conceitos de desenvolvimento **Full Stack**, comunicação entre frontend e backend por meio de uma API REST e manipulação de dados em memória.

## Tecnologias

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express
- JavaScript
- API REST

## Funcionalidades — Fase 1

- Envio de mensagens entre usuários
- Consulta de mensagens recebidas por usuário
- Geração de ID único para cada mensagem utilizando UUID
- Validação dos dados enviados na API
- Comunicação entre frontend e backend
- Endpoint de Health Check da API
- Verificação automática do status da API pelo frontend

## Endpoints

### Health Check

```http
GET /health
```

Retorna informações sobre o estado atual da API:

```json
{
  "status": "OK",
  "timestamp": "2026-09-14T00:00:00.000Z",
  "uptime": 120.42
}
```

### Buscar mensagens de um usuário

```http
GET /messages/:userId
```

Retorna as mensagens destinadas ao usuário informado.

Exemplo:

```http
GET /messages/alexandre
```

### Enviar mensagem

```http
POST /messages
```

Exemplo de corpo da requisição:

```json
{
  "from": "gustavo",
  "to": "alexandre",
  "text": "Olá, Alexandre!"
}
```

Caso algum dos campos obrigatórios não seja informado, a API retorna:

```http
400 Bad Request
```

## ▶️ Como executar

### Backend

Entre na pasta do backend:

```bash
cd backend
```

Inicialize o projeto:

```bash
npm init -y
```

Instale o Express:

```bash
npm install express
```

Execute o servidor:

```bash
node src/index.js
```

O backend será iniciado em:

```text
http://localhost:3000
```

### Frontend

Entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O frontend será disponibilizado pelo Vite, normalmente em:

```text
http://localhost:5173
```

## Testando a API

As requisições da API podem ser testadas utilizando ferramentas como **Postman** ou diretamente pela aplicação React.

Exemplo de fluxo:

```text
Gustavo
   │
   │ POST /messages
   ▼
Backend
   │
   │ Armazena mensagem em memória
   ▼
messages[]
   │
   │ GET /messages/alexandre
   ▼
Alexandre
```

## Health Check

O frontend realiza automaticamente uma verificação da API a cada **1 minuto** através do endpoint `/health`.

O resultado da verificação pode ser acompanhado pelo **Console do DevTools** do navegador.

## Armazenamento

Nesta primeira fase, as mensagens são armazenadas **somente em memória**, através de um array no backend.

Isso significa que os dados permanecem disponíveis enquanto o servidor estiver em execução, mas são perdidos quando o backend é reiniciado.

A persistência dos dados poderá ser implementada em uma próxima fase.

## Objetivo do projeto

Este projeto está sendo desenvolvido com foco no aprendizado prático de:

- Desenvolvimento de APIs REST
- Node.js e Express
- React
- Comunicação HTTP entre frontend e backend
- Requisições `GET` e `POST`
- Manipulação de arrays
- Validação de dados
- UUID
- Organização de projetos Full Stack
- Health Check e monitoramento básico de API

## Autor

**Gustavo Campos**

Projeto desenvolvido para fins de estudo e prática em desenvolvimento Full Stack.
