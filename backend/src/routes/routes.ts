import { createMessage, getMessagesByUser } from "../../data/messages.js";
import express from "express";
import healthCheck from "./healthCheck.js";
import { AppError } from "../errors/AppError.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { listAvailableUsers, findUserById } from "../../data/users.js";
import { sendToUser } from "../websocket.js";
import { MESSAGE_MAX_LENGTH } from "../../data/schema.js";
import type { NewMessageEvent } from "../types.js";

interface SendMessageBody {
  to?: string;
  text?: string;
}

const router = express.Router();

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/health", healthCheck);

router.get("/messages", authMiddleware, async (req, res) => {
  console.log(
    `GET /messages (user ${req.userId}) ${new Date().toLocaleString()}`,
  );

  const receivedMessages = await getMessagesByUser(req.userId);

  return res.status(200).json(receivedMessages);
});

router.post("/messages", authMiddleware, async (req, res) => {
  const { to, text } = req.body as SendMessageBody;

  console.log(
    `POST /messages (de ${req.userId} para ${to} ${new Date().toLocaleString()})`,
  );

  if (!to || !uuidRegex.test(to)) {
    throw new AppError("ID inválido", 400);
  }

  if (!text || !text.trim()) {
    throw new AppError("Campo mensagem vazio", 400);
  }

  if (text.length > MESSAGE_MAX_LENGTH) {
    throw new AppError(
      `Mensagem deve ter no máximo ${MESSAGE_MAX_LENGTH} caracteres`,
      400,
    );
  }

  const recipient = await findUserById(to);

  if (!recipient) {
    throw new AppError("Destinatário não encontrado", 404);
  }

  const createdMessage = await createMessage({ from: req.userId, to, text });

  const sender = await findUserById(req.userId);

  const event: NewMessageEvent = {
    type: "message:new",
    message: {
      ...createdMessage,
      fromEmail: sender?.email ?? "Usuário desconhecido",
    },
  };

  sendToUser(to, event);

  console.log("Mensagem enviada com sucesso");

  res.status(201).json(event.message);
});

router.get("/me", authMiddleware, (req, res) => {
  console.log(`GET /me (${req.userId}) ${new Date().toLocaleString()}`);

  res.status(200).json({ userId: req.userId });
});

router.get("/users", authMiddleware, async (req, res) => {
  console.log(`GET /users (${req.userId}) ${new Date().toLocaleString()}`);

  const availableUsers = await listAvailableUsers(req.userId);
  console.log("Ok");
  return res.json(availableUsers);
});

export default router;
