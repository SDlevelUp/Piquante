/**** MIDDLEWARE D'AUTHENTIFICATION :  SECURISATION DE LA CONNEXION D'UN USER la connexion d'un user ****/

// Importation du package jsonwebtoken (sert à créer et vérifier les tokens)
const jwt = require('jsonwebtoken');

//Variables d'environnement 
const dotenv = require("dotenv").config();

//Utilisation de ce middleware pour vérifier que l'USER est bien connecté et
//....transmettre les informations de connexions
module.exports = (req, res, next) => {
  // Gestion des erreurs avec "try.....catch"
  try {
    //Ici, on récupère le Token
    //Récupération du header d'autorisation de la requête
    const token = req.headers.authorization.split(' ')[1]; // Spliter/Diviser la chaine de caractère en tableau entre le Bearer et le Token
    // Décodage du TOKEN avec verify
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    //Récupération du user.id dans le TOKEN
    const userId = decodedToken.userId;
    // Si l'id ne correspond pas on affiche un message d'erreur
    req.auth = {
      userId: userId
    };
    // Fonction qui permet de passer à la fonction suivante une fois celle-ci terminée
    next();
  } catch (error) {
    // Error 401
    res.status(401).json({ error });
  }
};
