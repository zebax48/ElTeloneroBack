const nodemailer = require('nodemailer');

const sendNewPasswordEmail = async (email, newPassword) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: 'softwarera.tdea@outlook.com',
                pass: 'TdeA*2024'
            }
        });

        const mailOptions = {
            from: 'softwarera.tdea@outlook.com',
            to: email,
            subject: 'Contraseña Software RA',
            text: `Tu contraseña es: ${newPassword}`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo electrónico enviado con éxito a ${email}`);
        return true; // Correo electrónico enviado exitosamente
    } catch (error) {
        console.error(`Error al enviar el correo electrónico a ${email}:`, error);
        return false; // Error al enviar el correo electrónico
    }
};

module.exports = { sendNewPasswordEmail };