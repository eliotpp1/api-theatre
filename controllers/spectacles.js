require('dotenv').config();
const Spectacle = require("../models/Spectacle");
const Format = require("../models/Format");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");


// createFormat: crée un nouveau format
exports.createFormat = async (req, res) => {
    try {
        const { nom, nombrePersonnes, description, roles } = req.body;

        if (!roles || typeof roles !== "object") {
            return res.status(400).json({ error: "Le champ roles est requis." });
        }

        const rolesCount = Object.keys(roles).length;

        if (rolesCount !== nombrePersonnes) {
            return res.status(400).json({
                error: `Le nombre de rôles (${rolesCount}) doit correspondre à nombrePersonnes (${nombrePersonnes}).`,
            });
        }

        const hasNonNullValue = Object.values(roles).some((v) => v !== null);
        if (hasNonNullValue) {
            return res
                .status(400)
                .json({ error: "Les rôles d’un SpectacleType doivent être vides (valeurs null)." });
        }

        const format = new Format({ nom, nombrePersonnes, description, roles });
        await format.save();

        res.status(201).json(format);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// getAllFormats: récupère tous les formats
exports.getAllFormats = async (req, res) => {
    try {
        const formats = await Format.find();
        res.status(200).json(formats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// deleteFormat: supprime un format par son ID
exports.deleteFormat = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFormat = await Format.findByIdAndDelete(id);

        if (!deletedFormat) {
            return res.status(404).json({ error: "Format non trouvé." });
        }

        res.status(200).json({ message: "Format supprimé avec succès." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// updateFormat: met à jour un format par son ID
exports.updateFormat = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, nombrePersonnes, description, roles } = req.body;

        if (roles) {
            if (typeof roles !== "object") {
                return res.status(400).json({ error: "Le champ roles doit être un objet." });
            }

            const rolesCount = Object.keys(roles).length;

            if (rolesCount !== nombrePersonnes) {
                return res.status(400).json({
                    error: `Le nombre de rôles (${rolesCount}) doit correspondre à nombrePersonnes (${nombrePersonnes}).`,
                });
            }

            const hasNonNullValue = Object.values(roles).some((v) => v !== null);
            if (hasNonNullValue) {
                return res
                    .status(400)
                    .json({ error: "Les rôles d’un SpectacleType doivent être vides (valeurs null)." });
            }
        }

        const updatedFormat = await Format.findByIdAndUpdate(
            id,
            { nom, nombrePersonnes, description, roles },
            { new: true, runValidators: true }
        );

        if (!updatedFormat) {
            return res.status(404).json({ error: "Format non trouvé." });
        }

        res.status(200).json(updatedFormat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// createSpectacle: crée un nouveau spectacle
exports.createSpectacle = async (req, res) => {
    try {
        const { nom, date, nombrePersonnes, lieu, description, roles, formatId } = req.body;

        // Si un formatId est fourni → spectacle basé sur un format
        if (formatId) {
            const format = await Format.findById(formatId);
            if (!format) {
                return res.status(404).json({ error: "Format introuvable." });
            }

            // Vérifie que la date et le lieu sont fournis (obligatoires ici)
            if (!date || !lieu) {
                return res.status(400).json({
                    error: "Le champ 'date' et 'lieu' sont requis pour un spectacle basé sur un format."
                });
            }

            // Crée le spectacle en copiant les infos du format
            const spectacle = new Spectacle({
                nom: format.nom,
                nombrePersonnes: format.nombrePersonnes,
                description: format.description,
                roles: format.roles, // copie des rôles du format (nulls)
                date,
                lieu,
                estBaseSurFormat: true,
                formatId
            });

            await spectacle.save();
            return res.status(201).json(spectacle);
        }

        // Sinon → spectacle one-shot (créé sans format)
        if (!nom || !date || !lieu || !description || !nombrePersonnes) {
            return res.status(400).json({ error: "Tous les champs du spectacle one-shot sont requis." });
        }

        if (!roles || typeof roles !== "object") {
            return res.status(400).json({ error: "Le champ 'roles' est requis." });
        }

        const rolesCount = Object.keys(roles).length;
        if (rolesCount !== nombrePersonnes) {
            return res.status(400).json({
                error: `Le nombre de rôles (${rolesCount}) doit correspondre à nombrePersonnes (${nombrePersonnes}).`,
            });
        }

        const spectacle = new Spectacle({
            nom,
            nombrePersonnes,
            description,
            roles,
            date,
            lieu,
            estBaseSurFormat: false
        });

        await spectacle.save();
        res.status(201).json(spectacle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// getAllSpectacles: récupère tous les spectacles
exports.getAllSpectacles = async (req, res) => {
    try {
        const spectacles = await Spectacle.find();
        res.status(200).json(spectacles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// deleteSpectacle: supprime un spectacle par son ID
exports.deleteSpectacle = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSpectacle = await Spectacle.findByIdAndDelete(id);

        if (!deletedSpectacle) {
            return res.status(404).json({ error: "Spectacle non trouvé." });
        }

        res.status(200).json({ message: "Spectacle supprimé avec succès." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// updateSpectacle: met à jour un spectacle par son ID
exports.updateSpectacle = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, date, nombrePersonnes, lieu, description, roles } = req.body;

        const spectacle = await Spectacle.findById(id);
        if (!spectacle) {
            return res.status(404).json({ error: "Spectacle non trouvé." });
        }

        if (spectacle.estBaseSurFormat) {
            if (date) spectacle.date = date;
            if (lieu) spectacle.lieu = lieu;

            if (roles && typeof roles === "object") {
                spectacle.roles = { ...spectacle.roles, ...roles };
            }

        } else {
            if (nom) spectacle.nom = nom;
            if (date) spectacle.date = date;
            if (lieu) spectacle.lieu = lieu;
            if (description) spectacle.description = description;
            if (nombrePersonnes) spectacle.nombrePersonnes = nombrePersonnes;

            if (roles) {
                if (typeof roles !== "object") {
                    return res.status(400).json({ error: "Le champ 'roles' doit être un objet." });
                }

                const rolesCount = Object.keys(roles).length;
                if (rolesCount !== spectacle.nombrePersonnes) {
                    return res.status(400).json({
                        error: `Le nombre de rôles (${rolesCount}) doit correspondre à nombrePersonnes (${spectacle.nombrePersonnes}).`,
                    });
                }

                spectacle.roles = roles;
            }
        }

        const updatedSpectacle = await spectacle.save();
        res.status(200).json(updatedSpectacle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// postulerRole: permet à un member de postuler pour un rôle dans un spectacle
exports.postulerRole = async (req, res) => {
    try {
        const { id: spectacleId } = req.params;
        const { role } = req.body;

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token member manquant" });
        }

        const token = authHeader.split(" ")[1];
        let decodedToken;
        console.log("Token reçu:", token);
        try {
            decodedToken = jwt.verify(token, process.env.PASSWORD_TOKEN_JWT);
        } catch (err) {
            return res.status(401).json({ error: "Token invalide" });
        }

        const memberId = decodedToken.userId;

        const user = await User.findById(memberId);
        if (!user || user.role !== "member") {
            return res.status(403).json({ error: "Accès réservé aux membres" });
        }

        const spectacle = await Spectacle.findById(spectacleId);
        if (!spectacle) return res.status(404).json({ error: "Spectacle introuvable" });

        // Vérifie que le rôle existe dans le spectacle
        if (!spectacle.roles.hasOwnProperty(role)) {
            return res.status(400).json({ error: "Rôle inexistant dans ce spectacle" });
        }

        const alreadyApplied = spectacle.candidatures.find(
            c => c.role === role && c.memberId.toString() === memberId.toString()
        );
        if (alreadyApplied) {
            return res.status(400).json({ error: "Vous avez déjà postulé pour ce rôle" });
        }

        spectacle.candidatures.push({ role, memberId });
        await spectacle.save();

        res.status(201).json({ message: "Candidature envoyée", candidature: { role, memberId } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// validerCandidature: permet au resped de valider ou rejeter une candidature
exports.validerCandidature = async (req, res) => {
    try {
        const { id: spectacleId, candidatureId } = req.params;
        const { status } = req.body; // "accepted" ou "rejected"

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token resped manquant" });
        }

        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.PASSWORD_TOKEN_JWT);
        } catch (err) {
            return res.status(401).json({ error: "Token invalide" });
        }

        const respedId = decodedToken.userId;

        const user = await User.findById(respedId);
        if (!user || user.role !== "resped") {
            return res.status(403).json({ error: "Accès réservé aux resped" });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Status invalide" });
        }

        const spectacle = await Spectacle.findById(spectacleId);
        if (!spectacle) return res.status(404).json({ error: "Spectacle introuvable" });

        const candidature = spectacle.candidatures.id(candidatureId);
        if (!candidature) return res.status(404).json({ error: "Candidature introuvable" });

        candidature.status = status;

        // Si accepté → vérifier que le membre n’a pas déjà un rôle dans ce spectacle
        if (status === "accepted") {
            const roleName = candidature.role;
            const memberId = candidature.memberId.toString();

            if (!spectacle.roles.hasOwnProperty(roleName)) {
                return res.status(400).json({ error: `Le rôle '${roleName}' n'existe pas dans ce spectacle.` });
            }

            // 🔍 Vérifier si le memberId est déjà assigné à un autre rôle
            const dejaAttribue = Object.entries(spectacle.roles).some(
                ([role, id]) => id && id.toString() === memberId
            );

            if (dejaAttribue) {
                return res.status(400).json({
                    error: "Ce membre occupe déjà un rôle dans ce spectacle."
                });
            }

            // ✅ Assigner le rôle et marquer la modification
            spectacle.roles[roleName] = candidature.memberId;
            spectacle.markModified("roles");
        }

        await spectacle.save();

        res.status(200).json({
            message: `Candidature ${status === "accepted" ? "acceptée" : "rejetée"} avec succès.`,
            candidature,
            rolesMiseAJour: spectacle.roles,
        });
    } catch (err) {
        console.error("Erreur validerCandidature:", err);
        res.status(500).json({ error: err.message });
    }
};



