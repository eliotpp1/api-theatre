require('dotenv').config();
const User = require("../models/UserModel");
const Invitation = require("../models/InvitationModel");
const crypto = require("crypto");

exports.signUpUser = (req, res, next) => {
    const { nom, prenom, dateNaissance, email } = req.body;

    User.findOne({ email })
        .then(existingUser => {
            if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

            const user = new User({ nom, prenom, dateNaissance, email, role: "member", isActive: false });
            return user.save();
        })
        .then(savedUser => {
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // expire dans 24h

            const invitation = new Invitation({ userId: savedUser._id, token, expiresAt });

            return invitation.save().then(() => ({ userId: savedUser._id, inviteToken: token }));
        })
        .then(({ userId, inviteToken }) => {
            res.status(201).json({
                message: "Utilisateur créé sans mot de passe. Invitation générée.",
                userId,
                inviteToken
            });
        })
        .catch(error => {
            console.error("Erreur création invitation :", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message || error });
        });
};
