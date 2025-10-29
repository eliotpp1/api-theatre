# API Théâtre - Initialisation et Lancement

Ce projet est une API Node.js pour gérer des utilisateurs, spectacles et ateliers d’un théâtre.

## Installation

Clonez le projet et installez les dépendances :

```bash
npm install

```

## Initialisation de l’admin

Créez un utilisateur admin (si aucun n’existe encore) :

```bash
node initializeApp.js
```


Ce script :
    Se connecte à la base MongoDB.

    Vérifie s’il existe déjà un admin.

    S’il n’existe pas, crée un admin actif avec les infos du .env.

    Permet de disposer d’un admin pour gérer les utilisateurs et contenus via l’API.


## Créez un fichier .env à la racine avec au minimum :


PORT=3000
PASSWORD_TOKEN_JWT=fiusejifjisjifjdsiqfjmfjkvfdbjkfdbdfs

MONGO_URI=mongodb+srv://username:password@clusterapitheatre.5bmmuer.mongodb.net/apitheatre?appName=clusterapitheatre
ADMIN_NOM=Admin
ADMIN_PRENOM=Principal
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

## Démarrer l'app avec nodemon

```bash
nodemon server
```

## Voir le swagger

Lancer la commande :
```bash
npm run swagger
```

Se rendre sur l'URL:

http://localhost:3001/api-docs/

## Définir son mot de passe 

Il faut d'abord créer un user avec soit le rôle "member" ou "resped".

Pour cela, dans POSTMAN, exécutez la requête suivante :

**Endpoint :** `POST http://localhost:3000/api/admins/users`

**Body :**
```json
{
  "nom": "Test",
  "prenom": "Test",
  "dateNaissance": "1965-05-12",
  "email": "test@gmail.com",
  "role": "resped"
}
```

Une fois le membre créé, dans la console, vous verrez ceci :
```bash
✅ Email simulé envoyé : <e438ea19-9bbe-b4a1-ef78-80a69e150208@theatre-api.com>
🔗 Aperçu : https://ethereal.email/message/aQEO14w8PbMuqDPKaQEO2VPQQmY66RD6AAAAARGWQNzD.Oa94LbBEYuCDyE
```

Cliquez sur le lien pour simuler l'envoi d'un email à la personne dont le compte vient d'être créé.

Sur ce faux email, il y a une URL avec le token d'invitation créé.

Pour définir son mot de passe :
1. Copiez l'URL complète contenant le token depuis l'email simulé
2. Dans POSTMAN, créez une nouvelle requête `POST` avec cette URL
3. Définissez le body suivant :
```json
{
  "password": "votre_mot_de_passe"
}
```

Le mot de passe sera alors associé à l'utilisateur qui vient d'être créé.
vous pourrez alors vous connecter avec l'URL http://localhost:3000/api/users/login avec en body:
```json
{
    "email": "test@gmail.com",
    "password": "votre_mot_de_passe"
}
```

