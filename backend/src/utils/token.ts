import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definido no .env");
  }

  return secret;
}

function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, getSecret(), { expiresIn: "7d" });
}

function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, getSecret());

  if (typeof payload === "string" || typeof payload.id !== "string") {
    throw new Error("Payload do token inválido");
  }

  return { id: payload.id };
}

export { generateToken, verifyToken };
