import "dotenv/config";

import express from "express";
import cors from "cors";
import { createServer } from "http";

import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { setupWebSocket } from "./websocket.js";

const app = express();
const server = createServer(app);

setupWebSocket(server);

app.use(cors());
app.use(express.json());

app.use(routes);
app.use(authRoutes);

app.use(errorMiddleware);

const port = Number(process.env.PORT) || 3000;

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`);
});
