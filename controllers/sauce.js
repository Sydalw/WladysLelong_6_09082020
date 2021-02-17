const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce= (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes:0,
    dislikes:0
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {res.status(200).json(sauce);})
        .catch((error) => {res.status(404).json({error: error});}
        );
};

exports.modifySauce = (req, res, next) => {
    if (req.file != null) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) throw err;
                });
            })
            .catch(error => res.status(500).json({ error }));
    }
    const sauceObject = req.file ?
        {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {

    const userId = req.body.userId;
    const like = req.body.like;

    Sauce.findOne({_id: req.params.id })
        .then(sauce => {
            const firstUserLiked = sauce.usersLiked.findIndex(element => element === userId);
            const firstUserDisliked = sauce.usersDisliked.findIndex(element => element === userId);
            switch (like) {
                case 1:
                    sauce.likes++;
                    if (sauce.usersLiked.length == 0) {
                        sauce.usersLiked = [userId];
                    } else {
                        sauce.usersLiked.push(userId);
                    }
                    break;
                case 0:
                    if (firstUserLiked >= 0 ){
                        var deletedUser = sauce.usersLiked.splice(firstUserLiked,1);
                        sauce.likes--;
                    }else{
                        var deletedUser = sauce.usersDisliked.splice(firstUserDisliked,1);
                        sauce.dislikes--;
                    }
                    break;
                case -1:
                    sauce.dislikes++;
                    if (sauce.usersDisliked.length == 0) {
                        sauce.usersDisliked = [userId];
                    } else {
                        sauce.usersDisliked.push(userId);
                    }
            }
            sauce
                .save()
                .then(() => res.status(200).json({message: 'Choix enregistré'}))
                .catch((error) => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
};
