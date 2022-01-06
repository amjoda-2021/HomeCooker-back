const Thing = require("../models/thing");

// LA REQUETE FRONT DOIT ETRE AU FORMAT FORMDATA (VOIR DOC) ET NON JSON POUR LES FICHIERS (IMAGES)!
exports.createThing = (req, res, next) => {
  console.log(req.body, "caca");
  const thingObject = JSON.parse(JSON.stringify(req.body));
  delete thingObject._id;
  const thing = new Thing({
    ...thingObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  thing
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

exports.getOneThing = (req, res, next) => {
  Thing.findOne({
    _id: req.params.id,
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

exports.modifyThing = (req, res, next) => {
  console.log(req);
  Thing.findOne({ _id: req.params.id }).then((thing) => {
    if (!thing) {
      return res.status(404).json({
        error: "No such Thing!",
      });
    }
    if (thing.userId !== req.auth.userId) {
      return res.status(401).json({
        error: "Unauthorized request!",
      });
    }

    const thingObject = req.file
      ? {
          ...JSON.parse(JSON.stringify(req.body)),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    Thing.updateOne(
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

exports.deleteThing = (req, res, next) => {
  // console.log(req);
  Thing.findOne({ _id: req.params.id }).then((thing) => {
    if (!thing) {
      return res.status(404).json({
        error: "No such Thing!",
      });
    }
    if (thing.userId !== req.auth.userId) {
      return res.status(401).json({
        error: "Unauthorized request!",
      });
    }

    Thing.deleteOne({ _id: req.params.id })
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

exports.getAllStuff = (req, res, next) => {
  Thing.find()
    .then((things) => {
      res.status(200).json(things);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
