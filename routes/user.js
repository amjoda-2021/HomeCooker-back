const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.post("/changePassword", userCtrl.changePassword);
router.post("/changePasswordAuth", auth, userCtrl.changePasswordAuth);
router.post("password-reset/:userId/:token", userCtrl.resetPassword);
router.post("/confirm-email/:userId/:token", userCtrl.confirmEmail);
router.post("/changeEmail", auth, userCtrl.updateEmail);
router.delete("/delete-account/:userId", auth, userCtrl.deleteAccount);
module.exports = router;
