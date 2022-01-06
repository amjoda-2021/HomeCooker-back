const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const stuffCtrl = require("../controllers/stuff");
const multer = require("../middleware/multer-config");

router.get("/", stuffCtrl.getAllStuff);
// ordre des middlewares très importants => si je mets multer avant auth,
// il y aura des enregistrements d'images sans que la requête soit authentifiée
router.post("/", auth, multer, stuffCtrl.createThing);
router.get("/:id", auth, stuffCtrl.getOneThing);
router.put("/:id", auth, multer, stuffCtrl.modifyThing);
router.delete("/:id", auth, stuffCtrl.deleteThing);

module.exports = router;
