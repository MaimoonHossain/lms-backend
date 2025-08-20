import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
} from "../controllers/coursePurchase.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router
  .route("/checkout/create-checkout-session")
  .post(isAuthenticated, createCheckoutSession);
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), stripeWebhook);
// router.route("/course/details-with-status/:courseId").get();
// router.route("/").get();

export default router;
