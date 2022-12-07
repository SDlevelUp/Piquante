/**** ROUTEUR SAUCE : ENREGISTRER NOS ROUTES POUR LES SAUCES****/

// Importation d'Express
const express = require('express');
const router = express.Router();

// Importation des middlewares requis quant à la gestion et l'authentification des sauces
const auth = require('../middleware/auth');

// Importation du middleware afin de l'appliquer à la route POST
const multer = require('../middleware/multer-config');

// Importation de la constante du controller des sauces
const saucesCtrl = require('../controllers/sauces');

// Affichage des routes disponibles concernant les sauces

// Fabrication d'une nouvelle sauce
router.post('/', auth, multer, saucesCtrl.createSauce);

// Modification d'une sauce existante 
router.put('/:id', auth, multer, saucesCtrl.modifySauce);

// Suppression d'une sauce précise 
router.delete('/:id', auth, saucesCtrl.deleteSauce);

// Affichage de la fiche produit
router.get('/:id', auth, saucesCtrl.getOneSauce);

// Récupération de toutes les sauces (sur la page d'acceuil)
router.get('/', auth, saucesCtrl.getAllSauces);

// Liker ou disliker une sauce selon l'id de l'user
router.post('/:id/like', auth, saucesCtrl.likeOrDislike);

// Exporter le module router pour les routes
module.exports = router;
