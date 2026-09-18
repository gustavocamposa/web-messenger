import express from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../../data/users.js";
import { AppError } from "../errors/AppError.js";
import { generateToken } from "../utils/token.js";

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

  const userCreated = await createUser({ email, password });

  res.status(201).json({
    id: userCreated.id,
    email: userCreated.email,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email ou senha não informados", 400);
  }

  const user = findUserByEmail(email);

  if (!user) {
    throw new AppError("Email incorreto", 401);
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (passwordCorrect === false) {
    throw new AppError("Senha incorreta", 401);
  }

  const token = generateToken(user.id);

  return res.status(200).json({
    token,
    id: user.id,
  });
});

export default router;
