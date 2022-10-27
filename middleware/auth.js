// Importation de jsonwebtoken
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Gestion des erreurs
  try {
    const token = req.headers.authorization.split(' ')[1];// Spliter/Diviser la chaine de caractère en tableau
    // Décodage du TOKEN
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    //Récupération du user.id dans le TOKEN
    const userId = decodedToken.userId;
    //Ajout de cette valeur qui sera transmis au route par la suite
    req.auth = {
      userId: userId   // request 
  };
      next();
  } catch(error) {
      res.status(401).json({ error });
  }
};










//     if (req.body.userId && req.body.userId !== userId) {
//       throw ' 403: unauthorized request.';
//     } else {
//       next();
//     }
//     //On récupère l'erreur 
//   } catch {
//     // Erreur "401" en cas d'erreur (savoir d'où vient le problème)
//     res.status(401).json({
//       error: new Error('Invalid request!')
//     });
//   }
// };