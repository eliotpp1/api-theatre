const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
}, { timestamps: true });

const Invitation = mongoose.model("Invitation", invitationSchema);

module.exports = Invitation;
