const Votacion = require('../models/Votacion');
const Participante = require('../models/Participant');
const Evento = require('../models/Event');

exports.crearVotacion = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { evento, participantes, duracionMinutos } = req.body;

    if (!evento || !participantes?.length || !duracionMinutos) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existeEvento = await Evento.findById(evento);
    if (!existeEvento) return res.status(404).json({ error: 'Evento no encontrado' });

    const participantesValidos = await Participante.find({ _id: { $in: participantes }, eventoId: evento });
    console.log('Participantes válidos:', participantesValidos);
    if (participantesValidos.length !== participantes.length) {
      return res.status(400).json({ error: 'Algunos participantes no son válidos para este evento' });
    }

    const votacion = new Votacion({ evento, participantes, duracionMinutos });
    await votacion.save();
    res.status(201).json(votacion);
  } catch (error) {
    console.error('Error al crear votación:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

exports.obtenerVotaciones = async (req, res) => {
  try {
    const votaciones = await Votacion.find()
      .populate('evento')
      .populate('participantes');
    res.json(votaciones);
  } catch (error) {
    console.error('Error al obtener votaciones:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

exports.obtenerVotacionPorId = async (req, res) => {
  try {
    const votacion = await Votacion.findById(req.params.id)
      .populate('evento')
      .populate('participantes');

    if (!votacion) return res.status(404).json({ error: 'Votación no encontrada' });

    const minutosTranscurridos = (Date.now() - new Date(votacion.fechaInicio)) / 60000;
    const activa = minutosTranscurridos < votacion.duracionMinutos;

    res.json({
      ...votacion.toObject(),
      activa,
      minutosRestantes: Math.max(0, Math.ceil(votacion.duracionMinutos - minutosTranscurridos))
    });
  } catch (error) {
    console.error('Error al obtener votación:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

exports.obtenerVotacionActiva = async (req, res) => {
  try {
    const { eventoId } = req.params;

    // Buscar la votación más reciente del evento
    const votacion = await Votacion.findOne({ evento: eventoId })
      .sort({ fechaInicio: -1 })
      .populate('participantes');

    if (!votacion) return res.status(404).json({ error: 'No hay votaciones activas' });

    const minutosTranscurridos = (Date.now() - new Date(votacion.fechaInicio)) / 60000;
    const activa = minutosTranscurridos < votacion.duracionMinutos;

    if (!activa) return res.status(403).json({ error: 'La votación ha finalizado' });

    res.json({
      _id: votacion._id,
      participantes: votacion.participantes,
      minutosRestantes: Math.max(0, Math.ceil(votacion.duracionMinutos - minutosTranscurridos))
    });
  } catch (error) {
    console.error('Error al obtener votación activa:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

exports.votar = async (req, res) => {
  try {
    const { id: votacionId } = req.params;
    const { participanteId } = req.body;

    const votacion = await Votacion.findById(votacionId);
    if (!votacion) return res.status(404).json({ error: 'Votación no encontrada' });

    const minutosTranscurridos = (Date.now() - new Date(votacion.fechaInicio)) / 60000;
    if (minutosTranscurridos > votacion.duracionMinutos) {
      return res.status(403).json({ error: 'La votación ha finalizado' });
    }

    const participanteValido = votacion.participantes.includes(participanteId);
    if (!participanteValido) {
      return res.status(400).json({ error: 'Participante no pertenece a esta votación' });
    }

    // Aquí podrías guardar el voto en una colección "Votos" si deseas llevar conteo.
    // Pero por ahora, solo confirmamos que se aceptó el voto.
    res.json({ mensaje: '✅ Voto registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el voto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
