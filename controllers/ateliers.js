require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require("../models/UserModel");
const Atelier = require("../models/AtelierModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");


// --- Fonction d'envoi de mail avec Ethereal (aucune config requise) ---
async function sendMailSimulation(to, subject, html) {
    try {
        // Création d’un compte de test Ethereal
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

        // Envoi du mail simulé
        const info = await transporter.sendMail({
            from: `"Théâtre API" <no-reply@theatre-api.com>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email simulé envoyé :", info.messageId);
        console.log("🔗 Aperçu du mail :", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("❌ Erreur simulation mail :", err);
    }
}

// getAllAteliers: Récupère tous les ateliers
exports.getAllAteliers = async (req, res) => {
    try {
        const ateliers = await Atelier.find()

        res.status(200).json({
            message: "Ateliers récupérés avec succès.",
            ateliers
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des ateliers :", error);
        res.status(500).json({
            message: "Erreur serveur lors de la récupération des ateliers.",
            error: error.message
        });
    }
};

// getAtelierById: Récupère un atelier par son ID
exports.getAtelierById = async (req, res) => {
    try {
        const { id } = req.params;

        const atelier = await Atelier.findById(id);

        if (!atelier) {
            return res.status(404).json({ message: "Atelier non trouvé." });
        }

        res.status(200).json({
            message: "Atelier récupéré avec succès.",
            atelier
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'atelier :", error);
        res.status(500).json({
            message: "Erreur serveur lors de la récupération de l'atelier.",
            error: error.message
        });
    }
};

// createAtelier: Crée un nouvel atelier et simule l’envoi de mails à tous les membres
exports.createAtelier = async (req, res) => {
    try {
        const { date, nombreParticipant, lieux, description, coachId, participants } = req.body;

        if (!date || !nombreParticipant || !lieux || !description || !coachId) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const coach = await User.findById(coachId);
        if (!coach) return res.status(404).json({ message: "Coach introuvable." });
        if (coach.role !== "resped") return res.status(400).json({ message: "Le coach doit avoir le rôle 'resped'." });

        let validParticipants = [];
        if (participants && participants.length > 0) {
            const users = await User.find({ _id: { $in: participants }, role: "member" });
            if (users.length !== participants.length) {
                return res.status(400).json({ message: "Tous les participants doivent être des membres valides." });
            }
            validParticipants = users.map(u => u._id);
        }

        const atelier = new Atelier({
            date,
            nombreParticipant,
            lieux,
            description,
            coach: coachId,
            participants: validParticipants
        });

        const savedAtelier = await atelier.save();

        const membres = await User.find({ role: "member" });
        if (membres.length === 0) {
            console.log("⚠️ Aucun membre trouvé pour la simulation de mail.");
        } else {
            console.log("----- Simulation d'envoi de mails pour le nouvel atelier -----");
            for (const membre of membres) {
                const html = `
                    <h2>🎭 Nouvel atelier disponible !</h2>
                    <p>Bonjour <b>${membre.prenom} ${membre.nom}</b>,</p>
                    <p>Un nouvel atelier vient d’être créé par <b>${coach.prenom} ${coach.nom}</b>.</p>
                    <ul>
                        <li><b>Date :</b> ${new Date(date).toLocaleString()}</li>
                        <li><b>Lieu :</b> ${lieux}</li>
                        <li><b>Description :</b> ${description}</li>
                        <li><b>Participants max :</b> ${nombreParticipant}</li>
                    </ul>
                    <p>Rendez-vous sur la plateforme pour vous inscrire !</p>
                    <hr />
                    <p style="font-size: 12px; color: gray;">Ceci est un mail de simulation envoyé via Ethereal.</p>
                `;
                await sendMailSimulation(membre.email, "📢 Nouveau atelier disponible !", html);
            }
            console.log("----- Simulation terminée -----");
        }

        res.status(201).json({
            message: "Atelier créé avec succès et mails simulés envoyés à tous les membres.",
            atelier: savedAtelier,
            membresNotifies: membres.map(m => ({
                id: m._id,
                nom: m.nom,
                prenom: m.prenom,
                email: m.email
            }))
        });

    } catch (error) {
        console.error("❌ Erreur lors de la création de l'atelier :", error);
        res.status(500).json({
            message: "Erreur serveur lors de la création de l'atelier.",
            error: error.message
        });
    }
};




// deleteAtelier: Supprime un atelier
exports.deleteAtelier = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAtelier = await Atelier.findByIdAndDelete(id);

        if (!deletedAtelier) {
            return res.status(404).json({ message: "Atelier non trouvé." });
        }

        res.status(200).json({
            message: "Atelier supprimé avec succès.",
            atelier: deletedAtelier
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de l'atelier :", error);
        res.status(500).json({
            message: "Erreur serveur lors de la suppression de l'atelier.",
            error: error.message
        });
    }
};

// updateAtelier: Met à jour un atelier
exports.updateAtelier = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, nombreParticipant, lieux, description, coachId, participants } = req.body;

        const updateData = {};

        if (coachId) {
            const coach = await User.findById(coachId);
            if (!coach) return res.status(404).json({ message: "Coach introuvable." });
            if (coach.role !== "resped") return res.status(400).json({ message: "Le coach doit avoir le rôle 'resped'." });
            updateData.coach = coachId;
        }

        if (participants && participants.length > 0) {
            const validParticipants = await User.find({ _id: { $in: participants }, role: "member" });
            if (validParticipants.length !== participants.length) {
                return res.status(400).json({ message: "Tous les participants doivent être des membres valides." });
            }
            updateData.participants = validParticipants.map(u => u._id);
        }

        if (date) updateData.date = date;
        if (nombreParticipant) updateData.nombreParticipant = nombreParticipant;
        if (lieux) updateData.lieux = lieux;
        if (description) updateData.description = description;

        const updatedAtelier = await Atelier.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAtelier) return res.status(404).json({ message: "Atelier non trouvé." });

        res.status(200).json({
            message: "Atelier mis à jour avec succès.",
            atelier: updatedAtelier
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'atelier :", error);
        res.status(500).json({
            message: "Erreur serveur lors de la mise à jour de l'atelier.",
            error: error.message
        });
    }
};


// remindAtelier: Rappelle à tous les membres un atelier spécifique via une simulation d'email
exports.remindAtelier = async (req, res) => {
    try {
        const { id } = req.params;

        const atelier = await Atelier.findById(id).populate("coach");
        if (!atelier) {
            return res.status(404).json({ message: "Atelier non trouvé." });
        }

        const membres = await User.find({ role: "member" });

        if (membres.length === 0) {
            console.log("⚠️ Aucun membre trouvé, aucun mail simulé.");
        } else {
            for (const membre of membres) {
                const html = `
                    <h2>📅 Rappel : Atelier à venir !</h2>
                    <p>Bonjour <b>${membre.prenom} ${membre.nom}</b>,</p>
                    <p>Petit rappel concernant l'atelier à venir :</p>
                    <ul>
                        <li><b>Date :</b> ${new Date(atelier.date).toLocaleString()}</li>
                        <li><b>Lieu :</b> ${atelier.lieux}</li>
                        <li><b>Description :</b> ${atelier.description}</li>
                        <li><b>Coach :</b> ${atelier.coach?.prenom || "Inconnu"} ${atelier.coach?.nom || ""}</li>
                        <li><b>Nombre de places:</b> ${atelier.nombreParticipant}</li>
                        <li><b>Nombre de places restantes:</b> ${atelier.nombreParticipant - atelier.participants.length}</li>
                    </ul>
                    <p>Nous avons hâte de vous voir à l’atelier 🎭</p>
                    <hr />
                    <p style="font-size: 12px; color: gray;">Ceci est un mail de simulation envoyé via Ethereal.</p>
                `;

                await sendMailSimulation(
                    membre.email,
                    "⏰ Rappel : Atelier à venir !",
                    html
                );
            }
        }

        res.status(200).json({
            message: "Rappels simulés envoyés avec succès.",
            atelier,
            membresNotifies: membres.map(m => ({
                id: m._id,
                nom: m.nom,
                prenom: m.prenom,
                email: m.email,
            })),
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'envoi des rappels :", error);
        res.status(500).json({
            message: "Erreur serveur lors de l'envoi des rappels.",
            error: error.message,
        });
    }
};
