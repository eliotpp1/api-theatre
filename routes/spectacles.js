const express = require("express");
const router = express.Router();
const spectaclesCtrl = require("../controllers/spectacles");
const authResped = require("../middlewares/authResped");



// Créer un spectacle type
router.post("/spectacle-type", authResped, spectaclesCtrl.createSpectacleType);

// Récupérer tous les spectacles types
router.get("/spectacle-type", spectaclesCtrl.getAllSpectacleTypes);

//Supprimer un spectacle type
router.delete("/spectacle-type/:id", authResped, spectaclesCtrl.deleteSpectacleType);

// Mettre à jour un spectacle type
router.put("/spectacle-type/:id", authResped, spectaclesCtrl.updateSpectacleType);

// Créer un spectacle
router.post("/", authResped, spectaclesCtrl.createSpectacle);

// Récupérer tous les spectacles
router.get("/", spectaclesCtrl.getAllSpectacles);

// Supprimer un spectacle
router.delete("/:id", authResped, spectaclesCtrl.deleteSpectacle);

// Mettre à jour un spectacle
router.put("/:id", authResped, spectaclesCtrl.updateSpectacle);

// Créer un spectacle à partir d’un spectacle type
router.post("/from-type/:idType", authResped, spectaclesCtrl.createSpectacleFromType);



// Fin du document
module.exports = router;