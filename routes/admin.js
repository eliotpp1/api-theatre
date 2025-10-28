const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/admins");
const authAdmin = require("../middlewares/authAdmin");



// Créer un membre via le rôle admin
router.post("/users", authAdmin, adminCtrl.signUpUser);

// Récupérer les informations de l'utilisateur courant
router.get("/users/:id", authAdmin, adminCtrl.getCurrentUser);

// Mettre à jour les informations de l'utilisateur courant
router.put("/users/:id", authAdmin, adminCtrl.updateUser);

// Supprimer un utilisateur
router.delete("/users/:id", authAdmin, adminCtrl.deleteUser);



// Fin du document
module.exports = router;