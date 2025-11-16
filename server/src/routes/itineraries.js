// server/src/routes/itineraries.js
import express from "express";
import {
  generateItinerary,
  createItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary
} from "../controllers/itineraryController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

router.post("/", createItinerary);
router.post("/generate", generateItinerary);
router.get("/", getItineraries);
router.get("/:id", getItinerary);
router.patch("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

export default router;
