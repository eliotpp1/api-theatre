const mongoose = require("mongoose");

const atelierSchema = new mongoose.Schema(
    {
        date: { type: Date, required: true },
        nombreParticipant: { type: Number, required: true },
        lieux: { type: String, required: true },
        description: { type: String, required: true },

        // Coach (doit avoir le rôle "resped")
        coach: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            validate: {
                validator: async function (userId) {
                    const User = mongoose.model("User");
                    const user = await User.findById(userId);
                    return user && user.role === "resped";
                },
                message: "Le coach doit être un utilisateur ayant le rôle 'resped'.",
            },
        },

        // Liste des participants (doivent avoir le rôle "member")
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                validate: {
                    validator: async function (userId) {
                        const User = mongoose.model("User");
                        const user = await User.findById(userId);
                        return user && user.role === "member";
                    },
                    message: "Chaque participant doit être un utilisateur ayant le rôle 'member'.",
                },
            },
        ],
    },
    { timestamps: true }
);

const Atelier = mongoose.model("Atelier", atelierSchema);

module.exports = Atelier;
