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
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
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
            .then((res) => {
              const link = `${process.env.BASE_URL}/confirm-email/${user._id}/${res.token}`;
              const emailContentHtml = ConfirmSignUpEmail({
                link,
                email: user.email,
              });
              sendEmail(user.email, "Bienvenue chez nous !", emailContentHtml);
            });

          res.status(201).json({ message: "Utilisateur créé ! " });
        })
        .catch((error) => res.status(400).json({ error }));
    });
    // const user = await new User(req.body).save();

    // res.send(user);
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.confirmEmail = async (req, res, next) => {
  console.log(req.params);
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");
    if (user && token) {
      user.isConfirmed = true;
      user.save();
      token.delete();
      console.log(user);
    }
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
            email: req.body.email,
            isConfirmed: user.isConfirmed,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.changePassword = async (req, res, next) => {
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

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

    res.send("password reset link sent to your email account");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  console.log(req.body);
  console.log(req.params.userId, req.params.token);
  try {
    const schema = Joi.object({ password: Joi.string().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");
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
    res.send("password reset sucessfully.");
  } catch (error) {
    res.send("An error occured");
    console.log(error, "caca");
  }
};
exports.changePasswordAuth = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    bcrypt.hash(password, 10).then((hash) => {
      user.password = hash;
      user.save();
      const emailContentHtml = ResetPasswordAuthEmail({
        email: user.email,
      });
      sendEmail(
        user.email,
        "Votre mot de passe a bien été modifié!",
        emailContentHtml
      );
    });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.updateEmail = async (req, res, next) => {
  try {
    console.log(req.body);
    const { userId, email, newemail } = req.body;
    console.log(userId, email, newemail);

    const user = await User.findOne({ email: email });
    user.email = newemail;
    user.isConfirmed = false;
    user.save().then(() => {
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
            "Modification de votre adresse email / identifiant",
            emailContentHtml
          );
        });

      res.status(201).json({ message: "Utilisateur modifié ! " });
    });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};
exports.deleteAccount = async (req, res, next) => {
  try {
    console.log(req.params);
    User.findOne({ _id: req.params.userId }).then((user) => {
      const email = user.email;
      if (!user) {
        return res.status(404).json({
          error: "No User found",
        });
      }

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
            message: "Account Deleted!",
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
