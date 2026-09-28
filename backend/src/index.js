import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { verifyToken } from "./utils/token.js";
import { findUserById } from "../data/users.js";

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

const connections = new Map();
wss.on("connection", (socket, request) => {
  const { searchParams } = new URL(request.url, "http://localhost");
  const token = searchParams.get("token");

  let user;

  try {
    const payload = verifyToken(token);
    user = findUserById(payload.id);
  } catch (error) {
    socket.close(1008, "Token inválido");
    return;
  }

  if (!user) {
    socket.close(1008, "Usuário não encontrado");
    return;
  }

  console.log(`${user.email} conectou`);

  if (!connections.has(user.id)) {
    connections.set(user.id, new Set());
  }
  connections.get(user.id).add(socket);

  console.log("Online:", connections.size);

  socket.on("message", (data) => {
    const text = data.toString();
    console.log("recebido:", text);
    socket.send(`mensagem: ${text}`);
  });

  socket.on("close", () => {
    const sockets = connections.get(user.id);
    sockets.delete(socket);

    if (sockets.size === 0) {
      connections.delete(user.id);
    }

    console.log(`${user.email} desconectou. Online:`, connections.size);
  });
});

app.use(cors());
app.use(express.json());

app.use(routes);
app.use(authRoutes);

app.use(errorMiddleware);

server.listen(3000, () => {
  console.log("Servidor rodando!");
});
