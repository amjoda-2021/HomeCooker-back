const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const ResetPasswordEmail = require("../utils/ResetPasswordEmail");
const ConfirmResetPasswordEmail = require("../utils/ConfirmResetPasswordEmail");
const ConfirmSignUpEmail = require("../utils/ConfirmSignUpEmail");
const ChangeEmail = require("../utils/ChangeEmail");
const crypto = require("crypto");
const ConfirmDeleteAccount = require("../utils/ConfirmDeleteAccount");
const ResetPasswordAuthEmail = require("../utils/ResetPasswordAuthEmail");
require("dotenv").config();
exports.signup = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password)
      return res.status(500).json({
        error: "L'email et le mot de passe doivent être renseignés ",
      });
    const { error } = validate(req.body);
    if (error)
      return error.details[0].path[0] === "email"
        ? res.status(400).json({ error: { email: "Email invalide" } })
        : res.status(400).json({
            error: {
              password: "Le mot de passe doit contenir au moins 8 caractères ",
            },
          });
    bcrypt.hash(req.body.password, 10).then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
        isConfirmed: false,
      });
      user
        .save()
        .then(() => {
          const token = new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          })
            .save()
            .then((resp) => {
              const link = `${process.env.BASE_URL}/confirm-email/${user._id}/${resp.token}`;
              const emailContentHtml = ConfirmSignUpEmail({
                link,
                email: user.email,
              });
              sendEmail(user.email, "Bienvenue chez nous !", emailContentHtml);
              res.json({
                message:
                  "<small><p>Ton compte a bien été créé ! <span>&#128522; </span></p><p>Tu peux te connecter. Un lien de confirmation t'a été envoyé pour vérifier ton profil ! </p></small>",
              });
            });
        })
        .catch((error) =>
          res.status(400).json({
            error: "Email ou mot de passe invalide !",
          })
        );
    });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.confirmEmail = async (req, res, next) => {
  console.log(req.params);
  try {
    const user = await User.findById(req.params.userId);
    console.log(user);
    if (!user)
      return res.status(400).json({ error: "Le lien est invalide ou expiré" });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log(token);
    if (!token)
      return res.status(400).json({ error: "Le lien est invalide ou expiré" });
    if (user) {
      user.isConfirmed = true;
      user.save();
      token.delete();
      console.log(user);
      return res.status(200).json({
        message: "Ton adresse mail a bien été validée <span> &#9989; </span>",
      });
    }
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.login = (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return res.status(500).json({
      error: "L'email et le mot de passe doivent être renseignés",
    });
  const { error } = validate(req.body);
  if (error)
    return error.details[0].path[0] === "email"
      ? res.status(400).json({ error: { email: "Email invalide" } })
      : res.status(400).json({
          error: {
            password: "Le mot de passe doit contenir au moins 8 caractères",
          },
        });
  User.findOne({ email: req.body.email })
    .then((user) => {
      console.log(user);
      console.log(req.body);
      if (!user) {
        return res.status(401).json({ error: "Identifiants incorrects" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          console.log(valid, "caca");
          if (!valid) {
            return res.status(401).json({ error: "Identifiants incorrects" });
          }
          const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, {
            expiresIn: "2h",
          });
          user.token = token;
          user
            .save()
            .then((resp) => {
              console.log(resp);
              res.status(200).json({
                user: {
                  userId: resp._id,
                  token: resp.token,
                  email: resp.email,
                  isConfirmed: resp.isConfirmed,
                },
                message: `<p><small>Tu es bien connecté !<span>&#128522;</span> </p><p>Contents de te retrouver ${resp.email}</small></p>`,
              });
            })
            .catch((error) => console.log(error));
        })
        .catch((error) =>
          res.status(500).json({ error: "Identifiants incorrects " })
        );
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.changePassword = async (req, res, next) => {
  console.log(req.body);
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: "Email invalide" });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: "Email invalide" });

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
    const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
    const emailContentHtml = ResetPasswordEmail({ link, email: user.email });
    await sendEmail(
      user.email,
      "Réinitialiser votre mot de passe",
      emailContentHtml
    );

    res.json({
      message: `<p><small>Nous t'avons envoyé un lien pour changer ton mot de passe à ${user.email} <span> &#9989; </span></small></p>`,
    });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  console.log(req.body);
  console.log(req.params.userId, req.params.token);
  try {
    const schema = Joi.object({ password: Joi.string().min(8).required() });
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({
        error: {
          password: "Le mot de passe doit contenir au moins 8 caractères",
        },
      });

    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(400).json({ error: "Le lien est invalide ou expiré" });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(400).json({ error: "Le lien est invalide ou expiré" });
    bcrypt.hash(req.body.password, 10).then((hash) => {
      user.password = hash;
      user.save();
      token.delete();
      const emailContentHtml = ConfirmResetPasswordEmail({ email: user.email });
      sendEmail(
        user.email,
        "Votre mot de passe a bien été réinitialisé",
        emailContentHtml
      );
    });
    res.json({
      message:
        "<p><small>Mot de passe réinitialisé avec succès <span> &#9989; </span> Connecte-toi avec ton nouveau mot de passe !</small></p>",
    });
  } catch (error) {
    res.json({ error: "An error occured" });
  }
};
exports.changePasswordAuth = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = validate({ password: req.body.password });
    console.log(error);
    if (error)
      return res.json({
        error: "Le mot de passe doit contenir au moins 8 caractères",
      });
    const user = await User.findOne({ email: email });
    if (!password)
      return res.json({ error: "Merci de choisir un nouveau mot de passe" });
    if (!user) return res.json({ error: "Aucun utilisateur trouvé" });
    bcrypt.compare(password, user.password).then((valid) => {
      console.log(valid, "prout");
      if (valid) return res.json({ error: "Mot de passe identique" });
      bcrypt.hash(password, 10).then((hash) => {
        console.log("mot de passe différent");
        user.password = hash;
        user.save().then((resp) => {
          const emailContentHtml = ResetPasswordAuthEmail({
            email: user.email,
          });
          sendEmail(
            user.email,
            "Ton mot de passe a bien été modifié!",
            emailContentHtml
          );
          return res.json({
            message:
              "<p><small>Ton mot de passe a bien été modifié. Nous t'avons fait partir un email de confirmation &#128521;</small></p>",
          });
        });
      });
    });
  } catch (error) {
    res.json("An error occured");
    console.log(error);
  }
};
exports.updateEmail = async (req, res, next) => {
  try {
    console.log(req.body);
    const { userId, email, newemail } = req.body;
    const { error } = validate({ email: newemail });
    console.log(error);
    if (error) return res.json({ error: "Email invalide" });
    console.log(userId, email, newemail);
    if (email === newemail)
      return res.json({
        error: "Email identique",
      });
    const user = await User.findById(userId);
    const emailAlreadyTaken = await User.findOne({ email: newemail });
    console.log(user, emailAlreadyTaken);
    if (!emailAlreadyTaken) {
      user.email = newemail;
      user.isConfirmed = false;
      user.save().then((resp) => {
        const token = new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        })
          .save()
          .then((res) => {
            const link = `${process.env.BASE_URL}/confirm-email/${user._id}/${res.token}`;
            const emailContentHtml = ChangeEmail({
              link,
              email: user.email,
            });
            sendEmail(
              user.email,
              "Modification de ton adresse email / identifiant",
              emailContentHtml
            );
          });
        console.log(email === newemail);
        res.status(201).json({
          message:
            "<p><small>Ton email a bien été modifié <span> &#128522;</span>! Nous t'avons fait partir un email avec un lien de confirmation </small></p>",
        });
      });
    } else {
      return res.json({ error: "Email invalide" });
    }
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.deleteAccount = async (req, res, next) => {
  try {
    console.log(req.params);
    User.findOne({ _id: req.params.userId }).then((user) => {
      if (!user) {
        return res.status(404).json({
          error: "Aucun utilisateur trouvé !",
        });
      }
      const email = user.email;
      User.deleteOne({ _id: req.params.userId })
        .then(() => {
          const emailContentHtml = ConfirmDeleteAccount({
            email: email,
          });
          sendEmail(
            user.email,
            "Suppression de votre compte",
            emailContentHtml
          );
          return res.status(200).json({
            message:
              "<small><p>Ton compte a bien été supprimé ... <span> &#128542; </span>. Nous espérons te retrouver vite sur notre site ... </p><p>Un email de confirmation t'a été envoyé !</p></small>",
          });
        })
        .catch((error) => {
          return res.status(400).json({
            error: "Probleme in deleting user!",
          });
        });
    });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.getUser = (req, res, next) => {
  console.log(req.params);
  User.findOne({
    _id: req.params.userId,
  })
    .then((user) => {
      res.status(200).json({
        _id: user.id,
        email: user.email,
        isConfirmed: user.isConfirmed,
      });
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};
