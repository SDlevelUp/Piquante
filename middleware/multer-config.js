/**** MIDDLEWARE DE GESTION DES FICHIERS :  TÉLÉCHARGEMENT DES IMAGES ****/

// Importation du package multer 
const multer = require('multer');

// Dictionnaire qui est un objet (que l'on peut avoir depuis le frontend)
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//Elaboration d'un objet de configuration Multer + enregistrement sur le disque 
const storage = multer.diskStorage({ 
  //Dossier dans lequel on l'enregistre sur le disque, ici  'images'
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Fonction filename
  filename: (req, file, callback) => {
    // On génère un nouveau nom pour le fichier => on enlève les espace avec "split(' ')"
    //... qu'on remplace par des underscores avec "join('_')"
    const name = file.originalname.split(' ').join('_');
    // Elaboration de l'extention du fichier avec le MIME_TYPES
    const extension = MIME_TYPES[file.mimetype];
    //Appeler le callback : null => pas d'erreur
    callback(null, name + Date.now() + '.' + extension);
  },
});

// Exportation du fichier image vers le middleware multer
module.exports = multer({storage: storage}).single('image'); //single => uniquement des images