/**** MIDDLEWARE :  SECURISATION DE LA CONNEXION D'UN USER la connexion d'un user ****/

// Importation de jsonwebtoken / sert à créer et vérifier les tokens
const jwt = require('jsonwebtoken');

//Utilisation de ce middleware pour vérifier que l'USER est bien connecté et
//....transmettre les informations de connexions
module.exports = (req, res, next) => {
  // Gestion des erreurs
  try {
    const token = req.headers.authorization.split(' ')[1]; // Spliter/Diviser la chaine de caractère en tableau
    // Décodage du TOKEN
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    //Récupération du user.id dans le TOKEN
    const userId = decodedToken.userId;
    // Si l'id ne correspond pas on affiche un message d'erreur
    req.auth = {
      userId: userId
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
