import { DataSource } from "typeorm";
import { Notification } from "../entities/Notification";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "mysql",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "event_db",
  synchronize: true, // Solo para desarrollo, crea tablas automáticamente
  logging: true,
  entities: [Notification],
  subscribers: [],
  migrations: [],
});