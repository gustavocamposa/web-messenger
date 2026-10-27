import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "http";

import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { setupWebSocket } from "./websocket.js";

const app = express();
const server = createServer(app);

setupWebSocket(server);

// Em hospedagens como Render e Railway o app fica atrás de proxies; TRUST_PROXY é
// quantos são, para que req.ip (usado no limite de tentativas) seja o IP do visitante.
const trustProxy = Number(process.env.TRUST_PROXY);
if (trustProxy > 0) {
  app.set("trust proxy", trustProxy);
}

// CORS_ORIGIN: domínios do frontend separados por vírgula. Sem ele, qualquer origem
// é aceita, o que só serve para desenvolvimento local.
const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors(allowedOrigins?.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

app.use(routes);
app.use(authRoutes);

app.use(errorMiddleware);

const port = Number(process.env.PORT) || 3000;

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`);
});
