const express = require('express');
const router = express.Router();
const votacionController = require('../controllers/votacionController');

router.post('/', votacionController.crearVotacion);
router.get('/', votacionController.obtenerVotaciones);
router.get('/:id', votacionController.obtenerVotacionPorId);

module.exports = router;