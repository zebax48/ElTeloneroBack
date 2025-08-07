const mongoose = require("mongoose");

const activeIdsSchema = new mongoose.Schema({
  eventId: String,
  votacionId: String,
});

module.exports = mongoose.model("ActiveIds", activeIdsSchema);