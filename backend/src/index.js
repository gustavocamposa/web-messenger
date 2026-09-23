import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", (socket) => {
  console.log("Cliente conectou");

  socket.on("message", (data) => {
    const text = data.toString();
    console.log("recebido:", text);
    socket.send(`mensagem: ${text}`);
  });

  socket.on("close", () => {
    console.log("Cliente desconectou");
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
