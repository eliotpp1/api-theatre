const express = require("express");
const router = express.Router();
const atelierCtrl = require("../controllers/ateliers");
const authResped = require("../middlewares/authResped");
// Routes pour les ateliers

// Récupérer tous les ateliers
router.get("/", atelierCtrl.getAllAteliers);

// Récupérer un atelier par ID
router.get("/:id", atelierCtrl.getAtelierById);

// Créer un nouvel atelier
router.post("/", authResped, atelierCtrl.createAtelier);

// Supprimer un atelier
router.delete("/:id", authResped, atelierCtrl.deleteAtelier);

// Mettre à jour un atelier
router.put("/:id", authResped, atelierCtrl.updateAtelier);

// Rappeler a tous les membre d'un atelier
router.post("/:id/reminder", authResped, atelierCtrl.remindAtelier);


// Fin du document
module.exports = router;