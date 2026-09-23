# Real-Time Messenger Challenge — Fase 1

## Objetivo

Criar a primeira versão de um messenger simples, com frontend e backend separados.

Nesta fase:

- Não existe banco de dados.
- Não existe autenticação.
- Não existe WebSocket.
- As mensagens são armazenadas apenas em memória no backend.
- Cada usuário é identificado por um `userId`.
- Uma mensagem só pode ser lida **uma única vez**.

---

## Requisitos

### Backend

O backend deve manter as mensagens em memória usando um array, objeto ou outra estrutura de dados simples.

Cada mensagem deve conter pelo menos:

```json
{
  "id": "uuid-da-mensagem",
  "from": "user-a",
  "to": "user-b",
  "text": "Hello!"
}
```

O `id` da mensagem deve ser gerado pelo servidor.

---

## API

### Enviar mensagem

```http
POST /messages
```

Body:

```json
{
  "from": "user-a",
  "to": "user-b",
  "text": "Hello!"
}
```

O servidor deve:

1. Validar os campos necessários.
2. Gerar um ID único para a mensagem.
3. Salvar a mensagem em memória.
4. Retornar uma resposta indicando que a mensagem foi aceita.

---

### Ler mensagens

```http
GET /messages/:userId
```

Exemplo:

```http
GET /messages/user-b
```

O servidor deve retornar todas as mensagens destinadas ao usuário informado.

Exemplo:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "from": "user-a",
    "to": "user-b",
    "text": "Hello!"
  }
]
```

### Regra principal

As mensagens só podem ser lidas **uma vez**.

Assim que uma mensagem for retornada pelo servidor, ela deve ser removida da memória.

Portanto:

```text
user-a envia "Hello!" para user-b

GET /messages/user-b
→ retorna "Hello!"

GET /messages/user-b
→ retorna []
```

Uma mensagem já entregue nunca pode aparecer novamente.

---

## Frontend

Criar uma página simples contendo:

```text
Your User ID
[________________]

Send To
[________________]

Message
[________________]

[ Send Message ]


Messages

[ Check Messages ]
```

### Enviar

Ao clicar em `Send Message`, o frontend deve fazer:

```http
POST /messages
```

utilizando os valores preenchidos pelo usuário.

### Receber

Ao clicar em `Check Messages`, o frontend deve fazer:

```http
GET /messages/:userId
```

usando o `Your User ID`.

As mensagens recebidas devem ser exibidas na página.

Não é necessário atualizar automaticamente nesta fase.

---

## Health Check

O backend também deve possuir:

```http
GET /health
```

Que deve retornar algo simples, por exemplo:

```json
{
  "status": "ok"
}
```

---

## Regras da Fase 1

- Backend e frontend devem ser aplicações separadas.
- Comunicação entre frontend e backend deve acontecer através de HTTP.
- Mensagens devem existir somente em memória.
- Reiniciar o backend pode apagar todas as mensagens.
- Não usar banco de dados.
- Não usar WebSocket.
- Não implementar login/autenticação.
- `userId` pode ser digitado manualmente.
- O servidor deve gerar o ID de cada mensagem.
- Uma mensagem deve ser entregue no máximo uma vez.
- Depois de entregue, a mensagem deve ser removida do servidor.

---

## Critérios de conclusão

A Fase 1 está completa quando for possível:

1. Abrir o frontend como `user-a`.
2. Enviar uma mensagem para `user-b`.
3. Abrir o frontend como `user-b`.
4. Buscar as mensagens de `user-b`.
5. Ver a mensagem enviada por `user-a`.
6. Buscar novamente as mensagens de `user-b`.
7. Confirmar que a mensagem anterior não é retornada novamente.
