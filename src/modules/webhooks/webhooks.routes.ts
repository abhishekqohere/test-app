import { Router } from "express";

export const webhookRouter = Router();

webhookRouter.post("/external-provider/webhook", (req, res) => {
  const event = req.body;

  if (event.type === "project.updated") {
    console.log("Project updated from external provider", event.data?.projectId);
  }

  res.status(200).json({
    success: true,
    message: "Webhook received",
    data: null,
  });
});
