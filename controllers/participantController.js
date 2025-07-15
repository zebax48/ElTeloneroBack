const Participant = require("../models/Participant");

exports.registerParticipant = async (req, res) => {
  try {
    const participant = new Participant({
      ...req.body,
      eventoId: req.params.eventoId
    });
    await participant.save();
    res.status(201).json(participant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getParticipantsByEvent = async (req, res) => {
  try {
    const participants = await Participant.find({ eventoId: req.params.eventoId });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};