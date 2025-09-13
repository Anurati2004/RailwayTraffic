import express from "express";
import routes from "./routes/index.jsx";
import { errorHandler } from "./middlewares/error.middleware.jsx";

const app = express();

app.use(express.json());

// simple logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api", routes);

// central error handler
app.use(errorHandler);

export default app;
