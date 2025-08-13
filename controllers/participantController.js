const Participant = require("../models/Participant");
const Event = require("../models/Event");
const Votacion = require("../models/Votacion");

exports.registerParticipant = async (req, res) => {
  try {
    const eventoId = req.params.eventoId;
    const event = await Event.findById(eventoId);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const totalInscritos = typeof event.totalInscritos === 'number' ? event.totalInscritos : 0;
    const capacidad = typeof event.capacidad === 'number' ? event.capacidad : 0;
    if (capacidad && totalInscritos >= capacidad) {
      return res.status(400).json({ error: 'El evento está lleno' });
    }

    // Validación de enlaceTalento si viene informado
    const rawLink = (req.body?.enlaceTalento || '').trim();
    if (rawLink) {
      if (rawLink.startsWith('@') || /\s/.test(rawLink)) {
        return res.status(400).json({ error: 'El enlace de talento debe ser una URL válida (no se permiten @usuarios ni espacios).' });
      }
      const tryBuild = (val) => {
        try {
          const u = new URL(val);
          const protocolOk = u.protocol === 'http:' || u.protocol === 'https:';
          const hostOk = !!u.hostname && u.hostname.includes('.');
          return protocolOk && hostOk ? u.toString() : null;
        } catch {
          return null;
        }
      };
      let normalized = rawLink.startsWith('http://') || rawLink.startsWith('https://')
        ? tryBuild(rawLink)
        : tryBuild(`https://${rawLink}`);
      if (!normalized) {
        return res.status(400).json({ error: 'El enlace de talento no es válido. Ejemplo: https://youtu.be/tu-video' });
      }
      req.body.enlaceTalento = normalized;
    }

    const participant = new Participant({
      ...req.body,
      eventoId
    });
    await participant.save();

    // Incremento atómico para evitar condiciones de carrera
    await Event.findByIdAndUpdate(eventoId, { $inc: { totalInscritos: 1 } });

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