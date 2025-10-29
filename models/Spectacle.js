const mongoose = require("mongoose");

const candidatureSchema = new mongoose.Schema({
    role: { type: String, required: true },        // rôle visé
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // candidat
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

const spectacleSchema = new mongoose.Schema({
    nom: String,
    nombrePersonnes: Number,
    description: String,
    roles: Object,
    date: Date,
    lieu: String,
    estBaseSurFormat: { type: Boolean, default: false },
    formatId: { type: mongoose.Schema.Types.ObjectId, ref: "Format", default: null },
    candidatures: [candidatureSchema]
});

const Spectacle = mongoose.model("Spectacle", spectacleSchema);

module.exports = Spectacle;