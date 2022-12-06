// Import d'Express pour créer l'application et facilité la gestion des serveurs Node
const express = require('express');

// Middleware d'importation de MongoDB
const mongoose = require('mongoose');

// Importer un fichier de variables d'environnement ...
// ... => masquer le nom d'utilisateur et le mdp lors de la connection à la base de données
require('dotenv').config();

// Path : donne accés au chemin du système de fichiers
const path = require('path');

// Helmet : protéger votre application de certaines vulnérabilités, 
// => il ajoute des en-têtes HTTP qui empêchent le détournement d’informations.
const helmet = require('helmet');

// Import de Mongo-sanitize => pprimera toutes les clés commençant par '$', ainsi assainir votre code
const sanitize = require('express-mongo-sanitize');


// Importation des modèles utilisateur et sauces
const Sauce = require('./models/sauces')
const User = require('./models/user')

// Importation des routes 
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

// Connexion à mongoDB : facilite les interactions entre l'application Express et la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
      useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


//CORS « Cross Origin Resource Sharing » 
//Blocage des appels HTTP entre des serveurs différents => empêche les requêtes malveillantes d'accéder à des ressources sensibles
app.use((req, res, next) => {
  // MIDDLEWARE GENERAL : Ajout de headers à l'objet réponse qu'on renvoit au navigateur
  //Accéder à l'API depuis n'importe quelle origine avec => '*' 
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Autorisation pour utiliser certains Headers sur l'objet requête
  res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // ...ainsi que certaines méthodes, verbes de requêtes : GET, POST, PUT, etc.
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, PATCH, OPTIONS');
  // Appeler next: passer l'éxecution au middleware d'après
  next();
});


app.use(express.json());

// Ici, on ajoute les différents middlewarr des fichiers sauces, utilisateur et image
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
