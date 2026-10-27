import type { Request, Response } from "express";

const healthCheck = (req: Request, res: Response) => {
  console.log("GET /health" + new Date().toLocaleString());

  res.status(200).json({
    timestamp: new Date(),
    uptime: process.uptime(),
  });
};

export default healthCheck;
