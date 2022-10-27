// Installation de bcrypt : cryptage mdp
const bcrypt = require('bcrypt');

// Installation de jsonwebtoken
const jwt = require('jsonwebtoken');

// On exporte le "models/User" afin "d'enregistrer et pouvoir lire" les users
const User = require('../models/User');


//Mise en place de deux Middleware pour l'authentification :

// 1. SIGNUP : qui va créer le mot de passe
exports.signup = (req, res, next) => {
  // Appel de la fonction de hachage de bcrypt:
  //Saler le mdp 10x, Plus la valeur est élevée, plus l'exécution de la fonction sera longue, et plus le hachage sera sécurisé
  //....=> fonction asynchrone
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Elaboration d'un utilisateur ...
      const user = new User({
        email: req.body.email,
        password: hash
      });
      //... et enregistrement de ce dernier dans la base de données User
      user.save()
      // Réponse de réussite en cas de succès
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
      // Erreur en cas d'échec
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};


// 2. Le LOGIN : qui va vérifier qu l'utilisateur se connecte avec des identifiantes valides
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
      .then(user => {
        if (user === null) {
              res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
          } else {
          // On compare le mdp entré par l'utilisateur avec le hash enregistré dans le bdd
          bcrypt.compare(req.body.password, user.password)
          //Requête s'est bien passée : si l'utilisateur a bien été trouvé et mdp correct
              .then(valid => {
                  if (!valid) {
                       res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                  } else {
                  // Tout est ok : on renvoit une réponse "200" avec l'id utilisateur et un token
                  res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        // Clé de cryptage : doit être difficile à deviner
                        'RANDOM_TOKEN_SECRET',
                        //Durée de validation du TOKEN : 24h
                        { expiresIn: '24h' }
                    )
                  });
                }
              })
              .catch(error => res.status(500).json({ error }));
            }
      })
      //Erreur server
      .catch(error => res.status(500).json({ error }));
};