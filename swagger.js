const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'My API Théâtre 🎭',
        description: 'API pour la gestion des ateliers et spectacles d\'un théâtre',
    },
    host: 'localhost:3001',
    schemes: ['http'],
    basePath: '/api',
};

const outputFile = './swagger-output.json';

// ⚠️ Ici tu dois passer ton fichier `app.js` car c’est lui qui importe toutes les routes.
// swagger-autogen va ainsi parcourir les `app.use("/api/...", routeFile)` et tout inclure.
const routes = ['./app.js'];

swaggerAutogen(outputFile, routes, doc);
