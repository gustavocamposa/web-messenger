# Real-Time Messenger Challenge — Fase 4

## Objetivo

Nesta fase, o objetivo é refinar a aplicação e torná-la mais próxima de um messenger real.

Os principais pontos agora são:

- Persistir usuários em arquivo JSON. [OK]
- Manter os usuários mesmo que o backend seja reiniciado. [OK]
- Buscar usuários disponíveis pelo backend.
- Mostrar o email dos usuários no frontend, escondendo o UUID da interface principal.
- Continuar usando o UUID internamente nas requests.
- Adicionar data e hora às mensagens.
- Adicionar logs em todas as rotas do backend.
- Persistir o login no frontend após refresh. [OK]
- Parar de deletar mensagens depois da leitura. [OK]
- Mostrar remetente, data e hora em cada mensagem.

---

## 1. Persistência dos usuários

Até agora os usuários estavam armazenados apenas em memória.

Exemplo:

```ts
const users = [];
```

O problema é que, ao reiniciar o backend, todos os usuários desaparecem.

Nesta fase isso deve mudar.

Os usuários devem ser persistidos em um arquivo JSON.

Exemplo:

```text
backend/
  data/
    users.json
```

Exemplo de conteúdo:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alex@example.com",
    "passwordHash": "$2b$10$..."
  },
  {
    "id": "994c88af-37d1-44d7-a014-f18063f906df",
    "email": "joao@example.com",
    "passwordHash": "$2b$10$..."
  }
]
```

---

## 2. Biblioteca para persistência em JSON

Não é necessário implementar manualmente toda a leitura e escrita usando `fs`.

Pode ser utilizada uma biblioteca simples para trabalhar com JSON como armazenamento.

Por exemplo:

```text
lowdb
```

ou outra biblioteca equivalente.

O importante é que seja possível:

```text
ler usuários do arquivo
adicionar usuário
buscar usuário
salvar alterações
```

E que os usuários continuem existindo depois de:

```text
backend desligar
backend iniciar novamente
```

---

## 3. Registro de usuário

O cadastro continua funcionando através de:

```http
POST /auth/register
```

Body:

```json
{
  "email": "alex@example.com",
  "password": "my-password"
}
```

O backend deve:

1. Validar email.
2. Validar senha.
3. Verificar se o email já existe.
4. Gerar um UUID.
5. Criar o hash da senha.
6. Salvar o usuário no arquivo JSON.

Exemplo:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com",
  "passwordHash": "$2b$10$..."
}
```

Depois que o usuário for salvo, reiniciar o backend não pode apagar sua conta.

---

## 4. Login

O login continua:

```http
POST /auth/login
```

Body:

```json
{
  "email": "alex@example.com",
  "password": "my-password"
}
```

Se as credenciais estiverem corretas, retornar algo como:

```json
{
  "token": "session-token",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alex@example.com"
  }
}
```

O frontend deve salvar o token e as informações necessárias para manter a sessão.

---

## 5. Login persistente no frontend

O usuário não deve precisar fazer login novamente depois de dar refresh na página.

Exemplo:

```text
usuário faz login

        ↓

frontend salva token

        ↓

usuário pressiona F5

        ↓

frontend inicia

        ↓

token ainda existe

        ↓

frontend valida token com backend

        ↓

usuário continua logado
```

Pode ser utilizado:

```text
localStorage
```

para persistir o token.

Exemplo:

```text
authToken
```

---

## 6. Validação da sessão

Ao iniciar a aplicação, se existir token salvo, o frontend deve chamar:

```http
GET /me
```

Header:

```http
Authorization: Bearer TOKEN
```

Se o token for válido:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com"
}
```

O usuário continua logado.

Se retornar:

```http
401 Unauthorized
```

o frontend deve:

```text
remover token
voltar para tela de login
```

---

## 7. Lista de usuários disponíveis

O usuário não deve mais precisar digitar manualmente o UUID do destinatário.

Adicionar um endpoint:

```http
GET /users
```

Essa rota deve exigir autenticação.

Exemplo:

```http
GET /users
Authorization: Bearer TOKEN
```

Resposta:

```json
[
  {
    "id": "994c88af-37d1-44d7-a014-f18063f906df",
    "email": "joao@example.com"
  },
  {
    "id": "7da70552-654c-4c44-b9b4-c9bc57566d4e",
    "email": "maria@example.com"
  }
]
```

Nunca retornar:

```text
password
passwordHash
token
```

---

## 8. Não mostrar o próprio usuário

A lista de usuários disponíveis não deve incluir o próprio usuário logado.

Exemplo:

Usuário atual:

```text
alex@example.com
```

Backend possui:

```text
alex@example.com
joao@example.com
maria@example.com
```

Resposta de:

```http
GET /users
```

deve ser:

```json
[
  {
    "id": "uuid-joao",
    "email": "joao@example.com"
  },
  {
    "id": "uuid-maria",
    "email": "maria@example.com"
  }
]
```

---

## 9. Seleção de destinatário

O frontend deve buscar os usuários disponíveis no backend e mostrar uma lista.

Exemplo:

```text
Send message to:

[ joao@example.com  v ]
```

Ou:

```text
Users

( ) joao@example.com
( ) maria@example.com
( ) pedro@example.com
```

O usuário deve selecionar pelo email.

O UUID não precisa aparecer para o usuário.

---

## 10. UUID invisível para o usuário

O frontend deve trabalhar com uma estrutura semelhante a:

```json
{
  "id": "994c88af-37d1-44d7-a014-f18063f906df",
  "email": "joao@example.com"
}
```

Na interface:

```text
joao@example.com
```

Internamente:

```text
994c88af-37d1-44d7-a014-f18063f906df
```

Quando o usuário selecionar:

```text
joao@example.com
```

o frontend deve guardar o `id` correspondente.

---

## 11. Envio de mensagem

A request continua utilizando UUID.

```http
POST /messages
```

Header:

```http
Authorization: Bearer TOKEN
```

Body:

```json
{
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!"
}
```

Não enviar:

```json
{
  "to": "joao@example.com"
}
```

O email existe apenas para facilitar a interação no frontend.

A comunicação entre frontend e backend continua utilizando IDs.

---

## 12. Estrutura da mensagem

Agora toda mensagem deve conter a data e hora em que foi enviada.

Exemplo:

```json
{
  "id": "10df1964-d496-4cb0-93e1-d34140365351",
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!",
  "createdAt": "2026-09-18T18:30:45.000Z"
}
```

O horário deve ser criado pelo backend.

O frontend não deve decidir o horário da mensagem.

---

## 13. createdAt

Ao receber:

```http
POST /messages
```

o backend deve criar:

```ts
createdAt: new Date().toISOString();
```

ou equivalente.

Exemplo:

```text
2026-09-18T18:30:45.000Z
```

Isso garante um formato padronizado.

---

## 14. Persistência das mensagens

Nesta fase as mensagens não devem mais desaparecer depois de serem lidas.

Antes:

```text
GET /messages

        ↓

retorna mensagens

        ↓

remove mensagens
```

Agora:

```text
GET /messages

        ↓

retorna mensagens

        ↓

mensagens continuam armazenadas
```

Uma mensagem deve poder ser consultada novamente quantas vezes forem necessárias.

---

## 15. Armazenamento das mensagens

As mensagens podem continuar em memória nesta fase.

Exemplo:

```ts
const messages = [];
```

Porém, se quiser manter consistência com os usuários, também é permitido persistir mensagens em JSON.

Exemplo:

```text
data/
  users.json
  messages.json
```

A persistência obrigatória nesta fase é a dos usuários.

---

## 16. Buscar mensagens

O endpoint continua:

```http
GET /messages
```

Header:

```http
Authorization: Bearer TOKEN
```

O backend deve identificar o usuário atual e retornar suas mensagens.

Exemplo:

```json
[
  {
    "id": "message-1",
    "from": "uuid-alex",
    "to": "uuid-joao",
    "text": "Hello!",
    "createdAt": "2026-09-18T18:30:45.000Z"
  },
  {
    "id": "message-2",
    "from": "uuid-maria",
    "to": "uuid-joao",
    "text": "Hey!",
    "createdAt": "2026-09-18T18:35:10.000Z"
  }
]
```

Essas mensagens não devem ser removidas.

Um segundo:

```http
GET /messages
```

deve continuar retornando essas mensagens.

---

## 17. Mostrar email do remetente

O frontend não deve mostrar:

```text
550e8400-e29b-41d4-a716-446655440000
```

para identificar quem enviou a mensagem.

Deve mostrar o email.

Exemplo:

```text
alex@example.com
18/09/2026 19:30

Hello!
```

O backend pode retornar o email do remetente junto da mensagem.

Exemplo:

```json
{
  "id": "message-1",
  "fromId": "550e8400-e29b-41d4-a716-446655440000",
  "fromEmail": "alex@example.com",
  "text": "Hello!",
  "createdAt": "2026-09-18T18:30:45.000Z"
}
```

O UUID continua existindo internamente, mas não precisa aparecer na interface.

---

## 18. Interface das mensagens

Exemplo:

```text
Messages

--------------------------------

alex@example.com
18/09/2026 19:30

Hello João!

--------------------------------

maria@example.com
18/09/2026 19:35

Are you there?

--------------------------------
```

Cada mensagem deve mostrar pelo menos:

```text
email do remetente
data
hora
texto
```

---

## 19. Formatação da data

O backend deve armazenar a data em formato padrão.

Exemplo:

```text
2026-09-18T18:30:45.000Z
```

O frontend pode formatar para algo mais amigável.

Exemplo:

```text
18/09/2026 19:30
```

A apresentação pode utilizar o timezone local do navegador.

---

## 20. Logs em todas as rotas

Todas as rotas devem registrar um log quando forem chamadas.

Sem exceção.

Exemplos:

```text
POST /auth/register
POST /auth/login
GET /me
GET /users
POST /messages
GET /messages
GET /health
```

Todas devem possuir log de entrada.

---

## 21. Log básico

Exemplo:

```text
[2026-09-18T18:30:45.000Z] POST /messages
```

Também deve ser possível ver informações úteis da request.

Exemplo:

```text
[2026-09-18T18:30:45.000Z] POST /messages

body:
{
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!"
}
```

---

## 22. Nunca logar senha

Apesar da exigência de logs, informações sensíveis não devem aparecer.

Não fazer:

```text
POST /auth/login

email: alex@example.com
password: my-secret-password
```

Pode fazer:

```text
POST /auth/login

email: alex@example.com
```

Ou:

```text
POST /auth/login

body:
{
  "email": "alex@example.com",
  "password": "[REDACTED]"
}
```

---

## 23. Logs de entrada e saída

Além do log quando a rota é chamada, registrar também o resultado.

Exemplo:

```text
[18:30:45] POST /messages

request:
{
  "to": "uuid-joao",
  "text": "Hello!"
}

response:
201 Created

{
  "id": "message-id",
  "createdAt": "2026-09-18T18:30:45.000Z"
}
```

---

## 24. Logs com usuário autenticado

Para rotas protegidas, incluir o usuário quando possível.

Exemplo:

```text
[2026-09-18T18:30:45.000Z]
POST /messages
user: alex@example.com
```

Isso facilita entender quem fez cada request.

---

## 25. Middleware de logging

Evitar colocar manualmente:

```ts
console.log(...)
```

em todas as rotas.

Criar um middleware global.

Conceitualmente:

```text
request chega

        ↓

logging middleware

        ↓

registra:
method
url
horário

        ↓

rota executa
```

Exemplo:

```text
[2026-09-18T18:30:45.000Z] GET /users
[2026-09-18T18:30:47.000Z] POST /messages
[2026-09-18T18:30:49.000Z] GET /messages
```

---

## 26. Logs específicos da rota

Além do middleware geral, rotas podem adicionar informações relevantes.

Exemplo:

```text
GET /users

Authenticated user:
alex@example.com

Returning:
3 users
```

Ou:

```text
GET /messages

Authenticated user:
joao@example.com

Returning:
5 messages
```

---

## 27. Health Check

Manter:

```http
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

Essa rota também deve gerar log.

Exemplo:

```text
[2026-09-18T18:35:00.000Z] GET /health
```

---

## 28. Fluxo de inicialização do frontend

Quando a aplicação abrir:

```text
frontend inicia

        ↓

verifica localStorage

        ↓

existe token?
```

Se não:

```text
mostrar login
```

Se sim:

```text
GET /me
```

Se válido:

```text
salvar usuário atual em memória

        ↓

GET /users

        ↓

mostrar messenger
```

Se inválido:

```text
remover token

        ↓

mostrar login
```

---

## 29. Fluxo de envio

```text
usuário seleciona:

joao@example.com

        ↓

frontend encontra:

{
  id: "uuid-joao",
  email: "joao@example.com"
}

        ↓

usuário escreve:

Hello!

        ↓

POST /messages

{
  "to": "uuid-joao",
  "text": "Hello!"
}

        ↓

backend identifica remetente pelo token

        ↓

backend adiciona:

createdAt

        ↓

mensagem é salva
```

---

## 30. Fluxo de leitura

```text
usuário clica:

Check Messages

        ↓

GET /messages

        ↓

backend identifica usuário pelo token

        ↓

busca mensagens

        ↓

adiciona informações do remetente

        ↓

retorna mensagens

        ↓

mensagens NÃO são removidas

        ↓

frontend mostra:

email
data
hora
texto
```

---

## 31. Interface sugerida

```text
--------------------------------------------------

Logged in as:
alex@example.com

[ Logout ]

--------------------------------------------------

Send message

To:

[ joao@example.com        v ]

Message:

[ Hello João!               ]

[ Send ]

--------------------------------------------------

Messages

[ Check Messages ]

--------------------------------------------------

joao@example.com
18/09/2026 19:20

Hey Alex!

--------------------------------------------------

maria@example.com
18/09/2026 19:25

Hello!

--------------------------------------------------
```

---

## 32. Rotas esperadas

Ao final da fase, a API deve possuir pelo menos:

```text
POST /auth/register
POST /auth/login

GET /me

GET /users

POST /messages
GET /messages

GET /health
```

---

## 33. Rotas públicas

```text
POST /auth/register
POST /auth/login
GET /health
```

---

## 34. Rotas protegidas

```text
GET /me
GET /users
POST /messages
GET /messages
```

Todas devem exigir:

```http
Authorization: Bearer TOKEN
```

---

## 35. Estrutura sugerida

```text
backend/
  src/
    server.ts

    routes/
      auth.ts
      users.ts
      messages.ts

    middleware/
      auth.ts
      logger.ts

    services/
      users.ts
      messages.ts

    store/
      users.ts
      messages.ts

  data/
    users.json
```

Se mensagens também forem persistidas:

```text
data/
  users.json
  messages.json
```

---

## 36. Regras de segurança

Continuar seguindo:

- Nunca armazenar senha em texto puro.
- Nunca retornar `passwordHash`.
- Nunca logar senha.
- Nunca confiar no `from` enviado pelo frontend.
- O remetente deve vir da sessão.
- Rotas privadas devem exigir autenticação.
- Usuário não pode consultar mensagens de outro usuário.
- Email pode aparecer na interface.
- UUID deve permanecer como identificador interno.

---

## 37. Regras da Fase 4

- Usuários devem ser persistidos em JSON.
- Reiniciar o backend não pode apagar usuários.
- Utilizar uma biblioteca para facilitar a persistência JSON.
- O UUID do usuário continua sendo gerado pelo backend.
- O frontend não deve mais exigir que o usuário digite UUID do destinatário.
- O frontend deve buscar usuários disponíveis usando `GET /users`.
- A lista deve mostrar emails.
- O próprio usuário não deve aparecer como destinatário.
- Ao selecionar um email, o frontend deve manter internamente o UUID correspondente.
- Requests de envio devem continuar utilizando UUID.
- Email não deve substituir UUID como identificador interno.
- Mensagens devem possuir `createdAt`.
- O horário deve ser gerado pelo backend.
- O frontend deve mostrar data e hora da mensagem.
- O frontend deve mostrar o email do remetente.
- `GET /messages` não deve mais apagar mensagens.
- Mensagens devem continuar disponíveis depois de serem lidas.
- O login deve persistir após F5.
- O frontend deve validar o token usando `GET /me`.
- Todas as rotas devem gerar log ao serem chamadas.
- Logs devem incluir horário, método e rota.
- Rotas devem registrar informações úteis de entrada e saída.
- Senhas nunca devem aparecer nos logs.

---

## 38. Critérios de conclusão

A Fase 4 está completa quando for possível:

1. Criar um usuário.
2. Reiniciar o backend.
3. Fazer login novamente com esse mesmo usuário.
4. Confirmar que sua conta continua existindo.
5. Criar pelo menos dois usuários diferentes.
6. Fazer login com um deles.
7. Abrir a lista de destinatários.
8. Ver o email dos outros usuários.
9. Não ver o próprio usuário na lista.
10. Selecionar um destinatário pelo email.
11. Confirmar que nenhum UUID precisa ser digitado manualmente.
12. Enviar uma mensagem.
13. Confirmar que a request usa o UUID do destinatário.
14. Confirmar que o backend adicionou `createdAt`.
15. Fazer login com o destinatário.
16. Buscar mensagens.
17. Ver o email do remetente.
18. Ver data e hora.
19. Ver o texto da mensagem.
20. Buscar mensagens novamente.
21. Confirmar que a mensagem ainda aparece.
22. Dar F5 no navegador.
23. Confirmar que o usuário continua logado.
24. Confirmar que ainda consegue enviar mensagens.
25. Verificar os logs do backend.
26. Confirmar que todas as rotas chamadas aparecem nos logs.
27. Confirmar que senha ou `passwordHash` não aparecem nos logs.

---

## Resultado esperado

Ao final da Fase 4, o sistema deve ter uma experiência significativamente mais próxima de um messenger real.

O usuário passa a enxergar:

```text
emails
mensagens
datas
horários
```

Enquanto detalhes internos como UUID continuam escondidos.

Exemplo:

```text
Logged in as:
alex@example.com

Send to:
joao@example.com

----------------------------

joao@example.com
18/09/2026 19:30

Hey Alex!

----------------------------

maria@example.com
18/09/2026 19:35

Hello!
```

Internamente, a aplicação continua utilizando UUIDs para identificar os usuários, mas esses detalhes deixam de fazer parte da interação normal da interface.
