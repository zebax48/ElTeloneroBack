const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombreCompleto: { type: String, required: false },
    correo: { type: String, required: false },
    token: { type: String, required: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;