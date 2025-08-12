const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");
const authMiddleware = require('../middleware/authMiddleware.js');

router.post("/votar", participantController.votarPorParticipante);
router.post("/eventos/:eventoId/registrar", participantController.registerParticipant);

router.get("/eventos/:eventoId/participantes", authMiddleware, participantController.getParticipantsByEvent);

// Resetear votos de todos los participantes de un evento (protegido)
router.put("/eventos/:eventoId/reset-votos", authMiddleware, participantController.resetVotesByEvent);


module.exports = router;