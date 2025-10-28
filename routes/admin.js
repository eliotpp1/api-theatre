const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/admins");
const authAdmin = require("../middlewares/authAdmin");



// Créer un membre via le rôle admin
router.post("/signup", authAdmin, adminCtrl.signUpUser);



// Fin du document
module.exports = router;