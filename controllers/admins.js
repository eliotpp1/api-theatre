require('dotenv').config();
const User = require("../models/UserModel");
const Invitation = require("../models/InvitationModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// --- Fonction d'envoi de mail avec Ethereal ---
async function sendInvitationEmail(to, subject, html) {
    try {
        // Création d’un compte de test (aucune config requise)
        const testAccount = await nodemailer.createTestAccount();

        // Création du transporteur SMTP factice
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        // Envoi du mail
        const info = await transporter.sendMail({
            from: `"Théâtre API" <no-reply@theatre-api.com>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email simulé envoyé :", info.messageId);
        console.log("🔗 Aperçu :", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("❌ Erreur envoi mail :", err);
    }
}

// signUpUser: Crée un utilisateur via le rôle admin et envoie un mail d'invitation. Prendre le lien d'invitation et le mettre dans postman en méthode POST avec en body le password.
exports.signUpUser = async (req, res) => {
    try {
        const { nom, prenom, dateNaissance, email, role } = req.body;

        if (!["member", "resped"].includes(role)) {
            return res.status(400).json({ message: "Le rôle doit être 'member' ou 'resped'." });
        }

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Crée le nouvel utilisateur inactif
        const user = new User({ nom, prenom, dateNaissance, email, role, isActive: false });
        const savedUser = await user.save();

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // expire dans 24h
        const invitation = new Invitation({ userId: savedUser._id, token, expiresAt });
        await invitation.save();

        const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}api/users/complete-invite?token=${token}`;

        const html = `
            <p>Bonjour ${savedUser.prenom},</p>
            <p>Votre compte a été créé. Cliquez sur le lien ci-dessous pour définir votre mot de passe et activer votre compte :</p>
            <a href="${inviteLink}">${inviteLink}</a>
            <p>Ce lien expire dans 24 heures.</p>
        `;

        await sendInvitationEmail(savedUser.email, "Invitation à créer votre compte", html);

        res.status(201).json({
            message: "Utilisateur créé sans mot de passe. Mail d'invitation simulé envoyé.",
            userId: savedUser._id,
            inviteToken: token
        });

    } catch (error) {
        console.error("❌ Erreur création invitation :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};


// getCurrentUser: Récupère les informations de l'utilisateur courant

exports.getCurrentUser = (req, res, next) => {
    const { id } = req.params;

    User.findById(id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            res.status(200).json({
                message: "Utilisateur récupéré avec succès",
                user: {
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                }
            });
        })
        .catch(error => {
            console.error("Erreur récupération utilisateur :", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message || error });
        });
};


// updateUser: Met à jour les informations de l'utilisateur courant
exports.updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { nom, prenom, dateNaissance, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== id) {
            return res.status(400).json({ message: "Cet email est déjà utilisé par un autre utilisateur." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { nom, prenom, dateNaissance, email },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json({
            message: "Utilisateur mis à jour avec succès",
            user: {
                nom: updatedUser.nom,
                prenom: updatedUser.prenom,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        console.error("Erreur mise à jour utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message || error });
    }
};

// deleteUser: Supprime un utilisateur par son ID
exports.deleteUser = (req, res, next) => {
    const { id } = req.params;

    User.findByIdAndDelete(id)
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            res.status(200).json({ message: "Utilisateur supprimé avec succès" });
        })
        .catch(error => {
            console.error("Erreur suppression utilisateur :", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message || error });
        });
};


