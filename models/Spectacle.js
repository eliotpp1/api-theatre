const mongoose = require("mongoose");

const spectacleSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    date: { type: Date, required: true },
    nombrePersonnes: { type: Number, required: true },
    lieux: { type: String, required: true },
    description: { type: String, required: true },
    roles: { type: Object, default: {} },
});

const Spectacle = mongoose.model("Spectacle", spectacleSchema);

module.exports = Spectacle;