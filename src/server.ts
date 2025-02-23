import "dotenv/config";
import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();