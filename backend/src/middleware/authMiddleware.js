import { verifyToken } from "../utils/token.js";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

export default authMiddleware;
