const express = require("express");
const router = express.Router();
const spectaclesCtrl = require("../controllers/spectacles");
const authResped = require("../middlewares/authResped");



// Créer un format
router.post("/formats", authResped, spectaclesCtrl.createFormat);

// Récupérer tous les formats
router.get("/formats", spectaclesCtrl.getAllFormats);

//Supprimer un format
router.delete("/formats/:id", authResped, spectaclesCtrl.deleteFormat);

// Mettre à jour un format
router.put("/formats/:id", authResped, spectaclesCtrl.updateFormat);

// Créer un spectacle
router.post("/", authResped, spectaclesCtrl.createSpectacle);

// Récupérer tous les spectacles
router.get("/", spectaclesCtrl.getAllSpectacles);

// Supprimer un spectacle
router.delete("/:id", authResped, spectaclesCtrl.deleteSpectacle);

// Mettre à jour un spectacle
router.put("/:id", authResped, spectaclesCtrl.updateSpectacle);


// Fin du document
module.exports = router;