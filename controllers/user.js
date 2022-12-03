/************************* CONTROLLERS / USER *************************/

// On exporte le 'models/User' afin 'd'enregistrer et pouvoir lire' les users
const User = require('../models/User');

// Package du TOKEN d'authentification avec "jsonwebtotoken"
const jwt = require('jsonwebtoken');

// Installation de bcrypt : cryptage mdp
const bcrypt = require('bcrypt');

// CryptoJS : Module qui aide à chiffrer, déchiffrer ou hacher des données
const cryptojs = require('crypto-js')
console.log(process.env.CRYPTOJS_EMAIL)

const dotenv = require("dotenv").config();


/*************************SIGNUP*************************/

// 1. SIGNUP : qui va créer le mot de passe
exports.signup = (req, res, next) => {

  const cryptEmail = cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_EMAIL).toString();
    // Saler la fonction 10x, plus c'est élevé plus cest long et sécurisé => fonction asynchrone
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      // Fabrication d'un nouveau User
      const user = new User({
        email: cryptEmail,
        password: hash
      });
      // Et le sauvegarder dans la BDD
      user.save()
        .then(() => res.status(201).json({ message: "Utilisateur créé" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/*************************LOGIN*************************/
// 2. Le LOGIN : qui va vérifier qu l'utilisateur se connecte avec des identifiantes valides
exports.login = (req, res, next) => {
  const decryptEmail = cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_EMAIL).toString();
  // CHECK : Email fournie par l'utilisateur correspond à un utilisateur existant dans la BDD
  User.findOne({ email: decryptEmail })
      .then(user => {
          if (!user) {
              return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
          }
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) {
                      res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                  } else {
                  res.status(200).json({
                      userId: user._id,
                      //Chiffrer un nouveau token
                      token: jwt.sign(
                        // Récupération de l'id utilisateur
                          { userId: user._id },
                          // Clé secrète temporaire
                          'RANDOM_TOKEN_SECRET',
                          // Le TOKEN a dune durée de validité de 24H
                          { expiresIn: '24h' }
                      )
                  });
                }
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};