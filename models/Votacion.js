const mongoose = require('mongoose');

const votacionSchema = new mongoose.Schema({
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participantes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    }
  ],
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  duracionMinutos: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Votacion', votacionSchema);