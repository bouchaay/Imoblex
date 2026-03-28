# Imoblex — Logiciel de gestion immobilière

Plateforme immobilière complète pour l'agence **Imoblex** (Toulouse).

## Architecture

```
imoblex/
├── backend/        Spring Boot 3.3 + PostgreSQL 16 (API REST)
├── frontend/       Angular 17+ CRM back-office (app.imoblex.fr)
├── website/        Angular 17+ Site public (imoblex.fr)
├── nginx/          Reverse proxy configuration
└── docker-compose.yml
```

## Démarrage rapide (développement)

### 1. Lancer les services Docker (PostgreSQL, Redis, MinIO)

```bash
docker-compose up postgres redis minio -d
```

### 2. Backend Spring Boot

```bash
cd backend
./mvnw spring-boot:run
```
API disponible sur : http://localhost:8080/api
Swagger UI : http://localhost:8080/api/swagger-ui.html

### 3. Back-office CRM (Angular)

```bash
cd frontend
npm install
npm start
```
Disponible sur : http://localhost:4200
Compte admin : admin@imoblex.fr / Admin2024!

### 4. Site public (Angular)

```bash
cd website
npm install
npm start -- --port 4201
```
Disponible sur : http://localhost:4201

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Backend | Java 21, Spring Boot 3.3, Spring Security + JWT |
| Base de données | PostgreSQL 16, Flyway (migrations) |
| Cache | Redis 7 |
| Stockage fichiers | MinIO (S3-compatible) |
| Back-office | Angular 17+, PrimeNG 17, TailwindCSS |
| Site public | Angular 17+, TailwindCSS, Leaflet, Swiper |
| Déploiement | Docker, Nginx |

## Modules

### Back-office CRM
- **Dashboard** — KPIs, graphiques, alertes
- **Biens** — CRUD complet, photos, DPE, publication
- **Mandats** — Gestion légale, numérotation, renouvellements
- **Contacts (CRM)** — Acheteurs, vendeurs, locataires, historique
- **Transactions** — Pipeline ventes/locations, offres, compromis
- **Agenda** — Visites, RDV, rappels
- **Documents** — Génération PDF, stockage
- **Statistiques** — Performance agence et agents
- **Paramètres** — Agence, équipe, rôles

### Site public
- Recherche avancée vente/location
- Fiche bien avec galerie photos
- Vue carte (Leaflet)
- Estimation en ligne
- Simulateur de prêt
- Prise de contact

## Variables d'environnement

Créer un fichier `.env` à la racine (ou configurer dans application.yml) :

```env
DB_USER=imoblex
DB_PASSWORD=imoblex2024
JWT_SECRET=votre_secret_jwt_tres_long
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=contact@imoblex.fr
MAIL_PASSWORD=votre_mot_de_passe_app
```

## Références biens

Les références sont générées automatiquement au format `IMBxxxxx` (ex: `IMB00001`).

## Rôles utilisateurs

| Rôle | Droits |
|------|--------|
| ADMIN | Accès total (directeur) |
| MANAGER | Gestion équipe, statistiques |
| AGENT | CRUD biens, contacts, transactions |
| ASSISTANT | Lecture + agenda |
