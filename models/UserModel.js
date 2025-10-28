const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true },
        prenom: { type: String, required: true },
        dateNaissance: { type: Date, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String },
        role: {
            type: String,
            enum: ["admin", "member", "resped"],
            required: true,
            default: "member"
        },
        isActive: { type: Boolean, default: false }
    },
    { timestamps: true, discriminatorKey: "role" }
);

const User = mongoose.model("User", userSchema);

User.discriminator("admin", new mongoose.Schema({}, { timestamps: true }));
User.discriminator("resped", new mongoose.Schema({}, { timestamps: true }));

module.exports = User;
