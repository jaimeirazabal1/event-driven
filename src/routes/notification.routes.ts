import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

router.post("/notifications", NotificationController.createNotification);

export default router;