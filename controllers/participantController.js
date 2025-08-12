const Participant = require("../models/Participant");
const Event = require("../models/Event");
const Votacion = require("../models/Votacion");

exports.registerParticipant = async (req, res) => {
  try {
    const event = Event.findById(req.params.eventoId);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    if (event.totalInscritos >= event.capacidad) {
      return res.status(400).json({ error: 'El evento está lleno' });
    }
    event.totalInscritos += 1;
    const participant = new Participant({
      ...req.body,
      eventoId: req.params.eventoId
    });
    await participant.save();
    await event.save();
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

exports.votarPorParticipante = async (req, res) => {
  try {
    const { votacionId, participanteId } = req.body;

    if (!votacionId || !participanteId) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const votacion = await Votacion.findById(votacionId);
    if (!votacion) return res.status(404).json({ error: 'Votación no encontrada' });

    const ahora = Date.now();
    const inicio = new Date(votacion.fechaInicio).getTime();
    const fin = inicio + votacion.duracionMinutos * 60 * 1000;

    if (ahora > fin) {
      return res.status(403).json({ error: 'La votación ya terminó' });
    }

    if (!votacion.participantes.includes(participanteId)) {
      return res.status(400).json({ error: 'Participante no válido para esta votación' });
    }

    await Participant.findByIdAndUpdate(participanteId, { $inc: { votos: 1 } });

    res.status(200).json({ mensaje: '✅ Voto registrado exitosamente' });
  } catch (error) {
    console.error('Error al votar:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Resetear los votos de todos los participantes de un evento
exports.resetVotesByEvent = async (req, res) => {
  try {
    const { eventoId } = req.params;
    if (!eventoId) return res.status(400).json({ error: 'Evento ID requerido' });

    const event = await Event.findById(eventoId);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const result = await Participant.updateMany({ eventoId }, { $set: { votos: 0 } });
    return res.status(200).json({ mensaje: 'Votos reseteados', modificados: result.modifiedCount });
  } catch (error) {
    console.error('Error al resetear votos:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};