const express = require('express');
const router = express.Router();
const votacionController = require('../controllers/votacionController');
const authMiddleware = require('../middleware/authMiddleware.js');

router.get('/:id', votacionController.obtenerVotacionPorId);
router.post('/', authMiddleware, votacionController.crearVotacion);
router.get('/', authMiddleware, votacionController.obtenerVotaciones);

module.exports = router;