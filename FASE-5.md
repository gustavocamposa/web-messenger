# Real-Time Messenger Challenge — Fase 5

## Objetivo

Nesta fase, o messenger deixa de depender de ações manuais para receber novas mensagens e passa a funcionar realmente em tempo real.

Até agora, o frontend precisava buscar as mensagens através de uma requisição HTTP.

Agora vamos introduzir:

- Comunicação em tempo real usando WebSocket.
- Entrega imediata de novas mensagens.
- Indicação de usuários online e offline.
- Lista de conversas.
- Histórico de mensagens por conversa.
- Exibição das últimas 50 mensagens.
- Carregamento automático das últimas 50 mensagens ao abrir uma conversa.
- Persistência permanente de todas as mensagens no backend.
- Middleware de logging centralizado.
- Logs para HTTP e eventos importantes relacionados ao WebSocket.

O objetivo é deixar a aplicação com uma arquitetura e experiência muito mais próximas de um messenger real.

---

# 1. Arquitetura geral

Até agora o fluxo principal era baseado em HTTP:

```text
User A

POST /messages

        ↓

Backend salva mensagem

        ↓

User B

GET /messages

        ↓

Backend retorna mensagens
```

Agora o envio continuará podendo utilizar HTTP:

```text
User A

POST /messages

        ↓

Backend salva mensagem

        ↓

Backend verifica se User B está online

        ↓

WebSocket

        ↓

User B recebe mensagem imediatamente
```

O WebSocket não substitui necessariamente toda a API HTTP.

Nesta fase teremos duas formas de comunicação:

```text
HTTP
- login
- buscar usuário atual
- buscar conversas
- buscar histórico
- enviar mensagem

WebSocket
- receber novas mensagens
- receber mudanças de online/offline
```

---

# 2. WebSocket

O backend deve possuir um servidor WebSocket.

Pode ser utilizada uma biblioteca como:

```text
ws
```

ou:

```text
socket.io
```

ou outra biblioteca equivalente.

O objetivo é manter uma conexão permanente entre frontend e backend enquanto o usuário estiver utilizando o messenger.

---

# 3. Conexão WebSocket

Depois que o usuário estiver autenticado, o frontend deve abrir uma conexão WebSocket com o backend.

Exemplo conceitual:

```text
login realizado

        ↓

token salvo

        ↓

frontend conecta ao WebSocket

        ↓

backend autentica conexão

        ↓

conexão associada ao usuário
```

O backend precisa saber qual usuário pertence a cada conexão.

---

# 4. Autenticação do WebSocket

O WebSocket deve utilizar a identidade autenticada do usuário.

O cliente não deve simplesmente enviar:

```json
{
  "userId": "uuid-qualquer"
}
```

e o backend confiar nisso.

A conexão deve ser autenticada usando o token da sessão.

Exemplo conceitual:

```text
WebSocket connection
        +
auth token

        ↓

backend valida token

        ↓

backend encontra:

{
  id: "uuid-alex",
  email: "alex@example.com"
}

        ↓

socket pertence ao Alex
```

Se o token for inválido, a conexão deve ser recusada ou encerrada.

---

# 5. Estado das conexões

O backend deve manter uma estrutura para saber quais usuários estão conectados.

Exemplo conceitual:

```text
connectedUsers

uuid-alex -> websocket connection
uuid-joao -> websocket connection
uuid-maria -> websocket connection
```

A implementação exata fica livre.

Pode ser:

```ts
Map<string, WebSocket>
```

ou outra estrutura equivalente.

---

# 6. Usuário online

Um usuário deve ser considerado online quando possuir uma conexão WebSocket ativa com o backend.

Exemplo:

```text
Alex abre aplicação

        ↓

WebSocket conecta

        ↓

Alex = ONLINE
```

---

# 7. Usuário offline

Quando a conexão WebSocket for encerrada:

```text
fechou navegador
fechou aba
perdeu conexão
logout
backend detectou disconnect
```

o usuário deve passar para:

```text
OFFLINE
```

---

# 8. Lista de usuários com status

A lista de usuários deve mostrar se cada usuário está online ou offline.

Exemplo:

```text
Users

● joao@example.com
  Online

○ maria@example.com
  Offline

● pedro@example.com
  Online
```

Não é obrigatório utilizar exatamente esse design.

O importante é mostrar claramente:

```text
email
status online/offline
```

---

# 9. Atualização de presença em tempo real

O status online/offline deve atualizar automaticamente.

Exemplo:

```text
Alex está vendo:

João - Offline
```

João abre o messenger.

O backend detecta:

```text
joao@example.com connected
```

O backend deve notificar os outros usuários conectados.

Alex deve passar a ver:

```text
João - Online
```

sem precisar atualizar a página.

---

# 10. Eventos de presença

Uma possibilidade é utilizar eventos como:

```text
user_online
user_offline
```

Exemplo:

```json
{
  "type": "user_online",
  "userId": "994c88af-37d1-44d7-a014-f18063f906df"
}
```

E:

```json
{
  "type": "user_offline",
  "userId": "994c88af-37d1-44d7-a014-f18063f906df"
}
```

O formato fica livre.

---

# 11. Lista de conversas

A interface não deve mais ser focada apenas em:

```text
selecionar usuário
enviar mensagem
ver todas as mensagens
```

Agora deve existir uma lista de conversas.

Exemplo:

```text
Conversations

--------------------------------

joao@example.com
Última mensagem aqui...

--------------------------------

maria@example.com
Outra mensagem...

--------------------------------

pedro@example.com
Hello!

--------------------------------
```

---

# 12. O que é uma conversa

Uma conversa representa as mensagens entre dois usuários.

Exemplo:

```text
Alex <-> João
```

Todas estas mensagens pertencem à mesma conversa:

```text
Alex -> João
João -> Alex
Alex -> João
João -> Alex
```

---

# 13. Identificação da conversa

Nesta fase não é obrigatório criar uma entidade `Conversation` no banco/JSON.

É possível considerar uma conversa como simplesmente:

```text
mensagens onde:

(from === A && to === B)

OU

(from === B && to === A)
```

Exemplo:

```text
Alex UUID:
aaa

João UUID:
bbb
```

A conversa contém:

```text
from aaa to bbb

+

from bbb to aaa
```

---

# 14. Endpoint para lista de conversas

Criar um endpoint:

```http
GET /conversations
```

Essa rota deve exigir autenticação.

Exemplo:

```http
GET /conversations
Authorization: Bearer TOKEN
```

O backend deve descobrir com quais usuários o usuário atual possui mensagens.

---

# 15. Resposta da lista de conversas

Uma resposta possível:

```json
[
  {
    "user": {
      "id": "uuid-joao",
      "email": "joao@example.com"
    },
    "lastMessage": {
      "text": "See you tomorrow!",
      "createdAt": "2026-09-23T16:30:00.000Z"
    }
  },
  {
    "user": {
      "id": "uuid-maria",
      "email": "maria@example.com"
    },
    "lastMessage": {
      "text": "Hello!",
      "createdAt": "2026-09-23T15:20:00.000Z"
    }
  }
]
```

O formato pode variar.

---

# 16. Ordenação das conversas

As conversas devem ser ordenadas pela mensagem mais recente.

Exemplo:

```text
João
16:40

Maria
15:30

Pedro
ontem
```

Se João mandar uma nova mensagem:

```text
João
16:50
```

a conversa com João deve subir para o topo.

---

# 17. Usuários sem conversa

Ainda deve existir alguma forma de iniciar uma conversa com outro usuário.

Por exemplo:

```text
New conversation

[ maria@example.com ]
```

Ou uma lista:

```text
Users

joao@example.com
maria@example.com
pedro@example.com
```

Ao selecionar um usuário sem histórico, o chat deve simplesmente começar vazio.

---

# 18. Tela principal sugerida

A aplicação pode seguir aproximadamente:

```text
------------------------------------------------------
| Conversations        | joao@example.com            |
|                      | Online                      |
| João                 |                             |
| See you tomorrow     | Hey!                        |
|                      |                    Hello!   |
| Maria                |                             |
| Hello                | Are you coming?             |
|                      |                             |
| Pedro                |                    Yes      |
| What's up?           |                             |
|                      |                             |
|                      | [ Write a message... ] Send |
------------------------------------------------------
```

Não é necessário copiar o design.

O foco é o comportamento.

---

# 19. Histórico por conversa

Ao selecionar uma conversa, o frontend deve buscar o histórico entre os dois usuários.

Criar um endpoint semelhante a:

```http
GET /conversations/:userId/messages
```

Exemplo:

```http
GET /conversations/994c88af-37d1-44d7-a014-f18063f906df/messages
```

O backend deve:

1. Identificar o usuário autenticado.
2. Encontrar o outro usuário pelo `userId`.
3. Buscar mensagens entre os dois.
4. Ordenar por data.
5. Retornar apenas as últimas 50 mensagens.

---

# 20. Últimas 50 mensagens

O backend pode guardar milhares de mensagens.

O frontend não deve carregar todas elas de uma vez.

Ao abrir uma conversa:

```text
GET /conversations/:userId/messages
```

deve retornar:

```text
no máximo 50 mensagens
```

Sempre as 50 mais recentes.

---

# 21. Exemplo

Suponha que Alex e João tenham:

```text
327 mensagens
```

O backend deve guardar:

```text
327 mensagens
```

Mas ao abrir a conversa deve retornar apenas:

```text
mensagens 278 até 327
```

Ou seja:

```text
as últimas 50
```

---

# 22. Backend nunca deve apagar mensagens antigas

A regra é:

> O backend guarda todas as mensagens para sempre.

Se existirem:

```text
10 mensagens
```

guardar 10.

Se existirem:

```text
1000 mensagens
```

guardar 1000.

Se existirem:

```text
100000 mensagens
```

guardar 100000.

Nesta fase não é necessário implementar limpeza de histórico.

---

# 23. Persistência das mensagens

As mensagens já persistidas nas fases anteriores devem continuar persistidas.

Reiniciar o backend não pode apagar mensagens.

Exemplo:

```text
Alex envia 20 mensagens para João

        ↓

backend salva

        ↓

backend é desligado

        ↓

backend inicia novamente

        ↓

Alex abre João

        ↓

as mensagens continuam existindo
```

---

# 24. Estrutura da mensagem

Uma mensagem pode continuar seguindo:

```json
{
  "id": "10df1964-d496-4cb0-93e1-d34140365351",
  "from": "uuid-alex",
  "to": "uuid-joao",
  "text": "Hello!",
  "createdAt": "2026-09-23T16:40:00.000Z"
}
```

O `createdAt` continua sendo criado pelo backend.

---

# 25. Ordenação das mensagens

As mensagens devem aparecer em ordem cronológica.

Exemplo:

```text
16:30
Hello

16:31
Hey!

16:32
How are you?
```

O backend deve retornar mensagens ordenadas por:

```text
createdAt
```

---

# 26. Carregamento inicial do chat

Quando o usuário clicar em:

```text
joao@example.com
```

o frontend deve imediatamente buscar:

```http
GET /conversations/:userId/messages
```

e mostrar as últimas 50 mensagens.

Não deve existir mais um botão:

```text
Check Messages
```

para essa funcionalidade.

---

# 27. Quando conecta ao messenger

Quando o usuário entra no messenger depois do login, a aplicação deve carregar automaticamente sua lista de conversas.

Fluxo:

```text
login

        ↓

GET /me

        ↓

WebSocket conecta

        ↓

GET /conversations

        ↓

frontend mostra conversas
```

---

# 28. Primeira conversa selecionada

Se existir uma conversa selecionada ao iniciar a aplicação, ou se o frontend decidir abrir automaticamente uma conversa, deve buscar:

```text
últimas 50 mensagens
```

imediatamente.

O usuário nunca deve precisar apertar um botão para buscar o histórico.

---

# 29. Mensagens em tempo real

Depois que o histórico inicial foi carregado, novas mensagens devem chegar pelo WebSocket.

Exemplo:

```text
Alex está com conversa de João aberta.

Histórico:

João: Hello
Alex: Hi
João: What's up?
```

João envia:

```text
Are you there?
```

O backend salva a mensagem.

Depois envia pelo WebSocket:

```json
{
  "type": "message",
  "message": {
    "id": "message-uuid",
    "from": "uuid-joao",
    "to": "uuid-alex",
    "text": "Are you there?",
    "createdAt": "2026-09-23T16:45:00.000Z"
  }
}
```

O frontend deve mostrar imediatamente:

```text
João: Are you there?
```

Sem fazer F5.

Sem clicar em nenhum botão.

Sem fazer polling.

---

# 30. WebSocket não é armazenamento

Uma regra importante:

> WebSocket serve para entrega em tempo real. O armazenamento continua sendo responsabilidade do backend.

O fluxo correto é:

```text
mensagem chega ao backend

        ↓

backend valida

        ↓

backend salva permanentemente

        ↓

backend envia via WebSocket
```

Não fazer:

```text
backend envia pelo WebSocket

        ↓

depois tenta salvar
```

A mensagem deve estar persistida antes de ser considerada enviada.

---

# 31. Usuário offline

Se o destinatário estiver offline:

```text
Alex envia para João

João = offline
```

O backend deve:

```text
salvar mensagem normalmente
```

Não existe problema se o WebSocket não puder entregar naquele momento.

Quando João voltar:

```text
João faz login

        ↓

abre conversa com Alex

        ↓

GET /conversations/alex/messages

        ↓

recebe as últimas 50 mensagens
```

Assim nenhuma mensagem é perdida.

---

# 32. Usuário online

Se João estiver online:

```text
Alex envia mensagem

        ↓

backend salva

        ↓

backend encontra conexão de João

        ↓

WebSocket envia mensagem

        ↓

frontend João atualiza imediatamente
```

---

# 33. Atualização da lista de conversas

Quando uma nova mensagem chega, a lista de conversas também deve atualizar.

Exemplo:

Antes:

```text
Maria
15:30
Hello!

João
15:20
Hey
```

João envia uma mensagem às 16:45.

A lista deve se tornar:

```text
João
16:45
Are you there?

Maria
15:30
Hello!
```

Não deve ser necessário buscar todas as conversas manualmente novamente.

---

# 34. Mensagem enviada pelo próprio usuário

Quando o usuário enviar uma mensagem:

```text
Alex -> João
```

o frontend pode adicionar a mensagem ao chat assim que o backend confirmar o envio.

Por exemplo:

```http
POST /messages
```

Resposta:

```json
{
  "id": "message-id",
  "from": "uuid-alex",
  "to": "uuid-joao",
  "text": "Hello!",
  "createdAt": "2026-09-23T16:50:00.000Z"
}
```

O frontend adiciona essa mensagem na conversa atual.

---

# 35. Evitar mensagens duplicadas

É possível que uma mensagem apareça através de:

```text
resposta do POST
```

e também:

```text
evento WebSocket
```

O frontend não deve mostrar a mesma mensagem duas vezes.

Todas as mensagens possuem:

```text
id
```

Esse ID deve ser utilizado para identificar mensagens duplicadas.

Exemplo:

```text
message.id já existe no frontend?

sim
→ não adicionar novamente

não
→ adicionar
```

---

# 36. Limite visual de 50 mensagens

O chat deve sempre mostrar no máximo as últimas:

```text
50 mensagens
```

Exemplo:

O usuário abre a conversa:

```text
50 mensagens
```

Uma nova mensagem chega:

```text
51 mensagens
```

O frontend pode remover da tela a mais antiga e continuar mostrando:

```text
50 mensagens
```

A mensagem removida da interface NÃO deve ser apagada do backend.

---

# 37. Importante: limite de UI != limite de armazenamento

Frontend:

```text
últimas 50
```

Backend:

```text
todas para sempre
```

Exemplo:

```text
Backend:
528 mensagens

Frontend:
50 mensagens
```

---

# 38. Persistência e fonte da verdade

O backend deve ser considerado a fonte da verdade das mensagens.

O frontend não precisa manter o histórico completo no `localStorage`.

Ao atualizar a página:

```text
F5

        ↓

frontend restaura login

        ↓

reconecta WebSocket

        ↓

busca conversas

        ↓

busca últimas 50 mensagens

        ↓

estado reconstruído pelo backend
```

---

# 39. Reconexão após F5

Como o login já é persistente:

```text
F5

        ↓

token continua salvo

        ↓

GET /me

        ↓

usuário continua autenticado

        ↓

WebSocket conecta novamente

        ↓

usuário fica online novamente
```

---

# 40. Perda temporária de conexão

Se o WebSocket cair, o frontend deve detectar.

Exemplo:

```text
WebSocket disconnected
```

A aplicação não deve necessariamente deslogar o usuário.

Pode mostrar:

```text
Reconnecting...
```

e tentar abrir novamente a conexão.

Não é obrigatório implementar uma estratégia complexa de retry, mas deve existir pelo menos tentativa de reconexão.

---

# 41. Estado da conexão

Opcionalmente, mostrar na interface:

```text
Connected
```

ou:

```text
Reconnecting...
```

ou:

```text
Disconnected
```

Isso ajuda durante o desenvolvimento.

---

# 42. Middleware de logger

Os logs não devem mais depender de vários:

```ts
console.log(...)
```

espalhados pelas rotas.

Criar um middleware centralizado de logging.

Exemplo:

```text
middleware/
  logger.ts
```

Todas as requests HTTP devem passar por esse middleware.

---

# 43. Informações do logger HTTP

Cada request deve registrar pelo menos:

```text
timestamp
HTTP method
path
status code
tempo de execução
```

Exemplo:

```text
[2026-09-23T16:50:10.000Z]
POST /messages
201
12ms
```

Ou:

```text
[2026-09-23T16:50:10.000Z] POST /messages -> 201 (12ms)
```

---

# 44. Usuário autenticado no log

Quando possível, também mostrar:

```text
user
```

Exemplo:

```text
[2026-09-23T16:50:10.000Z]
POST /messages
user=alex@example.com
status=201
duration=12ms
```

---

# 45. Request body nos logs

Pode ser útil logar determinados dados recebidos.

Exemplo:

```text
POST /messages

body:
{
  "to": "uuid-joao",
  "text": "Hello!"
}
```

Mas nunca incluir informações sensíveis.

---

# 46. Dados que nunca devem aparecer nos logs

Não logar:

```text
senha
passwordHash
token completo
Authorization header completo
```

Exemplo errado:

```text
Authorization: Bearer eyJhbGciOiJI...
```

Exemplo melhor:

```text
authenticated=true
user=alex@example.com
```

---

# 47. Logs do WebSocket

O logger HTTP não consegue cobrir eventos WebSocket.

Por isso, eventos importantes de WebSocket também devem produzir logs.

Exemplo:

```text
[2026-09-23T16:55:00.000Z]
WS CONNECT
user=alex@example.com
```

Quando desconectar:

```text
[2026-09-23T17:10:00.000Z]
WS DISCONNECT
user=alex@example.com
```

---

# 48. Log de entrega em tempo real

Quando uma mensagem for entregue pelo WebSocket:

```text
[2026-09-23T16:56:00.000Z]
WS MESSAGE DELIVERY
message=message-id
from=alex@example.com
to=joao@example.com
```

Não é necessário logar o conteúdo da mensagem se não quiser.

---

# 49. Estrutura sugerida

Uma estrutura possível:

```text
backend/
  src/
    server.ts

    routes/
      auth.ts
      users.ts
      messages.ts
      conversations.ts

    middleware/
      auth.ts
      logger.ts

    services/
      auth.ts
      users.ts
      messages.ts
      conversations.ts

    websocket/
      server.ts
      connections.ts

    store/
      users.ts
      messages.ts

  data/
    users.json
    messages.json
```

Não é obrigatório seguir exatamente essa estrutura.

---

# 50. Separação de responsabilidades

Evitar colocar tudo dentro de:

```text
server.ts
```

Por exemplo:

```text
routes
```

devem cuidar de HTTP.

```text
services
```

devem cuidar da lógica.

```text
store
```

deve cuidar da persistência.

```text
websocket
```

deve cuidar das conexões em tempo real.

```text
middleware
```

deve cuidar de funcionalidades comuns como:

```text
auth
logging
```

---

# 51. Rotas esperadas

Nesta fase a API pode possuir:

```text
POST /auth/register
POST /auth/login

GET /me

GET /users

GET /conversations
GET /conversations/:userId/messages

POST /messages

GET /health
```

---

# 52. GET /conversations

Exemplo:

```http
GET /conversations
Authorization: Bearer TOKEN
```

Retorna usuários com quem existe uma conversa.

Exemplo:

```json
[
  {
    "user": {
      "id": "uuid-joao",
      "email": "joao@example.com"
    },
    "lastMessage": {
      "id": "message-10",
      "text": "See you tomorrow!",
      "createdAt": "2026-09-23T16:40:00.000Z"
    }
  }
]
```

---

# 53. GET /conversations/:userId/messages

Exemplo:

```http
GET /conversations/uuid-joao/messages
Authorization: Bearer TOKEN
```

Retorna no máximo:

```text
50 mensagens
```

Exemplo:

```json
[
  {
    "id": "message-1",
    "from": "uuid-alex",
    "to": "uuid-joao",
    "text": "Hello!",
    "createdAt": "2026-09-23T16:30:00.000Z"
  },
  {
    "id": "message-2",
    "from": "uuid-joao",
    "to": "uuid-alex",
    "text": "Hey!",
    "createdAt": "2026-09-23T16:31:00.000Z"
  }
]
```

---

# 54. POST /messages

Exemplo:

```http
POST /messages
Authorization: Bearer TOKEN
```

Body:

```json
{
  "to": "uuid-joao",
  "text": "Hello!"
}
```

Backend:

```text
valida usuário

        ↓

valida destinatário

        ↓

cria message.id

        ↓

cria createdAt

        ↓

salva permanentemente

        ↓

retorna mensagem

        ↓

se destinatário estiver online:

envia pelo WebSocket
```

---

# 55. Fluxo completo com usuários online

```text
Alex escreve:
"Hello João"

        ↓

POST /messages

        ↓

backend autentica Alex

        ↓

backend cria:

id
from
to
text
createdAt

        ↓

backend persiste mensagem

        ↓

backend responde para Alex

        ↓

backend detecta João online

        ↓

WebSocket envia mensagem para João

        ↓

frontend João adiciona mensagem ao chat

        ↓

frontend João atualiza lista de conversas
```

---

# 56. Fluxo completo com usuário offline

```text
Alex escreve:
"Hello João"

        ↓

POST /messages

        ↓

backend salva mensagem

        ↓

João está offline

        ↓

nenhuma entrega WebSocket

        ↓

mensagem continua salva

        ↓

João entra depois

        ↓

WebSocket conecta

        ↓

João abre conversa com Alex

        ↓

GET /conversations/alex/messages

        ↓

mensagem aparece
```

---

# 57. Fluxo ao abrir a aplicação

```text
frontend inicia

        ↓

token existe?

        ↓

GET /me

        ↓

usuário autenticado

        ↓

conectar WebSocket

        ↓

GET /conversations

        ↓

mostrar lista de conversas

        ↓

usuário seleciona conversa

        ↓

GET /conversations/:userId/messages

        ↓

mostrar últimas 50 mensagens
```

---

# 58. Fluxo de logout

Ao fazer logout:

```text
frontend fecha WebSocket

        ↓

backend detecta disconnect

        ↓

usuário fica offline

        ↓

frontend remove token

        ↓

volta para tela de login
```

---

# 59. Interface esperada

Uma interface possível:

```text
------------------------------------------------------------
| Conversations          | joao@example.com                |
|                        | ● Online                        |
| João                   |                                 |
| Are you there?   16:45 | João                 16:30     |
|                        | Hello!                          |
| Maria                  |                                 |
| Hello            15:20 |                  You  16:31    |
|                        |                  Hey!           |
| Pedro                  |                                 |
| See you          14:00 | João                 16:45     |
|                        | Are you there?                  |
|                        |                                 |
|                        | [ Write a message... ] [ Send ] |
------------------------------------------------------------
```

---

# 60. Regras de segurança

Continuar respeitando:

- Senhas armazenadas somente como hash.
- Nunca retornar `passwordHash`.
- Nunca confiar em `from` vindo do frontend.
- Remetente vem do usuário autenticado.
- WebSocket deve ser autenticado.
- Cliente não pode escolher arbitrariamente quem ele representa.
- Usuário não pode acessar conversa entre outros dois usuários.
- Usuário só pode buscar conversas das quais participa.
- Tokens não devem aparecer completos nos logs.
- Senhas nunca devem aparecer nos logs.

---

# 61. Regras da Fase 5

- Manter todos os requisitos importantes das fases anteriores.
- Mensagens devem continuar persistidas no backend.
- Backend deve guardar todas as mensagens permanentemente.
- Reiniciar backend não pode apagar mensagens.
- Adicionar WebSocket.
- Usuário autenticado deve abrir uma conexão WebSocket.
- WebSocket deve ser autenticado.
- Novas mensagens devem chegar em tempo real.
- Não deve existir necessidade de `Check Messages`.
- Usuários devem possuir estado online/offline.
- Estado deve ser baseado na conexão WebSocket.
- Mudanças de online/offline devem chegar em tempo real aos clientes.
- Deve existir lista de conversas.
- Conversas devem ser ordenadas pela mensagem mais recente.
- Deve ser possível iniciar conversa com usuário que ainda não possui histórico.
- Ao abrir uma conversa, buscar automaticamente seu histórico.
- Backend deve retornar no máximo as últimas 50 mensagens.
- Chat deve mostrar no máximo as últimas 50 mensagens.
- O backend NÃO deve apagar mensagens antigas por causa desse limite.
- Backend continua guardando todo o histórico.
- Ao dar F5, login deve continuar funcionando.
- Depois do F5, WebSocket deve reconectar.
- Depois do F5, conversas devem ser recuperadas do backend.
- Depois do F5, últimas 50 mensagens devem ser recuperadas novamente.
- Mensagens devem ser ordenadas por data.
- `createdAt` deve continuar sendo criado pelo backend.
- Mensagens devem possuir ID único.
- Frontend deve evitar mensagens duplicadas utilizando `message.id`.
- Se destinatário estiver offline, mensagem deve continuar persistida.
- Se destinatário estiver online, mensagem deve ser entregue imediatamente.
- Criar middleware centralizado de logger.
- Todas as rotas HTTP devem passar pelo logger.
- Logger deve registrar timestamp.
- Logger deve registrar método.
- Logger deve registrar path.
- Logger deve registrar status code.
- Logger deve registrar duração da request.
- Quando possível, logger deve identificar o usuário autenticado.
- Senhas e tokens não podem aparecer nos logs.
- Eventos importantes do WebSocket também devem gerar logs.
- Conexões e desconexões WebSocket devem gerar logs.

---

# 62. Critérios de conclusão

A Fase 5 está completa quando for possível:

1. Criar Alex e João.
2. Fazer login como Alex.
3. Confirmar que Alex aparece como online.
4. Fazer login como João em outro navegador.
5. Confirmar que João aparece como online para Alex sem F5.
6. Fechar o navegador de João.
7. Confirmar que João passa para offline no frontend de Alex.
8. Abrir João novamente.
9. Confirmar que João volta para online automaticamente.
10. Alex selecionar João.
11. Abrir a conversa.
12. Receber automaticamente as últimas 50 mensagens.
13. Não precisar clicar em `Check Messages`.
14. Alex enviar uma mensagem.
15. Confirmar que a mensagem foi persistida no backend.
16. Confirmar que João recebe a mensagem imediatamente via WebSocket.
17. Confirmar que João não precisou fazer nenhuma request manual para receber a nova mensagem.
18. Confirmar que a conversa com Alex sobe na lista de João.
19. Confirmar que a última mensagem aparece na lista de conversas.
20. João responder.
21. Confirmar que Alex recebe a resposta em tempo real.
22. Criar mais de 50 mensagens entre os dois.
23. Atualizar a página.
24. Abrir novamente a conversa.
25. Confirmar que apenas as últimas 50 mensagens aparecem.
26. Confirmar que as mensagens anteriores continuam armazenadas no backend.
27. Reiniciar o backend.
28. Fazer login novamente.
29. Confirmar que todo o histórico continua armazenado.
30. Confirmar que as últimas 50 mensagens continuam aparecendo.
31. Fazer login e pressionar F5.
32. Confirmar que o login continua válido.
33. Confirmar que o WebSocket reconecta.
34. Confirmar que o usuário volta a aparecer online.
35. Confirmar que mensagens não aparecem duplicadas após reconexão.
36. Verificar os logs.
37. Confirmar que todas as requests HTTP possuem logs.
38. Confirmar que conexões WebSocket possuem logs.
39. Confirmar que desconexões WebSocket possuem logs.
40. Confirmar que senhas e tokens não aparecem nos logs.

---

# Resultado esperado

Ao final da Fase 5, o projeto deve se comportar como um messenger real em seus aspectos fundamentais.

Antes:

```text
enviar mensagem

        ↓

outro usuário precisa clicar

Check Messages
```

Agora:

```text
enviar mensagem

        ↓

backend salva

        ↓

WebSocket

        ↓

mensagem aparece instantaneamente
```

O sistema passa a possuir:

```text
login persistente

usuários persistentes

mensagens persistentes

conversas

histórico

últimas 50 mensagens

comunicação em tempo real

online/offline

WebSocket

reconexão

logger centralizado
```

O backend continua sendo a fonte da verdade.

O WebSocket é utilizado para entregar mudanças em tempo real, enquanto HTTP continua sendo utilizado para carregar estado e histórico.

Essa separação deve permitir que o frontend seja reconstruído completamente apenas com os dados armazenados no backend sempre que a aplicação for aberta novamente.
