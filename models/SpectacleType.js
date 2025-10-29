const mongoose = require("mongoose");

const spectacleTypeSchema = new mongoose.Schema({
    date: { type: String, required: true },
    nombrePersonnes: { type: Number, required: true },
    roles: {
        type: Object,
        required: true, // ex : { regisseur: null, acteurPrincipal: null, acteur2: null }
    },
});

const SpectacleType = mongoose.model("SpectacleType", spectacleTypeSchema);

module.exports = SpectacleType;