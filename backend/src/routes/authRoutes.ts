import express from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../../data/users.js";
import { AppError } from "../errors/AppError.js";
import { generateToken } from "../utils/token.js";
import authRateLimit from "../middleware/rateLimitMiddleware.js";

interface AuthBody {
  email?: string;
  password?: string;
}

const router = express.Router();

router.post("/register", authRateLimit, async (req, res) => {
  const { email, password } = req.body as AuthBody;

  console.log(`POST /register (${email}) ${new Date().toLocaleString()}`);

  if (!email || !password) {
    throw new AppError("Email ou senha não informados", 400);
  }

  const userCreated = await createUser({ email, password });

  if (!userCreated) {
    throw new AppError("Email já cadastrado", 409);
  }

  console.log("Registro feito com sucesso.");

  res.status(201).json({
    id: userCreated.id,
    email: userCreated.email,
  });
});

router.post("/login", authRateLimit, async (req, res) => {
  const { email, password } = req.body as AuthBody;

  console.log(`POST /login (${email}) ${new Date().toLocaleString()}`);

  if (!email || !password) {
    throw new AppError("Email ou senha não informados", 400);
  }

  const user = await findUserByEmail(email);

  // Mesma mensagem para email e senha errados, para não revelar quais emails existem.
  if (!user) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (passwordCorrect === false) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const token = generateToken(user.id);

  console.log("Login feito com sucesso");

  return res.status(200).json({
    token,
    id: user.id,
  });
});

export default router;
