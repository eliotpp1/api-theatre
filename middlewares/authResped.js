// middleware/authResped.js
const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require("../models/UserModel");

// Middleware pour vérifier si l'utilisateur est un responsable pédagogique
module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token resped manquant" });
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.PASSWORD_TOKEN_JWT);
        console.log(decodedToken);

        // On récupère le rôle de l'utilisateur via l'id du token
        const userId = decodedToken.userId;
        console.log("UserID from token:", userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }


        // Vérifie le rôle
        if (user.role !== "resped") {
            return res.status(403).json({ message: "Accès refusé : réservé aux responsables" });
        }

        // On attache les infos du token à la requête
        req.user = decodedToken;

        next(); // autorisé à continuer
    } catch (error) {
        res.status(401).json({ message: "Token invalide ou expiré", error });
    }
};
