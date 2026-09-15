# Real-Time Messenger Challenge — Fase 2

## Objetivo

Evoluir a Fase 1 adicionando uma identidade persistente para cada usuário.

Nesta fase:

- Cada usuário deve possuir um UUID. [OK]
- O usuário não deve mais digitar manualmente seu próprio `userId`. [OK]
- O frontend deve criar e armazenar a identidade do usuário. [OK]
- O usuário deve continuar com o mesmo UUID ao recarregar a página.[OK]

- Ainda não existe autenticação real.
- Ainda não existe banco de dados.
- Ainda não existe WebSocket.
- As mensagens continuam sendo armazenadas apenas em memória no backend.
- Uma mensagem continua podendo ser lida apenas uma vez.

---

## Identidade do usuário [OK]

Na primeira vez que o frontend for aberto, ele deve gerar um UUID para o usuário.

Exemplo:

```text
550e8400-e29b-41d4-a716-446655440000
```

O UUID deve ser salvo no navegador.

Pode ser utilizado, por exemplo:

```text
localStorage
```

Ao recarregar a página, o frontend deve reutilizar o UUID existente em vez de gerar um novo.

---

## Regras do UUID

O frontend deve seguir a seguinte lógica:

```text
Existe um userId salvo?
    |
    |-- Sim --> usar o userId existente
    |
    |-- Não --> gerar um novo UUID
                salvar no navegador
                usar esse UUID
```

Pode ser utilizado:

```javascript
crypto.randomUUID();
```

para gerar o UUID.

---

## Interface

O frontend deve mostrar claramente o UUID atual.

Exemplo:

```text
Your User ID

550e8400-e29b-41d4-a716-446655440000

[ Copy ID ]

--------------------------------

Send To
[____________________________________]

Message
[____________________________________]

[ Send Message ]

--------------------------------

Messages

[ Check Messages ]
```

O campo `Your User ID` não deve mais ser editável.

---

## Copiar ID

Adicionar um botão:

```text
Copy ID
```

Ao clicar nele, o UUID do usuário deve ser copiado para o clipboard.

O objetivo é permitir que um usuário envie seu ID para outra pessoa.

---

## Backend

O funcionamento básico do backend continua igual à Fase 1.

As mensagens continuam armazenadas apenas em memória.

Cada mensagem deve conter pelo menos:

```json
{
  "id": "uuid-da-mensagem",
  "from": "uuid-do-remetente",
  "to": "uuid-do-destinatario",
  "text": "Hello!"
}
```

Exemplo:

```json
{
  "id": "10df1964-d496-4cb0-93e1-d34140365351",
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!"
}
```

---

## API

### Enviar mensagem

```http
POST /messages
```

Body:

```json
{
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!"
}
```

O campo `from` deve ser automaticamente preenchido pelo frontend utilizando o UUID salvo no navegador.

O usuário não deve digitar manualmente seu próprio UUID ao enviar uma mensagem.

---

## Validação

O backend deve validar que:

- `from` existe.
- `to` existe.
- `text` existe.
- `from` é um UUID válido.
- `to` é um UUID válido.
- A mensagem não está vazia.

Se os dados forem inválidos, retornar um erro HTTP apropriado.

Exemplo:

```json
{
  "error": "Invalid recipient ID"
}
```

---

## Ler mensagens

```http
GET /messages/:userId
```

Exemplo:

```http
GET /messages/550e8400-e29b-41d4-a716-446655440000
```

O frontend deve fazer essa requisição utilizando automaticamente o UUID do usuário atual.

O usuário não deve precisar informar seu próprio ID.

---

## Mensagens descartáveis

A regra da Fase 1 continua obrigatória.

Uma mensagem deve ser entregue no máximo uma vez.

Exemplo:

```text
User A

ID:
aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa


User B

ID:
bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb
```

User A envia:

```json
{
  "from": "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
  "to": "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
  "text": "Hello!"
}
```

User B faz:

```http
GET /messages/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb
```

Resposta:

```json
[
  {
    "from": "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    "to": "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
    "text": "Hello!"
  }
]
```

Se User B fizer novamente:

```http
GET /messages/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb
```

Resposta:

```json
[]
```

---

## Persistência da identidade

A identidade deve persistir mesmo após:

```text
refresh da página
fechar e abrir a aba
fechar e abrir o navegador
```

Enquanto os dados locais do navegador não forem apagados, o UUID deve continuar o mesmo.

---

## Reset de identidade

Adicionar um botão:

```text
Reset Identity
```

Ao clicar:

1. O UUID atual deve ser removido do armazenamento local.
2. Um novo UUID deve ser gerado.
3. O novo UUID deve ser salvo.
4. A interface deve passar a utilizar o novo UUID.

Exemplo:

```text
ANTES

550e8400-e29b-41d4-a716-446655440000


Reset Identity


DEPOIS

54df7158-d17d-46ca-b688-e86203d96893
```

Depois do reset, mensagens enviadas para o UUID antigo não devem aparecer para o novo UUID.

---

## Health Check

O endpoint continua existindo:

```http
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

---

## Regras da Fase 2

- Manter todos os requisitos da Fase 1. [OK]
- Cada usuário deve possuir um UUID. [OK]
- O frontend deve gerar o UUID automaticamente. [OK]
- O UUID deve ser persistido no navegador. [OK]
- Recarregar a página não pode alterar o UUID.[OK]
- O próprio `userId` não deve mais ser digitado manualmente. [OK]
- Deve ser possível copiar o próprio UUID. [OK]
- Deve existir uma forma de resetar a identidade.
- `from` deve ser automaticamente definido pelo frontend. [OK]
- `to` continua sendo informado manualmente. [OK]
- Backend deve validar os UUIDs. [OK]

- Mensagens continuam apenas em memória.
- Não usar banco de dados.
- Não usar WebSocket.
- Não implementar senha.
- Não implementar autenticação.
- Não implementar lista de usuários.
- Uma mensagem continua podendo ser entregue apenas uma vez.

---

## Critérios de conclusão

A Fase 2 está completa quando for possível:

1. Abrir o frontend pela primeira vez.
2. Receber automaticamente um UUID.
3. Recarregar a página.
4. Confirmar que o UUID continua igual.
5. Abrir o frontend em outro navegador ou perfil.
6. Confirmar que o segundo usuário possui outro UUID.
7. Copiar o UUID do segundo usuário.
8. Enviar uma mensagem para esse UUID.
9. Buscar as mensagens no segundo usuário.
10. Receber a mensagem corretamente.
11. Buscar novamente.
12. Confirmar que a mensagem não aparece novamente.
13. Resetar a identidade.
14. Confirmar que um novo UUID foi criado.
15. Confirmar que mensagens enviadas ao UUID antigo não aparecem para o novo usuário.

---

## Resultado esperado

Ao final da Fase 2, já deve ser possível ter dois usuários com identidades diferentes utilizando o messenger.

Exemplo:

```text
Browser A

Your User ID:
550e8400-e29b-41d4-a716-446655440000


Browser B

Your User ID:
994c88af-37d1-44d7-a014-f18063f906df
```

Os dois conseguem trocar mensagens utilizando seus UUIDs, sem precisar configurar manualmente a própria identidade.
