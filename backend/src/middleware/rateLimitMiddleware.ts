import { rateLimit } from "express-rate-limit";

// Limita tentativas de login/cadastro por IP para dificultar ataques de força bruta.
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Tente novamente em alguns minutos." },
});

export default authRateLimit;
