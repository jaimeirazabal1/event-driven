import express from "express";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(express.json());
app.use("/api", notificationRoutes);

export default app;