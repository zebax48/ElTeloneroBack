const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  fecha: Date,
  lugar: String,
  descripcion: String,
  estado: { type: String, enum: ["abierto", "cerrado"], default: "abierto" },
  capacidad: Number,
  votacionActiva: Boolean,
  mostrarResultadosVotacion: Boolean,
  totalInscritos: Number,
});

module.exports = mongoose.model("Event", eventSchema);