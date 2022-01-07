const UserProfile = require("../models/userProfile");

// LA REQUETE FRONT DOIT ETRE AU FORMAT FORMDATA (VOIR DOC) ET NON JSON POUR LES FICHIERS (IMAGES)!
exports.createUserProfile = (req, res, next) => {
  const userProfileObject = JSON.parse(JSON.stringify(req.body));
  delete userProfileObject._id;
  const userProfile = new UserProfile({
    ...userProfileObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  userProfile
    .save()
    .then(() => {
      res.status(201).json({
        message: "Post saved successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getUserProfile = (req, res, next) => {
  UserProfile.findOne({
    userId: req.params.userId,
  })
    .then((thing) => {
      res.status(200).json(thing);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyUserProfile = (req, res, next) => {
  console.log(req);
  UserProfile.findOne({ _id: req.params.id }).then((userProfile) => {
    if (!userProfile) {
      return res.status(404).json({
        error: "No such Thing!",
      });
    }
    if (userProfile.userId !== req.auth.userId) {
      return res.status(401).json({
        error: "Unauthorized request!",
      });
    }

    const userProfileObject = req.file
      ? {
          ...JSON.parse(JSON.stringify(req.body)),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    UserProfile.updateOne(
      { _id: req.params.id },
      { ...thingObject, _id: req.params.id }
    )
      .then(() =>
        res
          .status(200)
          .json(
            req.file
              ? `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
                }`
              : { message: "Objet modifié !" }
          )
      )
      .catch((error) => res.status(400).json({ error }));
  });
};

exports.deleteUserProfile = (req, res, next) => {
  // console.log(req);
  UserProfile.findOne({ _id: req.params.id }).then((userProfile) => {
    if (!userProfile) {
      return res.status(404).json({
        error: "No such Thing!",
      });
    }
    if (userProfile.userId !== req.auth.userId) {
      return res.status(401).json({
        error: "Unauthorized request!",
      });
    }

    UserProfile.deleteOne({ _id: req.params.id })
      .then(() => {
        return res.status(200).json({
          message: "Deleted!",
        });
      })
      .catch((error) => {
        return res.status(400).json({
          error: "Probleme in deleting object!",
        });
      });
  });
};

// exports.getAllStuff = (req, res, next) => {
//   Thing.find()
//     .then((things) => {
//       res.status(200).json(things);
//     })
//     .catch((error) => {
//       res.status(400).json({
//         error: error,
//       });
//     });
// };
