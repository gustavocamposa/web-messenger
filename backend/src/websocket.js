import { WebSocketServer } from "ws";
import { verifyToken } from "./utils/token.js";
import { findUserById } from "../data/users.js";

const connections = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, request) => {
    const { searchParams } = new URL(request.url, "http://localhost");
    const token = searchParams.get("token");

    let user;
    // codigo 1008 = codigo padrão do websocket para esses tratamentos de erro.
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

    socket.on("close", () => {
      const sockets = connections.get(user.id);
      sockets.delete(socket);

      if (sockets.size === 0) {
        connections.delete(user.id);
      }

      console.log(`${user.email} desconectou. Online:`, connections.size);
    });
  });
}

export function sendToUser(userId, event) {
  const sockets = connections.get(userId);

  if (!sockets) {
    return;
  }

  const data = JSON.stringify(event);

  for (const socket of sockets) {
    socket.send(data);
  }
}
