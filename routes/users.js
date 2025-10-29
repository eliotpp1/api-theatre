const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/users");
const spectaclesCtrl = require("../controllers/spectacles");
const authResped = require("../middlewares/authResped");
// Routes pour les utilisateurs



// Définir son mot de passe et activer le compte via un token d'invitation
router.post("/complete-invite", userCtrl.completeInvite);

// Authentification d'un utilisateur
router.post("/login", userCtrl.loginUser);

// Récupérer les informations de l'utilisateur courant
router.get("/me", userCtrl.getCurrentUser);

// Participer à un atelier
router.post("/atelier/:atelierId", userCtrl.signuUpAtelier);

// Postuler pour un rôle
router.post("/:id/applications", spectaclesCtrl.postulerRole);

// Validation d'une candidature (accepter ou refuser)
router.patch("/shows/:id/applications/:candidatureId", authResped, spectaclesCtrl.validerCandidature);

// Récupérer les statistiques d'un membre
router.get("/:id/stats", userCtrl.getMemberStats);

// Fin du document
module.exports = router;
