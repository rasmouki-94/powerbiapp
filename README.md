# Pipeline Prospection LinkedIn

Application web locale pour gérer un pipeline de prospection LinkedIn de A à Z.

## Installation

```bash
# Installer les dépendances
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## Lancement

```bash
npm start
```

Cela lance simultanément :
- **Backend** (Express + SQLite) sur `http://localhost:3001`
- **Frontend** (React + Vite) sur `http://localhost:5173`

Ouvrez `http://localhost:5173` dans votre navigateur.

## Utilisation

1. **Avatars** : Définissez vos profils de clients idéaux (secteurs, douleurs, mots-clés LinkedIn)
2. **Templates** : Créez vos modèles de messages avec variables (`{prénom}`, `{entreprise}`, `{poste}`, `{douleurs_avatar}`)
3. **Prospects** : Ajoutez manuellement ou importez un CSV (colonnes : prenom, nom, entreprise, poste, url_linkedin, avatar_id, statut)
4. **Actions du jour** : Page d'accueil avec les DM à envoyer (J+0), messages J+3 et relances en retard
5. **Pipeline** : Vue Kanban drag & drop pour déplacer les prospects entre statuts
6. **Statistiques** : Taux de conversion, répartition, performance par avatar

## Stack technique

- React 18, TypeScript, Tailwind CSS, Recharts, Vite
- Express.js, better-sqlite3 (base de données dans `server/data/prospecting.db`)
