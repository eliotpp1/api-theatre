// on importe le paquet express
const express = require('express');
const mongoose = require('mongoose')
const userRoutes = require('./routes/users.js')
const adminRoutes = require('./routes/admin.js');
const atelierRoutes = require('./routes/ateliers.js');
const spectacleRoutes = require('./routes/spectacles.js');


// On crée l'application Express
const app = express();

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permet de dire que tout le monde peut y accéder
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // L'autorisation ici de certains en-tête
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next(); // L'autorisation des différentes méthodes HHTP
});
app.use(express.json())

app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/ateliers", atelierRoutes);
app.use("/api/spectacles", spectacleRoutes);

// On export l’application
module.exports = app;