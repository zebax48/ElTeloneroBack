const express = require("express");
const router = express.Router();
const activeIdsController = require("../controllers/activeIdsController");
const authMiddleware = require('../middleware/authMiddleware.js');

router.get("/", activeIdsController.getAllActiveIds);
//router.post("/", activeIdsController.createActiveIds);
router.put("/setEventId", authMiddleware, activeIdsController.setActiveEventId);
router.put("/setVotacionId", authMiddleware, activeIdsController.setActiveVotacionId);

module.exports = router;