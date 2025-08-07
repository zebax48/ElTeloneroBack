const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveVotingEvents = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    const isVotingActive = event.votacionActiva;
    const isShowVotingResults = event.mostrarResultadosVotacion;
    res.json({
      votacionActiva: isVotingActive,
      mostrarResultadosVotacion: isShowVotingResults
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setVotacionStatus = async (req, res) => {
  try {
    const { eventId, status } = req.body;
    const event = await Event.findById(eventId);
    event.votacionActiva = status;
    if (status) {
      event.mostrarResultadosVotacion = false;
    }
    await event.save();
    res.json({ message: 'Votación actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setResultVotacionStatus = async (req, res) => {
  try {
    const { eventId, status } = req.body;
    const event = await Event.findById(eventId);
    event.mostrarResultadosVotacion = status;
    event.votacionActiva = false;
    await event.save();
    res.json({ message: 'Resultados de votación actualizados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};