/**** ROUTEUR USER : ENREGISTRER LES ROUTES POUR LES USERS ****/

// Importation d'Express afin de fabriquer le router
const express = require('express');

// Fabrication du router via la fonction Router d'Express 
const router = express.Router();

// On importe la constante du controller de l'user => associé aux différentes routes
const userCtrl = require('../controllers/user');

/// Affichage des routes pour la connexion SignUp et SignIn
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// Exportation du router pour l'importer dans le fichier 'app.js'
module.exports = router;
