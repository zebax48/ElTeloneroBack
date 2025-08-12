const Votacion = require('../models/Votacion');
const Participante = require('../models/Participant');
const Evento = require('../models/Event');
const ActiveIds = require('../models/ActiveIds');

exports.crearVotacion = async (req, res) => {
  try {
    const { evento, participantes, duracionMinutos, fechaInicio } = req.body;

    if (!evento || !participantes?.length || !duracionMinutos || !fechaInicio) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios (incluida fechaInicio)' });
    }

    const existeEvento = await Evento.findById(evento);
    if (!existeEvento) return res.status(404).json({ error: 'Evento no encontrado' });

    const participantesValidos = await Participante.find({ _id: { $in: participantes }, eventoId: evento });
    if (participantesValidos.length !== participantes.length) {
      return res.status(400).json({ error: 'Algunos participantes no son válidos para este evento' });
    }

    const payload = { evento, participantes, duracionMinutos };
    const parsed = new Date(fechaInicio);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({ error: 'fechaInicio inválida' });
    }
    payload.fechaInicio = parsed;
    const votacion = new Votacion(payload);
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

exports.activarVotacion = async (req, res) => {
  try {
    const { id } = req.params; // votacionId
    const votacion = await Votacion.findById(id).populate('evento');
    if (!votacion) return res.status(404).json({ error: 'Votación no encontrada' });

    // No sobreescribir fechaInicio: si se definió al crear, se respeta.
    // Si no existe por alguna razón, inicializarla con la fecha de creación del documento o ahora.
    if (!votacion.fechaInicio) {
      votacion.fechaInicio = votacion.createdAt ? new Date(votacion.createdAt) : new Date();
      await votacion.save();
    }

    // Guardar IDs activos en un único documento
    await ActiveIds.findOneAndUpdate(
      {},
      { $set: { eventId: votacion.evento?._id?.toString(), votacionId: votacion._id.toString() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // También activar bandera de votación en el evento y ocultar resultados
    if (votacion.evento) {
      votacion.evento.votacionActiva = true;
      votacion.evento.mostrarResultadosVotacion = false;
      await votacion.evento.save();
    }

    res.json({ mensaje: 'Votación activada', id: votacion._id });
  } catch (error) {
    console.error('Error al activar votación:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

exports.obtenerVotacionPorId = async (req, res) => {
  try {
    const votacion = await Votacion.findById(req.params.id)
      .populate('evento')
      .populate('participantes');

    if (!votacion) return res.status(404).json({ error: 'Votación no encontrada' });

  const now = Date.now();
    const inicio = new Date(votacion.fechaInicio).getTime();
    const fin = inicio + votacion.duracionMinutos * 60000;
  const activa = now >= inicio && now < fin;
  const minutosParaIniciar = now < inicio ? Math.ceil((inicio - now) / 60000) : 0;
  const estado = now < inicio ? 'pendiente' : (now < fin ? 'activa' : 'finalizada');

    res.json({
      ...votacion.toObject(),
  activa,
      minutosRestantes: activa ? Math.max(0, Math.ceil((fin - now) / 60000)) : 0,
  minutosParaIniciar,
  estado
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

  const now = Date.now();
  const inicio = new Date(votacion.fechaInicio).getTime();
  const fin = inicio + votacion.duracionMinutos * 60000;
  const activa = now >= inicio && now < fin;

  if (!activa) return res.status(403).json({ error: 'La votación no está activa' });

    res.json({
      _id: votacion._id,
      participantes: votacion.participantes,
    minutosRestantes: Math.max(0, Math.ceil((fin - now) / 60000))
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
