const Logements = require("../models/Logements.js");

exports.findAllHousing = (req, res, next) => {
    Logements.find() // On enregistre dans la BDD
        .then((logements) => res.status(200).json(logements))
        .catch(error => res.status(400).json({ error: error }));
};

exports.createHousing = (req, res, next) => {
    const logement = new Logements({
        ...req.body // On décompose toutes les données dans le req.body
    });
    logement.save() // On enregistre dans la BDD
        .then(() => res.status(201).json({ message: "Le logement vient d'être créé !" }))
        .catch(error => res.status(400).json({ error: error }));
};

exports.findOneHousing = (req, res, next) => {
    Logements.findOne({ _id: req.params.id })
        .then(logements => res.status(200).json(logements))
        .catch(error => res.status(404).json({ error }));
};

exports.editHousing = (req, res, next) => {
    Logements.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: "Logement modifié !" }))
        .catch((error) => res.status(400).json({ error }));
};

exports.deleteHousing = (req, res, next) => {
    Logements.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Logement supprimé !" }))
        .catch((error) => res.status(400).json({ error }))
};

