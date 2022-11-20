/**** ROUTEUR USER ****/

const express = require('express');
const router = express.Router();

// On importe la constante du controller de l'user
const userCtrl = require('../controllers/user');

/// Affichage des routes de connexion

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
