import express from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { findUserByEmail, createUser } from "../../data/users.js";
import { AppError } from "../errors/AppError.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email ou senha não informados", 400);
  }

  const userExists = findUserByEmail(email);

  if (userExists) {
    throw new AppError("Email já cadastrado", 409);
  }

  const userCreated = createUser({ id, email, passwordHash });

  res.status(201).json({ id: userCreated.id, email: userCreated.email });
});

export default router;
