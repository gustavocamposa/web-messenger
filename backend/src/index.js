import express from "express";
import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);
app.use(authRoutes);

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Servidor rodando!");
});
