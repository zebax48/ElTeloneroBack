const express = require('express');
const router = express.Router();
const votacionController = require('../controllers/votacionController');
const authMiddleware = require('../middleware/authMiddleware.js');

router.get('/activa/:eventoId', votacionController.obtenerVotacionActiva);
router.get('/:id', votacionController.obtenerVotacionPorId);
router.post('/', authMiddleware, votacionController.crearVotacion);
router.get('/', authMiddleware, votacionController.obtenerVotaciones);
router.put('/activar/:id', authMiddleware, votacionController.activarVotacion);
router.post('/votar/:id', votacionController.votar);

module.exports = router;