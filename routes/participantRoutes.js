const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");

router.post("/eventos/:eventoId/registrar", participantController.registerParticipant);
router.get("/eventos/:eventoId/participantes", participantController.getParticipantsByEvent);
router.post("/votar", participantController.votarPorParticipante);

module.exports = router;