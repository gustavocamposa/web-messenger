import type { ErrorRequestHandler } from "express";

// statusCode vem do AppError ou dos erros do próprio Express (ex.: JSON inválido).
type HttpError = Error & { statusCode?: number };

const errorMiddleware: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  const statusCode =
    err.statusCode && err.statusCode < 500 ? err.statusCode : 500;

  // Erros inesperados (banco fora do ar, bug etc.) só aparecem no log do servidor;
  // o cliente recebe uma mensagem genérica para não expor detalhes internos.
  if (statusCode === 500) {
    console.error(`Erro em ${req.method} ${req.path}:`, err);

    return res.status(500).json({ message: "Erro interno do servidor" });
  }

  res.status(statusCode).json({ message: err.message });
};

export default errorMiddleware;
