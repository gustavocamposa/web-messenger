import type { Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { verifyToken } from "./utils/token.js";
import { findUserById } from "../data/users.js";
import type { ServerEvent, User } from "./types.js";

const connections = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, request) => {
    const { searchParams } = new URL(request.url ?? "", "http://localhost");
    const token = searchParams.get("token") ?? "";

    let user: User | undefined;
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

    const connectedUser = user;

    console.log(`${connectedUser.email} conectou`);

    let sockets = connections.get(connectedUser.id);
    if (!sockets) {
      sockets = new Set();
      connections.set(connectedUser.id, sockets);
    }
    sockets.add(socket);

    console.log("Online:", connections.size);

    socket.on("close", () => {
      const sockets = connections.get(connectedUser.id);
      if (!sockets) {
        return;
      }

      sockets.delete(socket);

      if (sockets.size === 0) {
        connections.delete(connectedUser.id);
      }

      console.log(
        `${connectedUser.email} desconectou. Online:`,
        connections.size,
      );
    });
  });
}

export function sendToUser(userId: string, event: ServerEvent) {
  const sockets = connections.get(userId);

  if (!sockets) {
    return;
  }

  const data = JSON.stringify(event);

  for (const socket of sockets) {
    socket.send(data);
  }
}
