require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/UserModel');

async function initializeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connecté ✅');

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Un admin existe déjà en base :', existingAdmin.email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        const admin = new User({
            nom: process.env.ADMIN_NOM,
            prenom: process.env.ADMIN_PRENOM,
            email: process.env.ADMIN_EMAIL,
            dateNaissance: new Date(),
            passwordHash: hashedPassword,
            role: 'admin',
            isActive: true
        });

        await admin.save();
        console.log('Admin créé avec succès', admin.email);
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de l’initialisation :', error);
        process.exit(1);
    }
}

initializeAdmin();
