import { Request, Response } from "express";
import { notificationEmitter } from "../events/notification.event";

export class NotificationController {
  static async createNotification(req: Request, res: Response) {
    const { message, type } = req.body;
    if (!message || !type) {
      return res.status(400).json({ error: "Message and type are required" });
    }

    // Dispara el evento
    notificationEmitter.emit("newNotification", message, type);
    return res.status(201).json({ message: "Notification event triggered" });
  }
}