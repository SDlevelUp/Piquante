/********* FABRICATION DES PARAMETRES D'UTILISATEUR UNIQUE *********/

//APPEL DE MONGOOSE
const mongoose = require('mongoose');

//VALIDATION DES DONNEES UNIQUE DE L'UTILISATEUR
const uniqueValidator = require('mongoose-unique-validator');

//SCHEMA DE PARCOURS 
const userSchema = mongoose.Schema({
  //EMAIL UNIQUE SERA REQUIS :
  email: { type: String, required: true, unique: true },
  //UN MOT DE PASSE UNIQUE REQUIS
  password: { type: String, required: true },
});

//PLUG-IN : Deux utilisateur ne pourront pas partager le même e-mail
userSchema.plugin(uniqueValidator);

//MODULE D'EXPORTATION DU MODEL USER
module.exports = mongoose.model('User', userSchema);
