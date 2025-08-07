const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { registerUser, loginUser, updateUser, deleteUser, getAllUsers, logoutUser, getUser } = require('../controllers/userController');
const { updateUserPassword } = require('../controllers/userController.js');
//const { sendNewPasswordEmail } = require('../emailService');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/login', loginUser);
/*router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }
        const email = user.correo;
        const newPassword = user.password;
        const updateResult = await updateUserPassword(username, newPassword);

        if (updateResult) {
            const emailSent = await sendNewPasswordEmail(email, newPassword);
            if (emailSent) {
                return res.json({ message: 'Se ha enviado la contraseña al correo electrónico asociado a tu cuenta.' });
            } else {
                return res.status(500).json({ message: 'Error al enviar el correo electrónico.' });
            }
        } else {
            return res.status(400).json({ message: 'No se pudo restablecer la contraseña. Por favor, verifica el nombre de usuario proporcionado.' });
        }
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        return res.status(500).json({ message: 'Error al restablecer la contraseña.' });
    }
});*/

router.post('/register', authMiddleware, registerUser);
router.put('/update/:username', authMiddleware, updateUser);
router.delete('/delete/:username', authMiddleware, deleteUser);
router.get('/logout/:username', authMiddleware, logoutUser);
router.get('/', authMiddleware, getAllUsers);
router.get('/:username', authMiddleware, getUser)

module.exports = router;