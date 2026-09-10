FASE 1 - POC (PROVA DE CONCEITO)
OBJETIVO
Criar a versão mais simples possível de um chat funcional. Sem tempo real de verdade. Sem persistência. Sem frescura.

Aqui o foco é:

Entender HTTP
Entender backend
Entender fluxo de dados
Fazer funcionar
TECNOLOGIAS OBRIGATÓRIAS
Frontend:

Não vai ter. Usar Insomnia, Postman, ou outro similar.
Backend:

Javascript (Typescript vem depois)
Node.js
Express
COMO DEVE FUNCIONAR
Para receber mensagens:

Fazendo GET no servidor, é verificado se existem novas mensagens para aquele usuário e são enviadas.
Para enviar mensagens:

Fazendo um POST para o servidor
Envia (no minimo): remetente, destinatário, mensagem
O servidor:

Guarda as mensagens em memória (objeto ou Map)
As mensagens ficam guardadas ATÉ o destinatário fazer o GET
Depois de entregues, devem ser apagadas
Mensagens NUNCA podem ser enviadas duas vezes pelo servidor.
REGRAS IMPORTANTES
Se o servidor reiniciar, perdeu tudo (e está tudo bem)
Código simples e legível
Cada endpoint tem que fazer uma coisa só
Servidor tem que rodar em algum porta local host
CRITÉRIO DE CONCLUSÃO
Multiplas chamadas funcionam (tipo um POST e depois alguns GET)
Mensagens chegam corretamente
Não existem erros no console
Código entendido e explicado
