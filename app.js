const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express()

// Sécurité
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require("express-rate-limit");
require('dotenv').config();

//Routes
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');


// Conversion en JSON: intercepte les requête "content-typeJSON"
app.use(express.json()); 
app.use(helmet.xssFilter());

// Connexion à mongoDB
mongoose.connect('mongodb+srv://Sarah:Michmich-91@cluster0.p3w5kdv.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// MIDDLEWARE GENERAL : Ajout de headers à l'objet réponse qu'on revoit au navigateur 
app.use((req, res, next) => {
    //Tout le monde peut y accéder
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Autorisation pour utiliser certains Headers sur l'objet requête
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // ...ainsi que certaines méthodes, verbes de requêtes : GET, POST, PUT, etc.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    // Appeler next: passer l'éxecution au middleware d'après
    next();
  });


// Limitation du débit si trop de requêtes provenant de la même ip
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, //Requêtes max : 150
    standardHeaders: true, // Renvoie les informations de limite de taux dans les en-têtes
    legacyHeaders: false, // Désactiver les en-têtes `X-RateLimit-*`
  })
);

// Ralentissement de la vitesse si trop de requêtes provenant de la même ip
app.use(
  slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // Limitez chaque IP à 100 requêtes par 15 minutes
    delayMs: 500, // Commencer à ajouter 500 ms de délai par requête au-dessus de 100
  })
);

// Contre les injection SQL - pour sécuriser les données des utilisateurs
app.use(mongoSanitize());




// Lancement des routes
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
// Servir des fichiers statiques tels que des images, etc.
app.use('/images', express.static(path.join(__dirname,'images')));

module.exports = app;