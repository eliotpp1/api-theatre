const express = require('express');
const router = express.Router();
const logementsCtrl = require("./../controllers/logements")
const auth = require("./../middlewares/auth.js");



router.get("/", logementsCtrl.findAllHousing);

router.post("/", auth, logementsCtrl.createHousing);

router.get("/:id", logementsCtrl.findOneHousing);

router.put("/:id", auth, logementsCtrl.editHousing);

router.delete("/:id", auth, logementsCtrl.deleteHousing);


// Fin du document
module.exports = router;