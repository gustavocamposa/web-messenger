import messages from "../../data/messages.js";
import express from "express";
import { randomUUID } from "crypto";

const router = express.Router();

router.get("/users", (req, res) => {
  res.json({ message: "Servidor funcionando." });
});

router.get("/messages/:userId", (req, res) => {
  const { userId } = req.params;

  const userFiltrado = messages.filter((message) => {
    return message.to === userId;
  });
  return res.json(userFiltrado);
});

router.post("/messages", (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.status(400).json({
      message: "Informações inválidas.",
    });
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
