/********* CONTROLLER SAUCE *********/

// Importation du modèle sauce
const Sauce = require('../models/Sauces');

// Appel du package fs de Node => permettant de modifier le système de fichiers
const fs = require('fs');


/***********************POST***********************/

// Créer une sauce et l'enregistrer dans la BDD
exports.createSauce = (req, res, next) => {
  // Les données envoyées par le frontend sont stockées et transformé en objet JSON
  const sauceObject = JSON.parse(req.body.sauce);
  // Vu que le frontend renvoie également un id (générer automatiquement par MongoDB),
  // ... on va enlever le champ id du corps de la requête avant de copier l'objet
  delete sauceObject._id;
  // Dans la constante 'sauce' on lui passe comme objet toutes les infos requises  
  const sauce = new Sauce({
    //Opérateur "spread" : copier les champs qui sont dans le corps de la request
      ...sauceObject,
      //URL de l'image
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,

    // Initialisation des likes et dislikes de la sauce à 0
    likes: 0,
    dislikes: 0,

    // Initialisation des usersLiked et usersDisliked avec des tableaux vides
    usersLiked: [],
    usersDisliked: [],
    });
  // Enregistrement de la sauce dans a BDD avec la méthode 'save'...
  sauce.save()
  //Même si tout se passe bien et que tout est enregistrer, il faut :
  // 1. Retourner une promise, renvoyer une réponse au frontend (sinon la requête expire) 
      .then(() => res.status(201).json({ message: 'Saved sauce' })) // CODE 201 : BONNE CRÉATION DE RESSOURCE + ENVOI DE RÉPONSE AU JSON
      // 2. Récupérer l'erreur et renvoyer un code 400
      .catch(error => res.status(400).json({ error })); //Equivaut à error : error
};


/***********************GET***********************/
// AFFICHER LA SAUCE SUR LAQUELLE ON CLIQUE
//Trouver un seul objet dans la BDD par son identifiant, (l'id apparait dans la barre de recherche quand on clique sur la sauce)
exports.getOneSauce = (req, res, next) => {
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

/***********************PUT***********************/

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



/***********************DELETE***********************/

//SUPPRESSION D'UNE SAUCE UNIQUEMENT SI C'EST LE BON UTILISATEUR QUI LE DEMANDE

exports.deleteSauce = (req, res, next) => {
  //On récupère l'objet 
  //On vérifie bien que c'est le bon utilisateur à l'origine de la requête avec les bons paramètres, avec " : "
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
              .catch((error) => res.status(401).json({ error }));
          });
        }
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
};


/***********************POST***********************/

// LIKE / DISLIKE
exports.likeOrDislike = (req, res, next) => {

    //Déclaration de variables pour "désengorger la partie "likeOrDislike" :
    let userId = req.body.userId; 
    let paramsSauce = req.params.id;
    let likeSauce = req.body.like;

  // 1. Le User va liker une sauce 

    // Si le corps de la requete a 1 like 
        if (likeSauce === 1) {
      // Mise à jour des likes avec 'updateOne'
      Sauce.updateOne(
        // On vérifie bien que c'est le bon utilisateur à l'origine de la requête avec les bons paramètres
        { _id: paramsSauce },
        {
          // User clique sur like => il est pusher dans le tableau des usersLiked
          $push: { usersLiked: userId},
          // ... Et on incrémente 1 like (c'est-à-dire d'ajouter un)
          $inc: { likes: +1 },
        }
      )
        .then(() => res.status(200).json({ message: 'Like added !' }))
        .catch((error) => res.status(400).json({ error }));
      }
        // Si l'utilisateur n'aime pas la sauce (clique pour la première fois sur 'dislike')
        if (likeSauce === -1) {
      // Mise à jour des likes avec 'updateOne'
      Sauce.updateOne(
        { _id: paramsSauce },
        {
          // User clique sur dislike => il est pusher dans le tableau des usersDisliked
          $push: { usersDisliked: userId },

          //On incrémente 1 dislike (c'est-à-dire d'ajouter un)
          $inc: { dislikes: 1 },
        }
      )
        .then(() => res.status(200).json({ message: "Dislike added !" }))
        .catch((error) => res.status(400).json({ error }));


    // 2. User va supprimer son like ou dislike

        } if (likeSauce === 0) {
          // Récupérer la sauce dans BDD
      Sauce.findOne(
        { _id: paramsSauce })
        .then((sauce) => {
          // Si le tableau "userLiked" contient l'ID de l'utilisateur
          if (sauce.usersLiked.includes(userId)) {
            // On enlève un like du tableau "userLiked" => on Update
            Sauce.updateOne(
              { _id: paramsSauce },
              // L'userId est supprimé du tableau 'usersLiked' et on décrémente likes
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then(() => {
                res.status(200).json({ message: 'Like deleted !' });
              })
              .catch((error) => res.status(400).json({ error }));
            
              // Enfin : cas où l'utilisateur à déjà cliquer sur le 'dislike'
            } else if (sauce.usersDisliked.includes(userId)) {
              // Si le tableau "userDisliked" contient l'ID de l'utilisateur
            // On enlève un dislike du tableau "userDisliked"
            Sauce.updateOne(
              { _id: paramsSauce },
              {
                // UserId est supprimé du tableau des usersDisliked et on décrémente disLikes
                $pull: { usersDisliked: userId },
                $inc: { dislikes: -1 },
              }
            )
              .then(() => {
                res.status(200).json({ message: 'Dislike deleted !' });
              })
              .catch((error) => res.status(400).json({ error }));
          }
        })
    }
  };


  /***********************GET***********************/

  // Récupérer la liste de toutes les sauces 
  exports.getAllSauces = (req, res, next) => {
    // Utilisation de find() => permet de trouver les sauces dans la BDD
    Sauce.find()
      .then((sauces) => {
        // Récupération des sauces sous forme de tableau en JSON
        res.status(200).json(sauces);
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  };
