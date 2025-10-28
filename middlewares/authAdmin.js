// middleware/authAdmin.js

const jwt = require("jsonwebtoken");
require('dotenv').config();

// Middleware pour vérifier si l'utilisateur est un administrateur
module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.PASSWORD_TOKEN_JWT);

        // Vérifie le rôle
        if (decodedToken.role !== "admin") {
            return res.status(403).json({ message: "Accès refusé : réservé aux administrateurs" });
        }

        // On attache les infos du token à la requête
        req.user = decodedToken;

        next(); // autorisé à continuer
    } catch (error) {
        res.status(401).json({ message: "Token invalide ou expiré", error });
    }
};