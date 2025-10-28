require('dotenv').config();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const User = require("../models/UserModel");
const Invitation = require("../models/InvitationModel");
const Atelier = require("../models/AtelierModel");
const bcrypt = require("bcrypt");

// loginUser: Authentifie un utilisateur et retourne un token JWT
exports.loginUser = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user === null) {
                res.status(401).json({ message: "Paire login/mot de passe incorrecte" });
            } else {
                bcrypt
                    .compare(req.body.password, user.passwordHash)
                    .then((valid) => {
                        if (!valid) {
                            res.status(401).json({ message: "Paire login/mot de passe incorrecte" });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign({ userId: user._id }, process.env.PASSWORD_TOKEN_JWT, { expiresIn: "24h" }),
                            });
                        }
                    })
                    .catch((error) => res.status(500).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

// getCurrentUser: Récupère les informations de l'utilisateur courant
exports.getCurrentUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Format de token invalide" });
        }

        const decodedToken = jwt.verify(token, process.env.PASSWORD_TOKEN_JWT);
        const userId = decodedToken.userId;

        User.findById(userId)
            .select("-passwordHash")
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: "Utilisateur non trouvé" });
                }
                res.status(200).json(user);
            })
            .catch((error) => res.status(500).json({ error }));
    } catch (error) {
        res.status(401).json({ message: "Token invalide ou expiré", error });
    }
};

// completeInvite: Permet à un utilisateur invité de définir son mot de passe et d'activer son compte
exports.completeInvite = (req, res, next) => {
    // On récupère le token depuis la query string
    const { token } = req.query;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: "Token manquant." });
    if (!password) return res.status(400).json({ message: "Mot de passe requis." });

    Invitation.findOne({ token, used: false, expiresAt: { $gt: new Date() } })
        .then((invitation) => {
            if (!invitation) {
                return res.status(400).json({ message: "Token invalide ou expiré." });
            }

            // Hash du mot de passe et activation du compte
            bcrypt.hash(password, 10)
                .then((hash) => {
                    User.findByIdAndUpdate(invitation.userId, {
                        passwordHash: hash,
                        isActive: true
                    })
                        .then(() => {
                            invitation.used = true;
                            invitation.save(); // on marque le token comme utilisé
                            res.status(200).json({ message: "Mot de passe défini, compte activé." });
                        })
                        .catch((error) => res.status(500).json({ message: "Erreur mise à jour user", error }));
                })
                .catch((error) => res.status(500).json({ message: "Erreur hash mot de passe", error }));
        })
        .catch((error) => res.status(500).json({ message: "Erreur serveur", error }));
};

// signuUpAtelier: Inscrit un utilisateur à un atelier en récupérant l'ID de l'atelier depuis les paramètres de l'URL et son Id via le header d'authorization
exports.signuUpAtelier = async (req, res, next) => {
    try {
        const { atelierId } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Format de token invalide" });
        }

        const decodedToken = jwt.verify(token, process.env.PASSWORD_TOKEN_JWT);
        const userId = decodedToken.userId;
        console.log("UserID from token:", userId);

        if (!mongoose.Types.ObjectId.isValid(atelierId)) {
            return res.status(400).json({ message: "ID d'atelier invalide" });
        }


        const atelier = await Atelier.findById(atelierId);
        if (!atelier) return res.status(404).json({ message: "Atelier non trouvé." });

        const user = await User.findById(userId);
        if (!user || user.role !== "member") {
            return res.status(404).json({ message: "Utilisateur non trouvé ou non de rôle membre (vérifiez votre token jwt)." });
        }

        if (atelier.participants.some(p => p.equals(user._id))) {
            return res.status(400).json({ message: "Utilisateur déjà inscrit à cet atelier." });
        }

        atelier.participants.push(user._id);
        await atelier.save();

        res.status(200).json({
            message: "Inscription à l'atelier réussie.",
            atelier
        });
    } catch (error) {
        console.error("Erreur lors de l'inscription à l'atelier :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription à l'atelier.", error });
    }
};
