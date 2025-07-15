const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/eventos", eventController.createEvent);
router.get("/eventos", eventController.getEvents);
router.get("/eventos/:eventId", eventController.getEventById);

module.exports = router;