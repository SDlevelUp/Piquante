/********* FABRICATION DES PARAMETRES D'UTILISATEUR UNIQUE *********/

// Import de Mongoose
const mongoose = require('mongoose');

// Validation des données unique de l'utilisateur avant de les enregistrer
const uniqueValidator = require('mongoose-unique-validator');

// Fabrication du schéma utilisateur (package Mongoose)
const userSchema = mongoose.Schema({
  //EMAIL UNIQUE SERA REQUIS :
  email: { type: String, required: true, unique: true },
  //UN MOT DE PASSE UNIQUE REQUIS
  password: { type: String, required: true },
});

// PLUG-IN : Deux utilisateur ne pourront pas partager le même e-mail
userSchema.plugin(uniqueValidator);

// Importation du module d'exportation du modèle user et du schéma 
module.exports = mongoose.model('User', userSchema);
