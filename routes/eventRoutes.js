const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require('../middleware/authMiddleware.js');

router.get("/eventos/votacion-activa/:eventId", eventController.getActiveVotingEvents);

router.post("/eventos", authMiddleware, eventController.createEvent);
router.get("/eventos", authMiddleware, eventController.getEvents);
router.get("/eventos/:eventId", authMiddleware, eventController.getEventById);
router.put("/eventos/setVotacionStatus", authMiddleware, eventController.setVotacionStatus);
router.put("/eventos/setResultVotacionStatus", authMiddleware, eventController.setResultVotacionStatus);

module.exports = router;