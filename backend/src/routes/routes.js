import messages from "../../data/messages.js";
import express from "express";
import { randomUUID } from "crypto";
import healthCheck from "../healthCheck.js";
import { AppError } from "../errors/AppError.js";

const router = express.Router();

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/health", healthCheck);

router.get("/messages/:userId", (req, res) => {
  const { userId } = req.params;

  if (!uuidRegex.test(userId)) {
    throw new AppError("ID inválido", 400);
  }

  const userFiltrado = messages.filter((message) => {
    return message.to === userId;
  });

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].to === userId) {
      messages.splice(i, 1);
    }
  }

  return res.json(userFiltrado);
});

router.post("/messages", (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !uuidRegex.test(from)) {
    throw new AppError("ID inválido", 400);
  }

  if (!to || !uuidRegex.test(to)) {
    throw new AppError("ID inválido", 400);
  }

  if (!text || !text.trim()) {
    throw new AppError("Campo mensagem vazio", 400);
  }

  const id = randomUUID();

  const message = {
    id,
    from,
    to,
    text,
  };

  messages.push(message);

  res.status(200).json({ message: "Mensagem enviada!" });
});

export default router;
