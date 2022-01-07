const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userProfileCtrl = require("../controllers/userProfile");
const multer = require("../middleware/multer-config");

// router.get("/", stuffCtrl.getAllStuff);
// ordre des middlewares très importants => si je mets multer avant auth,
// il y aura des enregistrements d'images sans que la requête soit authentifiée
router.post("/", auth, multer, userProfileCtrl.createUserProfile);
router.get("/:userId", auth, userProfileCtrl.getUserProfile);
router.put("/:id", auth, multer, userProfileCtrl.modifyUserProfile);
router.delete("/:id", auth, userProfileCtrl.deleteUserProfile);

module.exports = router;
