//userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

const registerUser = async (req, res) => {
    const { username, password, nombres, apellidos, correo} = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }
        user = new User({
            username,
            password,
            nombres,
            apellidos,
            correo,
        });
      // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

const getUser = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        // Generar un token único para el usuario
        const token = jwt.sign({ userId: user._id }, 'jwtSecret', { expiresIn: '1h' });

        // Almacenar el token en la base de datos
        user.token = token;
        await user.save();
        console.log('Token almacenado en la base de datos:', token);
       
        // Establecer el token como una cookie de sesión
        res.cookie('token', token, { httpOnly: true });
        
        res.json({ 
            token,
            id: user._id,
            username: user.username,
            nombres: user.nombres,
            apellidos: user.apellidos,
            correo: user.correo,
});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

const logoutUser = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Eliminar el token de sesión del usuario en la base de datos
        console.log('Valor de user.token:', user.token);
        const revokedToken = user.token;
        console.log('RT EN LOGOUT:', revokedToken);
        user.token = null;
        await user.save();

        // Agregar el token revocado a la lista de tokens revocados
        if (revokedToken) {
            await RevokedToken.create({ token: revokedToken });
            console.log('Token agregado a la lista de tokens revocados');
        }
        // Eliminar la cookie de sesión
        res.clearCookie('token');
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
};

const updateUser = async (req, res) => {
    const username = req.params.username; 
    const { newUsername, newPassword, newNombres, newApellidos, newCorreo } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.username = newUsername;
        user.nombres = newNombres;
        user.apellidos = newApellidos;
        user.correo = newCorreo;

        // Verificar si newPassword está definida antes de intentar hashearla
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener todos los usuarios' });
    }
};

//Generar contraseña aleatoria para usuarios que la olvidaron
const generateRandomPassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return newPassword;
};

//Utilizar contraseña aleatoria para usuario indicado
const updateUserPassword = async (username, newPassword) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return false;
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return true;
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return false;
    }
};

const deleteUser = async (req, res) => {
    const username = req.params.username; 

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await User.findOneAndDelete({ username });

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    deleteUser,
    getAllUsers,
    generateRandomPassword,
    updateUserPassword,
    getUser
};