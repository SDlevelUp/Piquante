const express = require('express');
const mongoose = require('mongoose');


// Path : donne accés au chemin du système de fichiers
const path = require('path');

// Helmet : protéger votre application de certaines vulnérabilités, 
// => il ajoute des en-têtes HTTP qui empêchent le détournement d’informations.
const helmet = require('helmet');

//Dotenv = Importer un fichier de variables d'environnement
// const dotenv = require("dotenv").config();

// Sanitize = Il supprimera toutes les clés commençant par '$', ainsi assainir votre code
const sanitize = require('express-mongo-sanitize');

// Déclaration des routes à utilisées
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

// App Express (framework backend)
const app = express();

//RateLimit : limiter les demandes répétées aux API publiques et/ou aux points de terminaison 
// => comme les demandes de réinitialisation du MDP
const rateLimit = require('express-rate-limit')
// apiLimiter = Configuration de la limite des requêtes autorisées par fenêtres
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limite chaque IP à 100 requêtes par fenêtre toutes les 15 minutes
	standardHeaders: true, // Renvoyer les informations de limite de taux dans les en-têtes `RateLimit-*`
	legacyHeaders: false, // Désactiver les en-têtes `X-RateLimit-*
})

// Connexion à mongoDB
mongoose.connect(
  "mongodb+srv://Sarah:Michmich-91@cluster0.p3w5kdv.mongodb.net/?retryWrites=true&w=majority",
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


app.use(express.json());

//EXPORTATION DES ROUTES SAUCES, AUTHENTIFICATION ET IMAGE
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Ajout du middleware associé à helmet
app.use(helmet());

// Ajout du middleware associé à express-rate-limit
app.use('/api', apiLimiter)

//Ajout du middleware associé à MongoSanitize
app.use(sanitize());

module.exports = app;
