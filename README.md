# <p align="center">🛠️ SafeOps</p>
### <p align="center"><b>Plateforme de Gestion Centralisée des Opérations de Maintenance et de Sûreté</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Opérationnel-success?style=for-the-badge&logo=github&color=1B5E3C" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge&color=007cc7" alt="Version" />
  <img src="https://img.shields.io/badge/Rôle-PFE_OCP-orange?style=for-the-badge&color=f26522" alt="PFE OCP" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

---

## 📝 Présentation

**SafeOps** est une application web conçue pour centraliser et digitaliser la gestion des opérations de maintenance des systèmes de vidéosurveillance et des équipements de sûreté répartis sur les différents sites du **Groupe OCP**.

La plateforme permet aux responsables de sûreté, superviseurs et techniciens de suivre en temps réel la disponibilité du parc, de coordonner les interventions correctives et préventives, de générer automatiquement des procès-verbaux (PV) numériques signés, d'administrer l'inventaire de pièces détachées et de piloter les indicateurs de performance clés (SLA).

> [!NOTE]
> *Ce projet a été réalisé dans le cadre d'un stage de fin d'études au sein d'OCP Sûreté pour moderniser et dématérialiser les flux de maintenance physiques.*

---

## 🎯 Objectifs du Projet

*   🟢 **Centraliser** les données de maintenance de l'ensemble des sites de production.
*   🟢 **Assurer la traçabilité** complète des interventions (curatives et préventives).
*   🟢 **Réduire les délais** de traitement des incidents en optimisant le GTI et GTR.
*   🟢 **Automatiser** la génération et l'archivage sécurisé des procès-verbaux (PV PDF).
*   🟢 **Optimiser** les stocks locaux de pièces de rechange avec alertes en temps réel.
*   🟢 **Fournir des tableaux de bord** d'aide à la décision mis à jour instantanément.

---

## ✨ Fonctionnalités Principales

### 🛡️ Authentification & Sécurité
*   Session sécurisée par jeton **JWT** crypté.
*   Authentification stockée en cookies sécurisés **`HttpOnly`** (protection anti-XSS).
*   Contrôle d'accès basé sur les rôles (RBAC) et isolation des données stricte par site.

### 🏢 Gestion des Sites & Utilisateurs
*   Création et configuration des installations physiques.
*   Activation / Désactivation en un clic des accès sites et des comptes utilisateurs.
*   Console de réinitialisation sécurisée des mots de passe.

### ⚙️ Référentiel des Équipements
*   Fiche technique complète par équipement (numéro de série, marque, modèle, zone).
*   Indicateur dynamique d'état de marche (Fonctionnel 🟢 / En panne 🔴).

### 🚨 Maintenance Curative (Tickets)
*   Création immédiate de tickets d'incidents avec niveaux de gravité.
*   Mesure automatique des indicateurs contractuels **GTI** (Intervention) et **GTR** (Rétablissement).
*   Affectation et suivi de résolution par technicien.

### 📅 Maintenance Préventive
*   Calendrier interactif des visites préventives obligatoires (mensuel, trimestriel).
*   Fiche d'émargement et check-list technique de conformité.

### 📦 Gestion du Stock & Logistique
*   Inventaire en temps réel des pièces de rechange par site.
*   Sortie automatique d'articles lors de la clôture des interventions.
*   **Indicateurs d'alertes visuels** lors du franchissement de seuils de réapprovisionnement.

### 📄 Édition & Signature des PV
*   Génération en direct de documents PDF officiels et bilingues (bâtis via PDFKit).
*   Stockage externe Cloud et validation par Visa électronique du superviseur OCP.

---

## 📐 Architecture Technique

<p align="center">
  <img src="https://img.shields.io/badge/Client_React-20232A?style=flat-square&logo=react&logoColor=61DAFB" /> ➔ 
  <img src="https://img.shields.io/badge/API_Express-000000?style=flat-square&logo=express&logoColor=white" /> ➔ 
  <img src="https://img.shields.io/badge/Database_MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
</p>

*   **Frontend** : Single Page Application React.js, React Router, CSS Vanilla (Design System sur-mesure), Fetch API.
*   **Backend** : Serveur d'API RESTful Node.js + Express, middleware de sécurité JWT.
*   **Base de Données** : Serveur relationnel MySQL / MariaDB (Transactions ACID).
*   **Stockage PDF** : Service d'hébergement cloud d'images/fichiers **Cloudinary**.

---

## 👥 Rôles Utilisateurs

### 👑 Responsable Sûreté (Admin Global)
*   Supervise l'ensemble du parc de tous les sites d'exploitation.
*   Administre les comptes utilisateurs et configure les nouveaux sites.
*   Audite l'historique global des mouvements de stocks.

### 👔 Superviseur OCP (Local Site)
*   Gère le parc de matériels et déclare les pannes de son site.
*   Planifie les tâches et assigne les techniciens.
*   Examine et valide numériquement les procès-verbaux d'intervention.

### 🔧 Technicien EDET (Field Agent)
*   Consulte son planning personnel d'interventions sur le terrain.
*   Saisit le diagnostic de résolution et valide la conformité des contrôles.
*   Déclare les pièces consommées lors de ses dépannages.

---

## 📁 Structure du Projet

```text
safeops/
├── frontend/           # Client SPA React
│   ├── src/            # Vues et composants
│   └── public/         # Images et logos officiels OCP
├── backend/            # Serveur d'API REST Node/Express
│   ├── controllers/    # Logique métier et transactions SQL
│   ├── routes/         # Mappage des endpoints d'API
│   ├── middlewares/    # Sécurité et validation JWT
│   └── services/       # Moteur PDFKit & CDN Cloudinary
├── docker-compose.yml  # Orchestration des conteneurs
└── README.md           # Documentation d'accueil
```

---

## ⚙️ Installation & Lancement

### 1. Cloner le Dépôt
```bash
git clone https://github.com/maryamechahbaoui-ship-it/SafeOps.git
cd SafeOps
```

### 2. Lancement Rapide (Docker Compose 🐳)
Si Docker est installé, démarrez la base de données, l'API et le client en une commande :
```bash
docker-compose up --build
```
L'application client est alors accessible sur le port `80` et l'API sur le port `5001`.

### 3. Lancement Manuel

#### Configurer le Backend
```bash
cd backend
npm install
```
Créez un fichier `.env` sur le modèle de `.env.example` et complétez vos variables d'accès à MySQL et Cloudinary. Lancez ensuite le serveur :
```bash
npm run dev
```

#### Configurer le Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📊 Technologies & Outils

| Catégorie | Outils Utilisés |
| :--- | :--- |
| **Frontend** | React.js (v18), React Router, Vanilla CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, Bcrypt.js |
| **Base de Données** | MySQL, MariaDB, mysql2 Driver |
| **Génération PDF** | PDFKit |
| **Hébergement Cloud**| Cloudinary API |
| **Conteneurisation** | Docker, Docker Compose, Nginx |

---

## 🏆 Résultats & Bénéfices

*   🚀 **Productivité accrue** : Remplacement des fiches papier par des formulaires instantanés et réactifs.
*   🚀 **Calcul de SLA infalsifiable** : Horodatage précis pour le respect du GTI/GTR contractuel.
*   🚀 **Logistique maîtrisée** : Élimination des ruptures de stocks de pièces critiques grâce aux alertes de seuil.
*   🚀 **Archivage sécurisé** : Tous les rapports PV sont centralisés, validés électroniquement et stockés de façon pérenne dans le Cloud.

---

## ✍️ Auteur

*   **Maryam Echahbaoui** - *Élève Ingénieure*
*   Projet réalisé dans le cadre d'un stage d'intégration au sein du département **Sûreté Industrielle (MIG)** du **Groupe OCP**.
