const errorMiddleware = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Erro interno do servidor",
  });
};

export default errorMiddleware;
