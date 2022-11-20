/************************* MIDDLEWARE D'AUTHENTIFICATION *************************/

// On exporte le 'models/User' afin 'd'enregistrer et pouvoir lire' les users
const User = require('../models/User');

// Installation du TOKEN d'authentification avec "jsonwebtotoken"
const jwt = require('jsonwebtoken');

// Installation de bcrypt : cryptage mdp
const bcrypt = require('bcrypt');

require('dotenv').config(); 

/*************************SIGNUP*************************/

// 1. SIGNUP : qui va créer le mot de passe
exports.signup = (req, res, next) => {

  // saler la fonction 10x, plus c'est élevé plus cest long et sécurisé => fonction asynchrone
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      // FABRICATION USER
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: "Utilisateur créé" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/*************************LOGIN*************************/
// 2. Le LOGIN : qui va vérifier qu l'utilisateur se connecte avec des identifiantes valides
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
      .then(user => {
          if (!user) {
              return res.status(401).json({ error: 'Utilisateur non trouvé !' });
          }
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) {
                      return res.status(401).json({ error: 'Mot de passe incorrect !' });
                  }
                  res.status(200).json({
                      userId: user._id,
                      token: jwt.sign(
                          { userId: user._id },
                          'RANDOM_TOKEN_SECRET',
                          { expiresIn: '24h' }
                      )
                  });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};