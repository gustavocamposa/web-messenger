import { createMessage, takeMessagesByUser } from "../../data/messages.js";
import express from "express";
import healthCheck from "../healthCheck.js";
import { AppError } from "../errors/AppError.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { listAvailableUsers } from "../../data/users.js";

const router = express.Router();

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/health", healthCheck);

router.get("/messages/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  if (userId !== req.userId) {
    throw new AppError("Acesso negado", 403);
  }

  if (!uuidRegex.test(userId)) {
    throw new AppError("ID inválido", 400);
  }

  const userMessages = await takeMessagesByUser(userId);

  return res.status(200).json({ status: "Ok", userMessages });
});

router.post("/messages", authMiddleware, async (req, res) => {
  const { to, text } = req.body;

  if (!to || !uuidRegex.test(to)) {
    throw new AppError("ID inválido", 400);
  }

  if (!text || !text.trim()) {
    throw new AppError("Campo mensagem vazio", 400);
  }

  await createMessage({ from: req.userId, to, text });

  console.log("Mensagem enviada com sucesso");

  res.status(200).json({ status: "Mensagem OK", message: "Mensagem enviada!" });
});

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({ status: "OK", userId: req.userId });
});

router.get("/users", authMiddleware, (req, res) => {
  return res.json(listAvailableUsers(req.userId));
});

export default router;
