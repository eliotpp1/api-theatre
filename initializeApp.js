require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/UserModel');

async function initializeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connecté ✅');

        let admin = await User.findOne({ role: 'admin' });

        if (admin) {
            console.log('Un admin existe déjà :', admin.email);
        } else {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

            admin = new User({
                nom: process.env.ADMIN_NOM,
                prenom: process.env.ADMIN_PRENOM,
                email: process.env.ADMIN_EMAIL,
                dateNaissance: new Date(),
                passwordHash: hashedPassword,
                role: 'admin',
                isActive: true
            });

            await admin.save();
            console.log('Admin créé avec succès :', admin.email);
        }

        // Génère le JWT pour l’admin
        const token = jwt.sign(
            { userId: admin._id, role: admin.role },
            process.env.PASSWORD_TOKEN_JWT,
            { expiresIn: '24h' }
        );

        console.log('Token JWT admin :', token);
        process.exit(0);

    } catch (error) {
        console.error('Erreur lors de l’initialisation :', error);
        process.exit(1);
    }
}

initializeAdmin();
