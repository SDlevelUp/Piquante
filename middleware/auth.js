/**** MIDDLEWARE D'AUTHENTIFICATION :  SECURISATION DE LA CONNEXION D'UN USER la connexion d'un user ****/

const jwt = require('jsonwebtoken');
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Spliter/Diviser la chaine de caractère en tableau entre le Bearer et le Token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};