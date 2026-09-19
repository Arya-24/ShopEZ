import express from "express";
import { getSiteConfig, updateSiteConfig } from "../controllers/siteConfigController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSiteConfig);
router.put("/", protect, adminOnly, updateSiteConfig);

export default router;