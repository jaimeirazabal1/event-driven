import { EventEmitter } from "events";
import { Notification } from "../entities/Notification";
import { AppDataSource } from "../config/database";

export const notificationEmitter = new EventEmitter();

notificationEmitter.on("newNotification", async (message: string, type: string) => {
  const notificationRepo = AppDataSource.getRepository(Notification);
  const notification = new Notification();
  notification.message = message;
  notification.type = type;
  await notificationRepo.save(notification);
  console.log(`Notification saved: ${message} (${type})`);
});