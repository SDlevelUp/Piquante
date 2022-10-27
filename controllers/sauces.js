const Sauce = require('../models/Sauces');
const fs = require('fs');

//-------ROUTES---------//

// Créer une sauce
exports.createSauce = (req, res, next) => {
    // On parse l'objet requête
    const sauceObject = JSON.parse(req.body.sauce);
    // Supprimer l'id => généré par la bdd et userid => on utilise l'userid du token
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        // Proctocol, nom d'hôte, image + nom de fichier donné par multer
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // Enregistrement dans la base de données
    sauce.save()
    .then(() => { res.status(201).json({message: 'objet enregistré '})})
    .catch(error => { res.status(500).json( { error })})
};


// Modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce), 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne( {_id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message : 'Access not granted'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(204).json({message : 'Objet modifié!'}))
                .catch(error => res.status(500).json({ error }));
            }
        })
        .catch((error) => {
            res.status(404).json({ error });
        });
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
       .then(sauce => {
           if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = sauce.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Sauce.deleteOne({_id: req.params.id})
                       .then(() => { res.status(204).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(500).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};


// Récupérer une seule sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};


//Récupérer toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};


//Création like ou dislike (issue de => post/:id/like)
exports.likeOrDislike = (req, res, next) => {
    // L'utilisateur aime une sauce
    if (req.body.like === 1) { 
      // Ajout du "1 like" + renvoie dans le tableau "usersLiked"
      Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
        .then(() => res.status(204).json({ message: 'Like ajouté !' }))
        .catch(error => res.status(500).json({ error }));
    } else if (req.body.like === -1) { 
      // L'utilisateur n'aime une sauce
      // Ajout du "1 dislike" et on l'envoie dans le tableau "usersDisliked"
      Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } }) 
        .then(() => res.status(204).json({ message: 'Dislike ajouté !' }))
        .catch(error => res.status(500).json({ error }));
    } else { 
      // Si like === 0 => l'utilisateur supprime son like
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          // le tableau "userLiked" contient l'ID de l'utilisateur
          if (sauce.usersLiked.includes(req.body.userId)) { 
            // 1 Like du tableau est enlever 
            Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                .then(() => { res.status(204).json({ message: 'Votre like a été supprimé !' }) })
                // Un status 500 est généré par le server si il y a une erreur
                .catch(error => res.status(500).json({ error }))
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
              // Le tableau "userDisliked" contient l'ID de l'utilisateur
            // 1 dislike est retiré du tableau "userDisliked" 
              Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                .then(() => { res.status(204).json({ message: 'Votre dislake a été supprimé !' }) })
                // Un status 500 est généré par le server si il y a une erreur
                .catch(error => res.status(500).json({ error }))
          }
        })
        .catch(error => res.status(500).json({ error }));
    }
  };