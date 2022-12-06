/**** MÉTHODE MODEL : TRANSFORME LE MODEL EN MODÈLE UTILISABLE ****/
//Pouvoir lire, enregistrer et modifier les objets  en vente dans notre BDD

//Importation de Mongoose pour créer le schéma
const mongoose = require('mongoose');//require : importation de la librairie Mongoose et ses fonctions

// Élaboration de notre schéma de données pour notre BDD MongoDB.
const sauceSchema = mongoose.Schema({ //mongoose.Schema : package mis à disposition par le package Mongoose
  //...qui va lui dicter les différents champs dont notre sauceSchema à besoin

  // Élaboration de notre 'objet' : "required: true" (sans titre par exemple, on ne pourra pas enregistrer la sauce dans notre BDD)
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 }, //Zéro par défault mais on peut mettre un autre chiffre si il faut
  dislikes: { type: Number, default: 0 }, //Zéro par défault mais on peut mettre un autre chiffre si il faut
  usersLiked: { type: [String] },
  usersDisliked: { type: [String] },
});

//Exportation du modèle terminer : en arguments => le nom du modèle et le schéma utilisé
module.exports = mongoose.model('Sauce', sauceSchema);
