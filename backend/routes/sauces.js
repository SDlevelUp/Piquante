/**** ROUTEUR SAUCE ****/

const express = require('express');
const router = express.Router();

// On importe les middlewares requis quant à la gestion et l'authentification des sauces
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// On importe la constante du controller des sauces
const saucesCtrl = require('../controllers/sauces');

// Affichage des routes disponibles concernant les sauces

//get() pour répondre uniquement aux demandes GET
router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/', auth, multer, saucesCtrl.createSauce);
//:id => rendre la route accessible en tant que paramètre
router.get('/:id', auth, saucesCtrl.getOneSauce);

// Route : modification d'un objet existant
router.put('/:id', auth, multer, saucesCtrl.modifySauce);

// Route : suppression d'un objet existant
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.post('/:id/like', auth, saucesCtrl.likeOrDislike);

module.exports = router;
