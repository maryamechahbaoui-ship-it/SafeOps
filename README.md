# SafeOps – Plateforme de Gestion Centralisée des Opérations de Maintenance et de Sûreté

## Présentation

SafeOps est une application web conçue pour centraliser la gestion des opérations de maintenance des systèmes de vidéosurveillance et des équipements de sûreté répartis sur plusieurs sites.

La plateforme permet aux responsables de sûreté, superviseurs et techniciens de suivre l'état des équipements, gérer les interventions correctives et préventives, générer des procès-verbaux (PV) numériques, administrer les stocks de pièces de rechange et surveiller les indicateurs de performance de maintenance.

---

## Objectifs du projet

* Centraliser les données de maintenance de l'ensemble des sites.
* Assurer la traçabilité des interventions réalisées.
* Réduire les délais de traitement des incidents.
* Automatiser la génération et l'archivage des procès-verbaux.
* Optimiser la gestion des équipements et du stock.
* Fournir des tableaux de bord décisionnels en temps réel.

---

## Fonctionnalités principales

### Authentification et Sécurité

* Authentification par JWT.
* Gestion des rôles utilisateurs.
* Contrôle d'accès basé sur les permissions.
* Sessions sécurisées via cookies HTTPOnly.

### Gestion des Sites

* Création et gestion des sites.
* Activation ou désactivation d'un site.
* Consultation des statistiques par site.

### Gestion des Utilisateurs

* Création de comptes utilisateurs.
* Réinitialisation des mots de passe.
* Activation et désactivation des comptes.
* Gestion des rôles et des permissions.

### Gestion des Équipements

* Enregistrement des équipements.
* Consultation des caractéristiques techniques.
* Modification du statut des équipements.
* Historique des interventions.

### Gestion des Tickets

* Déclaration des incidents.
* Affectation des techniciens.
* Suivi du cycle de vie des tickets.
* Calcul automatique des indicateurs GTI et GTR.

### Maintenance Préventive

* Planification des visites préventives.
* Affectation des techniciens.
* Validation des interventions réalisées.
* Historique des opérations préventives.

### Gestion des Procès-Verbaux

* Génération automatique des PV au format PDF.
* Signature et validation des rapports.
* Archivage centralisé.
* Téléchargement des documents.

### Gestion du Stock

* Gestion des articles.
* Entrées et sorties de stock.
* Historique des mouvements.
* Alertes automatiques de seuil critique.

### Tableaux de Bord

* Indicateurs de disponibilité.
* Suivi des tickets ouverts et clôturés.
* Statistiques de maintenance préventive.
* Visualisation multi-sites.

---

## Architecture Technique

### Frontend

* React.js
* React Router
* CSS Vanilla
* Fetch API

### Backend

* Node.js
* Express.js
* JWT Authentication
* Middleware de sécurité

### Base de Données

* MySQL

### Génération de Documents

* PDFKit

### Stockage Cloud

* Cloudinary

---

## Rôles Utilisateurs

### Responsable Sûreté

* Gestion des sites.
* Gestion des utilisateurs.
* Consultation des tableaux de bord globaux.
* Supervision des activités de maintenance.

### Superviseur OCP

* Gestion des équipements de son site.
* Création et suivi des tickets.
* Planification des maintenances préventives.
* Validation des procès-verbaux.

### Technicien EDET

* Consultation des interventions assignées.
* Traitement des tickets.
* Réalisation des maintenances préventives.
* Saisie des diagnostics et comptes rendus.

---

## Structure du Projet

```text
safeops/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── database/
│   └── safeops.sql
│
└── README.md
```

---

## Installation

### Cloner le dépôt

```bash
git clone https://github.com/votre-repository/safeops.git
```

### Installation du Backend

```bash
cd backend
npm install
```

### Installation du Frontend

```bash
cd frontend
npm install
```

### Configuration des Variables d'Environnement

Créer un fichier `.env` :

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=safeops

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

### Lancement du Backend

```bash
npm run dev
```

### Lancement du Frontend

```bash
npm start
```

---

## Technologies Utilisées

| Catégorie            | Technologies          |
| -------------------- | --------------------- |
| Frontend             | React.js, CSS Vanilla |
| Backend              | Node.js, Express.js   |
| Base de données      | MySQL                 |
| Authentification     | JWT                   |
| Génération PDF       | PDFKit                |
| Stockage Cloud       | Cloudinary            |
| Gestion des versions | Git, GitHub           |

---

## Résultats Attendus

* Amélioration de la traçabilité des opérations de maintenance.
* Réduction des délais d'intervention.
* Centralisation des informations techniques.
* Automatisation des rapports et procès-verbaux.
* Optimisation de la gestion des stocks.
* Meilleure visibilité sur la performance des équipements.

---

## Auteur

**Maryam Echahbaoui**

Projet réalisé dans le cadre d'un stage de développement au sein d'OCP, portant sur la conception et le développement d'une application de gestion centralisée des opérations de maintenance des systèmes de vidéosurveillance et des équipements de sûreté.
