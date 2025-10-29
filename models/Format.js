const mongoose = require("mongoose");

const formatSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    nombrePersonnes: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    roles: {
        type: Object,
        required: true
    }
});

const Format = mongoose.model("Format", formatSchema);

module.exports = Format;