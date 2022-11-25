/********* CONTROLLER SAUCE *********/

// IMPORTATION MODEL SAUCE
const Sauce = require('../models/Sauces');

// Appel du package fs de Node
const fs = require('fs');

// CREER UNE SAUCE
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  // Vu que le frontend renvoie également un id (générer automatiquement par MongoDB),
  // ... on va enlever le champ id du corps de la requête avant de copier l'objet
  delete sauceObject._id;
  const sauce = new Sauce({
    //Opérateur "spread" : copier les champs qui sont dans le corps de la request
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  // Enregistrement de la sauce dans a BDD avec la méthode 'save'...
  sauce.save()
  //Même si tout se passe bien et que tout est enregistrer, il faut :
  // 1. Retourner une promise, renvoyer une réponse au frontend (sinon la requête expire) 
      .then(() => res.status(201).json({ message: 'Saved sauce' })) // CODE 201 : BONNE CRÉATION DE RESSOURCE + ENVOI DE RÉPONSE AU JSON
      // 2. Récupérer l'erreur et renvoyer un code 400
      .catch(error => res.status(400).json({ error })); //Equivaut à error : error
};

// AFFICHER LA SAUCE SUR LAQUELLE ON CLIQUE
//Trouver un seul objet dans la BDD par son identifiant, (l'id apparait dans la barre de recherche quand on clique sur la sauce)
exports.getOneSauce = (req, res, next) => {
  // L'identifiant va envoyer l'id de l'objet
  // On veut que l'id de la sauce soit le même soit le même que le paramètre de la requête (càd : GET)
  Sauce.findOne({_id: req.params.id})
  //1. Retourner une promise, renvoyer une réponse au frontend (sinon la requête expire) 
  .then(
    //Retrouver la sauce si elle existe dans notre BDD
    (sauce) => {
      res.status(200).json(sauce); // CODE 201 : BONNE CRÉATION DE RESSOURCE + ENVOI DE RÉPONSE AU JSON
    }
    // 2. Récupérer l'erreur et renvoyer un code 404 // si OBJET NON TROUVÉ ou ERREUR
  ).catch((error) => {res.status(404).json({error});
    }
  );
};


//MODIFICATION SAUCE EXISTANTE
exports.modifySauce = (req, res, next) => {
  //Voir si il y a un fichier existant dans notre requête
  const sauceObject = req.file ? {
    //Si c'est le cas : 
    // Gestion du cas dans lequel la requête est faite par un fichier
      // Récupérer l'objet en parsant la chaîne
    ...JSON.parse(req.body.sauce),
    // Et on recréer l'URL de l'image
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  //AUTRE MESURE DE SÉCURITÉ 
  // On doit aussi supprimer l'user id venant de la requête
  delete sauceObject._userId;
  //On récupère la sauce de notre BDD pur voir si c'est bien l'utilisateur qui est à l'origine de la modification de l'objet
  Sauce.findOne({_id: req.params.id})
      //Promise 
      //En cas de succès : on résupère l'objet 
      .then((sauce) => {
        //et on vérifie qu'il appartient à l'utilisateur qui effectue la modification
          if (sauce.userId != req.auth.userId) { //Si le champ userId récupérer est différent de l'user id venant du token => qqun modifie un objet ne lui appartenant pas
              res.status(403).json({ message : 'Not authorized'});
          } else {
            //Cas où l'userId est OK : Mettre à jour l'enregistrement de la modification
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})//...sauceObject, _id : ce qui est récupérer avec l'Id venant des paramètre de l'URL
              //Réussite: code 200
              .then(() => res.status(200).json({message : 'Modified sauce!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      //Échec: code 400
      .catch((error) => {
          res.status(400).json({ error });
      });
};


//SUPPRESSION D'UNE SAUCE UNIQUEMENT SI C'EST LE BON UTILISATEUR QUI LE DEMANDE

exports.deleteSauce = (req, res, next) => {
  //On récupère l'objet 
  //On vérifie bien que c'est le bon utilisateur à l'origine de la requête avec les bons paramètres
    Sauce.findOne({ _id: req.params.id })
    //Promise
    .then((sauce) => {
        // On vérifie bien si l'userId qui fait la manip ne correspond pas à l'utilisateur authentifié
        if (sauce.userId != req.auth.userId) {
          //Renvoie un message d'erreur si c'est pas le cas
          res.status(401).json({ message: 'You are not allowed to delete this sauce' });
        } else {
          //Sinon, on peut passer à l'étape suivante : la suppression de l'image du dossier backend
          //Constante pour appeler le fichier à supprimer
          const deleteFileImgStorage = sauce.imageUrl.split('/images/')[1];//Récupération du nom du fichier avec split autour du répertoire image
          //Supprimer le fichier avec la méthode unlink de fs
          fs.unlink(`images/${deleteFileImgStorage}`, () => { //() => { : Callback : méthode qui va être appelée une fois que la suppression aura eu lieu, la suppression est faite de manière asynchrones
            Sauce.deleteOne({ _id: req.params.id })
              .then(() => {
                //Réussite: code 200
                res.status(200).json({ message: 'Sauce removed !' });
              })
              // Échec: code 400
              .catch((error) => res.status(400).json({ error }));
          });
        }
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
};

// LIKE / DISLIKE
exports.likeOrDislike = (req, res, next) => {
    // Si l'utilisateur aime la sauce
    if (req.body.like === 1) {
      // On ajoute 1 like et on l'envoie dans le tableau "usersLiked"
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: req.body.like++ },
          $push: { usersLiked: req.body.userId },
        }
      )
        .then(() => res.status(200).json({ message: 'Like added !' }))
        .catch((error) => res.status(400).json({ error }));
    } else if (req.body.like === -1) {
      // Si l'utilisateur n'aime pas la sauce
      // On ajoute 1 dislike et on l'envoie dans le tableau "usersDisliked"
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: req.body.like++ * -1 },
          $push: { usersDisliked: req.body.userId },
        }
      )
        .then(() => res.status(200).json({ message: "Dislike added !" }))
        .catch((error) => res.status(400).json({ error }));
    } else {
      // Si like === 0 l'utilisateur supprime son vote
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          // Si le tableau "userLiked" contient l'ID de l'utilisateur
          if (sauce.usersLiked.includes(req.body.userId)) {
            // On enlève un like du tableau "userLiked"
            Sauce.updateOne(
              { _id: req.params.id },
              { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
            )
              .then(() => {
                res.status(200).json({ message: 'Like deleted !' });
              })
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            // Si le tableau "userDisliked" contient l'ID de l'utilisateur
            // On enlève un dislike du tableau "userDisliked"
            Sauce.updateOne(
              { _id: req.params.id },
              {
                // UserId est supprimé du tableau des usersDisliked et on décrémente disLikes
                $pull: { usersDisliked: req.body.userId },
                $inc: { dislikes: -1 },
              }
            )
              .then(() => {
                res.status(200).json({ message: 'Dislike deleted !' });
              })
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
    }
  };

  // AFFICHER TOUTES LES SAUCES SUR LE SITE
  exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then((sauces) => {
        res.status(200).json(sauces);
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  };



