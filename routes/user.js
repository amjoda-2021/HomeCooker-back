const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.post("/changePassword", userCtrl.updatePassword);
router.post("/changeEmail", userCtrl.updateEmail);
router.get("/currentUser", auth, userCtrl.updateEmail);
module.exports = router;
