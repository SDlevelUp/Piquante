/********* CONTROLLER SAUCE *********/

const Sauce = require('../models/Sauces');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
   const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,

    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    })
  sauce.save()
      .then(() => res.status(201).json({ message: 'Saved sauce' })) 
      .catch(error => res.status(400).json({ error })); 
};


exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(
    (sauce) => {
      res.status(200).json(sauce); 
    }
  ).catch((error) => {res.status(404).json({error});
    }
  );
};


exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) { 
              res.status(403).json({ message : 'Not authorized'});
            } else {
                const deleteFileImgStorage = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${deleteFileImgStorage}`, () => {
                    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                    .catch(error => res.status(401).json({ error }));
                }) 
            } 
        }
    )
    .catch((error) => {
        res.status(400).json({ error });
    });
};


exports.deleteSauce = (req, res, next) => {
  
    Sauce.findOne({ _id: req.params.id })
   
    .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({ message: 'You are not allowed to delete this sauce' });
        } else {
          const deleteFileImgStorage = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${deleteFileImgStorage}`, () => { //() => { 
            Sauce.deleteOne({ _id: req.params.id })
              .then(() => {
                res.status(200).json({ message: 'Sauce removed !' });
              })
              .catch((error) => res.status(401).json({ error }));
          });
        }
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
};


exports.likeOrDislike = (req, res, next) => {

    let userId = req.body.userId; 
    let paramsSauce = req.params.id;
    let likeSauce = req.body.like;

        if (likeSauce === 1) {
      Sauce.updateOne(
        { _id: paramsSauce },
        {
          $push: { usersLiked: userId},
          $inc: { likes: +1 },
        }
      )
        .then(() => res.status(200).json({ message: 'Like added !' }))
        .catch((error) => res.status(400).json({ error }));
      }
        if (likeSauce === -1) {
      Sauce.updateOne(
        { _id: paramsSauce },
        {
          $push: { usersDisliked: userId },
          $inc: { dislikes: 1 },
        }
      )
        .then(() => res.status(200).json({ message: "Dislike added !" }))
        .catch((error) => res.status(400).json({ error }));

        } if (likeSauce === 0) {
      Sauce.findOne(
        { _id: paramsSauce })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: paramsSauce },
              
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then(() => {
                res.status(200).json({ message: 'Like deleted !' });
              })
              .catch((error) => res.status(400).json({ error }));
            } else if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: paramsSauce },
              {
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
