require('dotenv').config();
const Spectacle = require("../models/Spectacle");
const SpectacleType = require("../models/SpectacleType");


// createSpectacleType: crée un nouveau spectacle type
exports.createSpectacleType = async (req, res) => {
    try {
        const { date, nombrePersonnes, roles } = req.body;

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

        const spectacleType = new SpectacleType({ date, nombrePersonnes, roles });
        await spectacleType.save();

        res.status(201).json(spectacleType);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// getAllSpectacleTypes: récupère tous les spectacles types
exports.getAllSpectacleTypes = async (req, res) => {
    try {
        const spectacleTypes = await SpectacleType.find();
        res.status(200).json(spectacleTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// deleteSpectacleType: supprime un spectacle type par son ID
exports.deleteSpectacleType = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSpectacleType = await SpectacleType.findByIdAndDelete(id);

        if (!deletedSpectacleType) {
            return res.status(404).json({ error: "Spectacle type non trouvé." });
        }

        res.status(200).json({ message: "Spectacle type supprimé avec succès." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// updateSpectacleType: met à jour un spectacle type par son ID
exports.updateSpectacleType = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, nombrePersonnes, roles } = req.body;

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

        const updatedSpectacleType = await SpectacleType.findByIdAndUpdate(
            id,
            { date, nombrePersonnes, roles },
            { new: true, runValidators: true }
        );

        if (!updatedSpectacleType) {
            return res.status(404).json({ error: "Spectacle type non trouvé." });
        }

        res.status(200).json(updatedSpectacleType);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// createSpectacle: crée un nouveau spectacle
exports.createSpectacle = async (req, res) => {
    try {
        const { nom, date, nombrePersonnes, lieux, description, roles } = req.body;

        if (!roles || typeof roles !== "object") {
            return res.status(400).json({ error: "Le champ roles est requis." });
        }

        const rolesCount = Object.keys(roles).length;

        if (rolesCount !== nombrePersonnes) {
            return res.status(400).json({
                error: `Le nombre de rôles (${rolesCount}) doit correspondre à nombrePersonnes (${nombrePersonnes}).`,
            });
        }

        const spectacle = new Spectacle({ nom, date, nombrePersonnes, lieux, description, roles });
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
        const { nom, date, nombrePersonnes, lieux, description, roles } = req.body;

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
        }

        const updatedSpectacle = await Spectacle.findByIdAndUpdate(
            id,
            { nom, date, nombrePersonnes, lieux, description, roles },
            { new: true, runValidators: true }
        );

        if (!updatedSpectacle) {
            return res.status(404).json({ error: "Spectacle non trouvé." });
        }

        res.status(200).json(updatedSpectacle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// createSpectacleFromType: crée un spectacle à partir d’un spectacle type
exports.createSpectacleFromType = async (req, res) => {
    try {
        const { idType } = req.params;
        const { nom, date, lieux, description } = req.body;

        const spectacleType = await SpectacleType.findById(idType);
        if (!spectacleType) {
            return res.status(404).json({ error: "Spectacle type non trouvé." });
        }

        const spectacle = new Spectacle({
            nom,
            date,
            nombrePersonnes: spectacleType.nombrePersonnes,
            lieux,
            description,
            roles: spectacleType.roles,
        });

        await spectacle.save();

        res.status(201).json(spectacle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};