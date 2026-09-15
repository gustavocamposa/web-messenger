# Real-Time Messenger Challenge — Fase 3

## Objetivo

Evoluir a Fase 2 para adicionar contas de usuário reais no backend.

Nesta fase:

- O usuário não deve mais depender de um UUID salvo apenas no navegador.
- O usuário deve criar uma conta usando `email` e `senha`.
- O backend deve gerar e manter o UUID do usuário.
- O login deve recuperar a identidade correta do usuário.
- Os usuários agora ficam armazenados no backend.
- O frontend deve manter a sessão do usuário após login.
- As mensagens continuam sendo armazenadas no backend.
- Uma mensagem continua podendo ser entregue apenas uma vez.
- Ainda não é necessário usar banco de dados.
- Ainda não é necessário usar WebSocket.

O objetivo é começar a separar claramente:

```text
identidade do usuário
autenticação
mensagens
frontend
backend
```

---

# Visão geral

Antes:

```text
frontend gera UUID
        ↓
UUID fica salvo localmente
        ↓
frontend usa esse UUID nas mensagens
```

Agora:

```text
usuário cria conta

email + senha
        ↓

backend cria usuário
        ↓

backend gera UUID
        ↓

usuário faz login
        ↓

backend confirma identidade
        ↓

frontend recebe a sessão do usuário
```

O UUID agora pertence ao usuário no backend.

---

# Estrutura de usuário

O backend deve manter uma lista de usuários.

Exemplo:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com",
  "passwordHash": "..."
}
```

O campo:

```text
id
```

deve ser um UUID gerado pelo servidor.

O email será utilizado para login.

A senha não deve ser armazenada diretamente em texto puro.

---

# Regra importante sobre senha

Não armazenar:

```json
{
  "password": "123456"
}
```

O backend deve armazenar um hash da senha.

Pode ser utilizado, por exemplo:

```text
bcrypt
```

ou outra biblioteca equivalente.

Exemplo conceitual:

```text
senha informada:
my-secret-password

        ↓

hash

        ↓

$2b$10$...
```

O backend deve comparar a senha informada no login com o hash armazenado.

---

# Armazenamento nesta fase

Ainda não é obrigatório usar banco de dados.

Pode ser utilizado armazenamento em memória.

Exemplo:

```ts
const users = [];
const messages = [];
```

Isso significa que reiniciar o backend pode apagar:

- usuários
- contas
- mensagens ainda não entregues

Isso é aceitável nesta fase.

A persistência real pode ser adicionada posteriormente.

---

# Cadastro

Adicionar um endpoint:

```http
POST /auth/register
```

Body:

```json
{
  "email": "alex@example.com",
  "password": "my-secret-password"
}
```

O backend deve:

1. Validar o email.
2. Validar a senha.
3. Verificar se o email já está cadastrado.
4. Gerar um UUID para o usuário.
5. Gerar o hash da senha.
6. Salvar o usuário.
7. Retornar uma resposta de sucesso.

Exemplo de usuário criado internamente:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com",
  "passwordHash": "$2b$10$..."
}
```

A senha original nunca deve ser armazenada.

---

# Validação de cadastro

O backend deve rejeitar casos inválidos.

Exemplos:

```text
email vazio
email inválido
senha vazia
senha muito curta
email já existente
```

Exemplo de resposta:

```json
{
  "error": "Email already registered"
}
```

Utilizar códigos HTTP apropriados.

Exemplo:

```text
400 Bad Request
409 Conflict
```

---

# Login

Adicionar:

```http
POST /auth/login
```

Body:

```json
{
  "email": "alex@example.com",
  "password": "my-secret-password"
}
```

O backend deve:

1. Procurar o usuário pelo email.
2. Verificar a senha.
3. Se estiver correta, autenticar o usuário.
4. Retornar uma sessão ou token.

Exemplo:

```json
{
  "token": "session-token",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alex@example.com"
  }
}
```

---

# Sessão

Depois do login, o frontend deve guardar a informação necessária para identificar a sessão.

Pode ser usado nesta fase:

```text
token
```

salvo no:

```text
localStorage
```

ou:

```text
sessionStorage
```

Exemplo:

```text
authToken = "abc123"
```

Nas próximas requisições, o frontend deve enviar o token.

Exemplo:

```http
Authorization: Bearer abc123
```

---

# Regra importante

A partir desta fase, o frontend não deve mais decidir quem é o remetente.

Antes poderia enviar:

```json
{
  "from": "user-a",
  "to": "user-b",
  "text": "Hello"
}
```

Agora isso não é mais seguro.

Um usuário poderia simplesmente enviar:

```json
{
  "from": "uuid-de-outra-pessoa"
}
```

Por isso, o backend deve descobrir o remetente através da sessão.

---

# Envio de mensagens

O endpoint pode continuar:

```http
POST /messages
```

Mas o body agora deve ser:

```json
{
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!"
}
```

Não enviar:

```text
from
```

O backend deve obter o remetente através do token.

Fluxo:

```text
frontend envia token

Authorization: Bearer TOKEN

        ↓

backend identifica usuário logado

        ↓

backend descobre:

from = usuário autenticado

        ↓

mensagem é criada
```

Exemplo interno:

```json
{
  "id": "message-uuid",
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "to": "994c88af-37d1-44d7-a014-f18063f906df",
  "text": "Hello!",
  "createdAt": 1789490000000
}
```

---

# Recebimento de mensagens

Antes:

```http
GET /messages/:userId
```

Agora o usuário não deve poder pedir mensagens de qualquer UUID.

Portanto o endpoint deve mudar para:

```http
GET /messages
```

com:

```http
Authorization: Bearer TOKEN
```

O backend deve:

1. Identificar o usuário autenticado.
2. Buscar mensagens cujo `to` seja o UUID desse usuário.
3. Retornar as mensagens.
4. Remover as mensagens retornadas.

Exemplo:

```text
token pertence a:

550e8400-e29b-41d4-a716-446655440000
```

Então o backend busca:

```text
message.to === 550e8400-e29b-41d4-a716-446655440000
```

---

# Regra de leitura única

A regra principal continua.

Uma mensagem deve ser entregue no máximo uma vez.

Fluxo:

```text
User A envia mensagem para User B

        ↓

mensagem fica armazenada no backend

        ↓

User B faz GET /messages

        ↓

backend identifica User B pelo token

        ↓

backend retorna mensagens de User B

        ↓

backend remove essas mensagens

        ↓

novo GET /messages

        ↓

não retorna as mensagens antigas
```

Exemplo:

Primeiro GET:

```json
[
  {
    "id": "72eccb24-54dc-4aec-b59c-c3e4c796ed3a",
    "from": "550e8400-e29b-41d4-a716-446655440000",
    "to": "994c88af-37d1-44d7-a014-f18063f906df",
    "text": "Hello!"
  }
]
```

Segundo GET:

```json
[]
```

---

# Endpoint do usuário atual

Adicionar:

```http
GET /me
```

com:

```http
Authorization: Bearer TOKEN
```

Resposta:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com"
}
```

Esse endpoint permite que o frontend descubra quem está logado.

---

# Logout

Adicionar suporte a logout.

Pode ser feito inicialmente apenas no frontend:

```text
remover token do armazenamento local
```

Exemplo:

```text
localStorage.removeItem("authToken")
```

Depois disso, o frontend deve voltar para a tela de login.

Opcionalmente, o backend pode ter:

```http
POST /auth/logout
```

para invalidar tokens.

---

# Frontend

O frontend agora deve ter pelo menos duas áreas principais:

```text
Authentication

Messenger
```

---

# Tela de cadastro

Exemplo:

```text
Create Account

Email
[________________________]

Password
[________________________]

[ Register ]

Already have an account?
[ Login ]
```

---

# Tela de login

Exemplo:

```text
Login

Email
[________________________]

Password
[________________________]

[ Login ]

Don't have an account?
[ Register ]
```

---

# Após login

Depois do login:

```text
Logged in as:
alex@example.com

Your User ID:
550e8400-e29b-41d4-a716-446655440000

[ Copy ID ]

[ Logout ]

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

O UUID agora deve vir do backend.

Não deve ser gerado no frontend.

---

# Persistência de login

Se o usuário atualizar a página, o frontend deve verificar se existe um token salvo.

Exemplo:

```text
app inicia

        ↓

existe token?

        ↓
       sim

        ↓

GET /me

        ↓

token válido?

   sim        não
    ↓          ↓
abrir app    voltar login
```

Isso evita que o usuário precise fazer login novamente após cada refresh.

---

# Usuários no backend

Nesta fase, o backend passa a ser responsável por manter os usuários.

Exemplo:

```ts
users = [
  {
    id: "uuid-a",
    email: "alex@example.com",
    passwordHash: "..."
  },
  {
    id: "uuid-b",
    email: "joao@example.com",
    passwordHash: "..."
  }
];
```

---

# Busca de usuário

Adicionar um endpoint para encontrar outro usuário.

Pode ser:

```http
GET /users/:id
```

Exemplo:

```http
GET /users/994c88af-37d1-44d7-a014-f18063f906df
```

Resposta:

```json
{
  "id": "994c88af-37d1-44d7-a014-f18063f906df",
  "email": "joao@example.com"
}
```

Não retornar informações sensíveis.

Nunca retornar:

```text
password
passwordHash
token
```

---

# Opcional: busca por email

Também pode ser implementado:

```http
GET /users?email=joao@example.com
```

Resposta:

```json
{
  "id": "994c88af-37d1-44d7-a014-f18063f906df",
  "email": "joao@example.com"
}
```

Isso pode facilitar encontrar outros usuários no futuro.

---

# Estrutura sugerida do backend

Uma possível estrutura:

```text
backend/
  src/
    server.ts

    routes/
      auth.ts
      messages.ts
      users.ts

    services/
      auth.ts
      users.ts
      messages.ts

    middleware/
      auth.ts

    store/
      users.ts
      messages.ts
      sessions.ts
```

Não é obrigatório seguir exatamente essa estrutura.

O objetivo é começar a separar responsabilidades.

---

# Middleware de autenticação

Criar uma função responsável por verificar o token.

Exemplo conceitual:

```text
request

Authorization: Bearer TOKEN

        ↓

auth middleware

        ↓

token existe?

        ↓

usuário válido?

        ↓

request.user = usuário
```

Assim, endpoints protegidos podem acessar:

```text
request.user
```

---

# Rotas públicas

Estas rotas não precisam de autenticação:

```text
POST /auth/register
POST /auth/login
GET /health
```

---

# Rotas protegidas

Estas rotas devem exigir autenticação:

```text
GET /me
POST /messages
GET /messages
GET /users/:id
```

Se o token estiver ausente ou inválido:

```http
401 Unauthorized
```

Exemplo:

```json
{
  "error": "Unauthorized"
}
```

---

# Health Check

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

---

# Segurança mínima

Mesmo sendo um desafio simples, algumas regras devem ser seguidas:

- Não armazenar senha em texto puro.
- Não retornar hash da senha.
- Não confiar no `from` enviado pelo frontend.
- Identificar o remetente pelo token.
- Não permitir acesso às mensagens de outro usuário.
- Não expor tokens de outros usuários.
- Validar email.
- Validar UUID.
- Validar tamanho da mensagem.
- Retornar `401` quando não autenticado.

---

# Limite da mensagem

Adicionar um tamanho máximo.

Exemplo:

```text
2000 caracteres
```

Mensagens maiores devem ser rejeitadas.

Exemplo:

```json
{
  "error": "Message too long"
}
```

---

# Fluxo completo

## Cadastro

```text
frontend

email + senha

        ↓

POST /auth/register

        ↓

backend

gera UUID
gera password hash
salva usuário
```

---

## Login

```text
frontend

email + senha

        ↓

POST /auth/login

        ↓

backend valida senha

        ↓

gera token

        ↓

frontend salva token
```

---

## Enviar mensagem

```text
frontend

to + text + token

        ↓

POST /messages

        ↓

backend identifica usuário pelo token

        ↓

from = usuário logado

        ↓

salva mensagem
```

---

## Receber mensagem

```text
frontend

GET /messages + token

        ↓

backend identifica usuário

        ↓

busca mensagens destinadas a ele

        ↓

retorna mensagens

        ↓

remove mensagens retornadas
```

---

# Exemplo com dois usuários

## Alex

```text
email:
alex@example.com

UUID:
aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa
```

## João

```text
email:
joao@example.com

UUID:
bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb
```

Alex faz login.

Depois envia:

```http
POST /messages
Authorization: Bearer TOKEN_A
```

Body:

```json
{
  "to": "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
  "text": "Hello João!"
}
```

O backend cria:

```json
{
  "id": "cccccccc-cccc-4ccc-cccc-cccccccccccc",
  "from": "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
  "to": "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
  "text": "Hello João!"
}
```

João faz:

```http
GET /messages
Authorization: Bearer TOKEN_B
```

Resposta:

```json
[
  {
    "id": "cccccccc-cccc-4ccc-cccc-cccccccccccc",
    "from": "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    "to": "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
    "text": "Hello João!"
  }
]
```

Se João fizer novamente:

```http
GET /messages
```

Resposta:

```json
[]
```

---

# Regras da Fase 3

- Manter a regra de mensagens entregues uma única vez.
- Usuários agora ficam armazenados no backend.
- Cada usuário possui um UUID gerado pelo backend.
- Usuário se cadastra usando email e senha.
- Usuário faz login usando email e senha.
- Email deve ser único.
- Senha deve ser armazenada usando hash.
- Backend deve gerar uma sessão ou token.
- Frontend deve manter o token.
- Frontend deve restaurar a sessão após refresh.
- UUID não deve mais ser gerado no frontend.
- UUID deve ser recuperado através do usuário autenticado.
- `from` não deve ser enviado pelo frontend.
- Backend deve definir o remetente através da autenticação.
- Usuário não pode acessar mensagens de outro usuário.
- Mensagens continuam armazenadas no backend.
- Usuários podem continuar armazenados apenas em memória.
- Não é obrigatório usar banco de dados.
- Não usar WebSocket ainda.
- Não implementar lista de contatos ainda.
- Não implementar grupos.
- Não implementar confirmação de leitura.
- Não implementar recuperação de senha.

---

# Critérios de conclusão

A Fase 3 está completa quando for possível:

1. Abrir o frontend.
2. Criar uma conta com email e senha.
3. Backend gerar um UUID para o usuário.
4. Fazer logout.
5. Fazer login novamente.
6. Confirmar que o mesmo UUID foi recuperado.
7. Atualizar a página.
8. Confirmar que a sessão continua válida.
9. Criar uma segunda conta.
10. Copiar o UUID do segundo usuário.
11. Fazer login com o primeiro usuário.
12. Enviar mensagem para o UUID do segundo.
13. Fazer logout.
14. Fazer login como o segundo usuário.
15. Buscar mensagens.
16. Receber a mensagem.
17. Buscar novamente.
18. Confirmar que a mensagem não é retornada pela segunda vez.
19. Tentar acessar mensagens sem token.
20. Confirmar que recebe `401 Unauthorized`.
21. Tentar enviar um `from` falso.
22. Confirmar que o backend ignora qualquer identidade informada pelo frontend e utiliza o usuário autenticado.

---

# Resultado esperado

Ao final da Fase 3, a aplicação já deve possuir:

```text
contas
login
senha
UUID persistente no backend
sessão
rotas protegidas
identidade confiável
mensagens privadas
mensagens entregues apenas uma vez
```

O sistema começa a deixar de ser apenas um frontend enviando UUIDs arbitrários e passa a possuir uma identidade controlada pelo servidor.
