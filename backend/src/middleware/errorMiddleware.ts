import type { ErrorRequestHandler } from "express";

// statusCode vem do AppError ou dos erros do próprio Express (ex.: JSON inválido).
type HttpError = Error & { statusCode?: number };

const errorMiddleware: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Erro interno do servidor",
  });
};

export default errorMiddleware;
