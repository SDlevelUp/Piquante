const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');

//Dotenv = Importer un fichier de variables d'environnement.
const dotenv = require("dotenv").config();

const bodyParser = require('body-parser');


// importation de mongo-sanitize pour éviter les injections SQL
const sanitize = require('express-mongo-sanitize');

// Déclaration des routes à utilisées
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

// ELABORATION DE L'APP EXPRESS
const app = express();

//RATE-LIMIT
const rateLimit = require('express-rate-limit')
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limite chaque IP à 100 requêtes par fenêtre toutes les 15 minutes
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Connexion à mongoDB
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
      useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// MIDDLEWARE GENERAL : Ajout de headers à l'objet réponse qu'on revoit au navigateur
app.use((req, res, next) => {
  //Tout le monde peut y accéder
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Autorisation pour utiliser certains Headers sur l'objet requête
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  // ...ainsi que certaines méthodes, verbes de requêtes : GET, POST, PUT, etc.
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  // Appeler next: passer l'éxecution au middleware d'après
  next();
});

// Conversion en JSON: intercepte les requête 'content-typeJSON'
// Ici, ajout des middleware des fichiers : user, sauces et images
app.use(express.json());
app.use(bodyParser.json());

//EXPORTATION DES ROUTES SAUCES, AUTHENTIFICATION ET IMAGE
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Ajout du middleware associé à helmet
app.use(helmet());

// Ajout du middleware associé à express-rate-limit
app.use('/api', apiLimiter)

//Ajout du middleware sanitize
app.use(sanitize());

module.exports = app;
