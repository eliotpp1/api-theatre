const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/users");
// Routes pour les utilisateurs

// Définir son mot de passe et activer le compte via un token d'invitation
router.post("/complete-invite", userCtrl.completeInvite);

// Authentification d'un utilisateur
router.post("/login", userCtrl.loginUser);

// Récupérer les informations de l'utilisateur courant
router.get("/me", userCtrl.getCurrentUser);

// Participer à un atelier
router.post("/atelier/:atelierId", userCtrl.signuUpAtelier);

// Fin du document
module.exports = router;
