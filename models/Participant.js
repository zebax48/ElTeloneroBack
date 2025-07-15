const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  eventoId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  correo: { type: String, required: true },
  nombreCompleto: { type: String, required: true },
  documento: { type: String, required: true },
  telefono: { type: String, required: true },
  descripcion: { type: String },
  enlaceTalento: { type: String }
});

module.exports = mongoose.model("Participant", participantSchema);