declare global {
  namespace Express {
    interface Request {
      // Preenchido pelo authMiddleware; só existe nas rotas protegidas.
      userId: string;
    }
  }
}

export {};
