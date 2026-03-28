# Imoblex — Plan de Tests Fonctionnels Complet
> Version 1.0 — 2026-03-28
> Périmètre : IHM Back-Office (CRM Angular), Site Public (Website Angular), API REST (Spring Boot), Base de données (PostgreSQL)

---

## Légende

| Symbole | Signification |
|---------|--------------|
| `[IHM-CRM]` | Test réalisé sur l'interface back-office |
| `[IHM-WEB]` | Test réalisé sur le site public |
| `[API]` | Test réalisé via appel HTTP direct (Postman / curl) |
| `[BDD]` | Vérification en base de données (SQL) |
| ✅ | Résultat attendu = OK |
| ❌ | Résultat attendu = Erreur / Refus |

---

## TABLE DES MATIÈRES

1. [Authentification & Sécurité](#1-authentification--sécurité)
2. [Gestion des Biens Immobiliers](#2-gestion-des-biens-immobiliers)
3. [Gestion des Contacts (CRM)](#3-gestion-des-contacts-crm)
4. [Gestion des Mandats](#4-gestion-des-mandats)
5. [Pipeline des Transactions](#5-pipeline-des-transactions)
6. [Agenda & Rendez-vous](#6-agenda--rendez-vous)
7. [Tableau de Bord & Reporting](#7-tableau-de-bord--reporting)
8. [Site Public — Annonces](#8-site-public--annonces)
9. [Site Public — Pages Statiques](#9-site-public--pages-statiques)
10. [Intégrité Base de Données](#10-intégrité-base-de-données)
11. [Sécurité & Autorisations par Rôle](#11-sécurité--autorisations-par-rôle)
12. [Tests Transversaux & Cas Limites](#12-tests-transversaux--cas-limites)

---

## 1. AUTHENTIFICATION & SÉCURITÉ

### 1.1 Connexion Back-Office

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| AUTH-01 | Connexion valide ADMIN | `[IHM-CRM]` `[BDD]` | 1. Accéder à `/login` 2. Saisir email/mot de passe valide ADMIN 3. Cliquer "Se connecter" | ✅ Redirection vers `/dashboard`. Token JWT stocké. Champ `lastLoginAt` mis à jour en BDD. |
| AUTH-02 | Connexion valide AGENT | `[IHM-CRM]` | 1. Saisir credentials AGENT | ✅ Connexion OK, menu latéral adapté au rôle AGENT (sans gestion utilisateurs) |
| AUTH-03 | Email invalide | `[IHM-CRM]` `[API]` | 1. Saisir `notexist@test.com` + mot de passe | ❌ Message "Identifiants invalides". Code HTTP 401. Aucun token retourné. |
| AUTH-04 | Mot de passe incorrect | `[IHM-CRM]` `[API]` | 1. Email valide + mauvais mot de passe | ❌ Message "Identifiants invalides". Pas de fuite d'info (même message qu'AUTH-03). |
| AUTH-05 | Champs vides | `[IHM-CRM]` | 1. Laisser email et mot de passe vides 2. Cliquer "Se connecter" | ❌ Validation HTML5 / Angular : champs requis mis en évidence. Aucun appel API. |
| AUTH-06 | Déconnexion | `[IHM-CRM]` | 1. Cliquer sur le menu utilisateur → "Déconnexion" | ✅ Token supprimé du storage. Redirection vers `/login`. L'URL protégée redirige vers login. |
| AUTH-07 | Accès direct URL sans token | `[IHM-CRM]` | 1. Sans être connecté, accéder à `/properties` | ✅ Redirection automatique vers `/login` (guard Angular) |
| AUTH-08 | Token expiré | `[API]` | 1. Utiliser un token JWT expiré sur `GET /properties` | ❌ HTTP 401 Unauthorized |
| AUTH-09 | Token malformé | `[API]` | 1. `Authorization: Bearer invalidtoken123` | ❌ HTTP 401 |
| AUTH-10 | Endpoint public sans token | `[API]` | 1. `GET /public/properties` sans Authorization header | ✅ HTTP 200, liste des biens publiés |
| AUTH-11 | Swagger UI accessible | `[API]` | 1. Accéder à `/swagger-ui.html` sans token | ✅ Page Swagger chargée |
| AUTH-12 | Actuator health | `[API]` | 1. `GET /actuator/health` | ✅ HTTP 200 `{"status":"UP"}` |

---

## 2. GESTION DES BIENS IMMOBILIERS

### 2.1 Création d'un Bien

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| PROP-01 | Création bien vente appartement — champs obligatoires | `[IHM-CRM]` `[BDD]` | 1. Menu → Biens → "+ Nouveau bien" 2. Remplir : Type=VENTE, Bien=APARTMENT, Adresse, Ville, CP, Prix=250000 3. Sauvegarder | ✅ Bien créé. Référence `IMB000XX` auto-générée. Statut = AVAILABLE. Redirection vers le détail. En BDD : ligne dans `properties`, `reference` unique, `created_at` renseigné. |
| PROP-02 | Création bien location maison — tous les champs | `[IHM-CRM]` `[BDD]` | 1. Type=RENT, Bien=HOUSE 2. Remplir tous les champs (surface, pièces, équipements, DPE, chauffage, description, etc.) | ✅ Tous les champs persistés. Champs booléens (piscine, ascenseur…) corrects en BDD. |
| PROP-03 | Champs obligatoires manquants | `[IHM-CRM]` | 1. Créer un bien sans remplir "Prix" | ❌ Validation formulaire : champ prix mis en rouge. Aucun appel API. |
| PROP-04 | Champs obligatoires manquants — côté API | `[API]` | `POST /properties` sans `price` | ❌ HTTP 400 Bad Request, body JSON avec erreurs de validation |
| PROP-05 | Unicité de la référence | `[BDD]` | Créer 3 biens successivement | ✅ BDD : `IMB00001`, `IMB00002`, `IMB00003` — pas de doublon sur la colonne `reference` |
| PROP-06 | Upload photos | `[IHM-CRM]` `[BDD]` | 1. Dans le formulaire, uploader 3 photos 2. Sauvegarder | ✅ Table `property_photos` : 3 lignes, `position` = 0, 1, 2. La photo position=0 est la principale. |
| PROP-07 | Réorganisation photos (drag & drop) | `[IHM-CRM]` | 1. Glisser-déposer pour changer l'ordre des photos | ✅ L'ordre des positions est mis à jour. La nouvelle photo en position 0 s'affiche en miniature principale. |
| PROP-08 | Ajout URL visite virtuelle | `[IHM-CRM]` `[BDD]` | 1. Remplir `virtualTourUrl` avec une URL | ✅ URL persistée, non modifiée. |
| PROP-09 | Création avec type VIAGER | `[IHM-CRM]` | 1. TransactionType = VIAGER | ✅ Bien créé avec type VIAGER |
| PROP-10 | Création avec DPE classe A | `[IHM-CRM]` `[BDD]` | 1. dpeClass=A, gesClass=A, dpeValue=50, gesValue=3 | ✅ Badge DPE vert affiché. Valeurs correctes en BDD. |
| PROP-11 | DPE exempté | `[IHM-CRM]` | 1. Cocher "Dispensé de DPE" | ✅ Les champs DPE sont désactivés/masqués dans le formulaire. `dpe_exempt=true` en BDD. |
| PROP-12 | Assignation d'un agent | `[IHM-CRM]` `[BDD]` | 1. Dans le formulaire, sélectionner un agent dans la liste | ✅ `agent_id` en BDD = UUID de l'agent sélectionné. |

### 2.2 Lecture & Recherche

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| PROP-13 | Liste biens — chargement initial | `[IHM-CRM]` | 1. Accéder à `/properties` | ✅ Liste paginée (12 par défaut), triée par date de création DESC. |
| PROP-14 | Vue grille / vue liste | `[IHM-CRM]` | 1. Cliquer sur les boutons de vue | ✅ Basculement entre vue cartes et tableau. Les données restent identiques. |
| PROP-15 | Recherche par mot-clé | `[IHM-CRM]` `[API]` | 1. Taper "Toulouse" dans la barre de recherche | ✅ Seuls les biens contenant "Toulouse" dans adresse/ville/description s'affichent. |
| PROP-16 | Filtre type de transaction | `[IHM-CRM]` | 1. Filtre "Vente" | ✅ Seuls les biens `transactionType=SALE` retournés. |
| PROP-17 | Filtre type de bien | `[IHM-CRM]` | 1. Filtre "Appartement" | ✅ Seuls `propertyType=APARTMENT` |
| PROP-18 | Filtre statut | `[IHM-CRM]` | 1. Filtre "Sous offre" | ✅ Seuls `status=UNDER_OFFER` |
| PROP-19 | Filtre fourchette de prix | `[IHM-CRM]` `[API]` | 1. priceMin=200000, priceMax=400000 | ✅ Seuls les biens dans la fourchette. Vérifier en BDD avec `WHERE price BETWEEN 200000 AND 400000`. |
| PROP-20 | Filtre surface minimale | `[IHM-CRM]` | 1. areaMin=60 | ✅ Seuls les biens avec `living_area >= 60` |
| PROP-21 | Filtre nombre de pièces | `[IHM-CRM]` | 1. roomsMin=3, roomsMax=5 | ✅ Biens avec 3 à 5 pièces |
| PROP-22 | Filtre équipements (piscine) | `[IHM-CRM]` | 1. Cocher "Piscine" | ✅ Seuls les biens avec `pool=true` |
| PROP-23 | Filtres combinés | `[IHM-CRM]` `[API]` | 1. RENT + APARTMENT + Toulouse + 3 pièces min | ✅ Intersection de tous les filtres |
| PROP-24 | Tri par prix ascendant | `[IHM-CRM]` | 1. Sélectionner tri "Prix ↑" | ✅ Les biens sont triés par price ASC |
| PROP-25 | Tri par date de création | `[IHM-CRM]` | 1. Tri "Date création ↓" | ✅ Plus récent en premier |
| PROP-26 | Pagination | `[IHM-CRM]` | 1. Créer 15 biens. Accéder à la liste. 2. Cliquer "Page 2" | ✅ Page 1 = 12 biens, page 2 = 3 biens. Boutons précédent/suivant fonctionnels. |
| PROP-27 | Détail d'un bien | `[IHM-CRM]` | 1. Cliquer sur un bien | ✅ Toutes les informations affichées (photos, description, caractéristiques, DPE, agent, stats). |
| PROP-28 | Récupération par référence | `[API]` | `GET /properties/ref/IMB00001` | ✅ HTTP 200, body = PropertyResponse |
| PROP-29 | ID inexistant | `[API]` | `GET /properties/{faux-uuid}` | ❌ HTTP 404, message "Bien introuvable" |

### 2.3 Modification

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| PROP-30 | Modification du prix | `[IHM-CRM]` `[BDD]` | 1. Ouvrir un bien → "Modifier" 2. Changer le prix 3. Sauvegarder | ✅ Nouveau prix affiché. `updated_at` mis à jour en BDD. Ancien prix remplacé. |
| PROP-31 | Modification statut → UNDER_OFFER | `[IHM-CRM]` `[BDD]` | 1. Changer `status` à "Sous offre" | ✅ Badge de statut mis à jour dans la liste et le détail. BDD : `status='UNDER_OFFER'`. |
| PROP-32 | Modification statut → SOLD | `[IHM-CRM]` | 1. Changer `status` à "Vendu" | ✅ Badge "Vendu" affiché. |
| PROP-33 | Modification description | `[IHM-CRM]` | 1. Modifier la description (max 5000 chars) | ✅ Nouvelle description sauvegardée. |
| PROP-34 | Suppression d'une photo | `[IHM-CRM]` `[BDD]` | 1. Dans l'édition, supprimer une photo | ✅ Photo retirée. En BDD : ligne supprimée de `property_photos`. Les positions des autres photos sont réorganisées. |

### 2.4 Publication

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| PROP-35 | Publier sur le site | `[IHM-CRM]` `[BDD]` `[API]` | 1. Bien non publié → cliquer "Publier" | ✅ `published_website=true` en BDD, `published_at` renseigné. Le bien apparaît sur `GET /public/properties`. |
| PROP-36 | Dépublier | `[IHM-CRM]` `[BDD]` `[API]` | 1. Bien publié → cliquer "Dépublier" | ✅ `published_website=false`. Le bien disparaît de `GET /public/properties`. |
| PROP-37 | Compteur de vues | `[IHM-CRM]` `[API]` `[BDD]` | 1. Appeler `GET /public/properties/{id}` 3 fois | ✅ `view_count` passe de 0 à 3 en BDD. Affiché dans le détail CRM. |
| PROP-38 | Publication Seloger | `[IHM-CRM]` `[BDD]` | 1. Cocher "Publier sur SeLoger" | ✅ `published_seloger=true` en BDD. |

### 2.5 Suppression

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| PROP-39 | Suppression bien (ADMIN) | `[IHM-CRM]` `[BDD]` | 1. ADMIN → Bien → "Supprimer" 2. Confirmer dans la boîte de dialogue | ✅ Bien supprimé. Photos orphelines supprimées (cascade). Ligne disparue de `properties`. Redirection vers la liste. |
| PROP-40 | Suppression interdite (AGENT) | `[IHM-CRM]` `[API]` | 1. Connecté en AGENT → `DELETE /properties/{id}` | ❌ HTTP 403 Forbidden. Bouton "Supprimer" absent de l'IHM pour les AGENT. |
| PROP-41 | Annulation de suppression | `[IHM-CRM]` | 1. Cliquer "Supprimer" 2. Cliquer "Annuler" dans la modale | ✅ Aucune suppression. Bien toujours présent. |
| PROP-42 | Suppression bien inexistant | `[API]` | `DELETE /properties/{faux-uuid}` | ❌ HTTP 404 |

---

## 3. GESTION DES CONTACTS (CRM)

### 3.1 Création d'un Contact

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| CONT-01 | Création contact BUYER | `[IHM-CRM]` `[BDD]` | 1. Contacts → "+ Nouveau contact" 2. Prénom, Nom, Email, Téléphone, Type=BUYER | ✅ Contact créé, statut=PROSPECT par défaut. BDD : ligne dans `contacts`, `status='PROSPECT'`. |
| CONT-02 | Création contact SELLER avec société | `[IHM-CRM]` `[BDD]` | 1. Type=SELLER, remplir champ "Société" | ✅ Champ `company` persisté. |
| CONT-03 | Contact BOTH (acheteur/vendeur) | `[IHM-CRM]` | 1. Type=BOTH | ✅ Type=BOTH accepté. |
| CONT-04 | Email en doublon | `[IHM-CRM]` `[API]` | 1. Créer 2 contacts avec le même email | ❌ Erreur "Email déjà utilisé" (si contrainte unique). |
| CONT-05 | Champs obligatoires manquants | `[IHM-CRM]` | 1. Laisser "Nom" vide | ❌ Validation formulaire. |
| CONT-06 | Préférences de recherche (SearchCriteria) | `[IHM-CRM]` `[BDD]` | 1. Dans le contact, onglet "Recherche" 2. Remplir budgetMin=200000, budgetMax=400000, villes="Toulouse,Blagnac", alertActive=true | ✅ Ligne créée dans `search_criteria`, liée au contact par `contact_id` (OneToOne). |
| CONT-07 | Activation alertes email | `[IHM-CRM]` `[BDD]` | 1. `alertActive=true`, fréquence=DAILY | ✅ `alert_active=true`, `alert_frequency='DAILY'` en BDD. |
| CONT-08 | Assignation à un agent | `[IHM-CRM]` `[BDD]` | 1. Sélectionner l'agent responsable | ✅ `assigned_agent_id` renseigné en BDD. |

### 3.2 Interactions & Historique

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| CONT-09 | Ajouter un appel téléphonique | `[IHM-CRM]` `[BDD]` | 1. Contact → onglet "Historique" 2. "+ Interaction" → Type=CALL, contenu="Premier contact" | ✅ Interaction créée. BDD : ligne `contact_interactions`, `type='CALL'`, `created_at` auto. |
| CONT-10 | Ajouter une note | `[IHM-CRM]` `[BDD]` | 1. Type=NOTE, texte libre | ✅ Note persistée, affichée dans l'historique trié par date DESC. |
| CONT-11 | Ajouter une visite liée à un bien | `[IHM-CRM]` `[BDD]` | 1. Type=VISIT, remplir `relatedPropertyRef=IMB00001` | ✅ `related_property_ref='IMB00001'` en BDD. Affiché dans le timeline contact. |
| CONT-12 | Ajouter une offre | `[IHM-CRM]` `[BDD]` | 1. Type=OFFER, contenu="Offre 280 000 € acceptée" | ✅ Interaction de type OFFER créée. |
| CONT-13 | Planifier un rendez-vous depuis l'interaction | `[IHM-CRM]` | 1. Type=MEETING, `scheduledAt` = date future | ✅ `scheduled_at` renseigné. Idéalement, un RDV apparaît dans l'agenda. |
| CONT-14 | Limite 2000 caractères sur contenu | `[IHM-CRM]` `[API]` | 1. Saisir 2001 caractères dans le contenu | ❌ Validation côté front et API. |

### 3.3 Recherche & Filtres Contacts

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| CONT-15 | Recherche par nom | `[IHM-CRM]` | 1. Taper "Dupont" dans la barre | ✅ Seuls les contacts "Dupont" |
| CONT-16 | Filtre par type | `[IHM-CRM]` | 1. Filtre "Acquéreurs" | ✅ Seuls les contacts `type=BUYER` |
| CONT-17 | Filtre par statut | `[IHM-CRM]` | 1. Filtre "Actifs" | ✅ Seuls `status=ACTIVE` |
| CONT-18 | Changement de statut | `[IHM-CRM]` `[BDD]` | 1. Contact PROSPECT → changer statut à ACTIVE | ✅ `status='ACTIVE'` en BDD. |

### 3.4 Modification & Suppression

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| CONT-19 | Modifier email & téléphone | `[IHM-CRM]` `[BDD]` | 1. Modifier email et mobile d'un contact | ✅ Nouvelles valeurs en BDD. |
| CONT-20 | Supprimer un contact | `[IHM-CRM]` `[BDD]` | 1. Supprimer un contact (confirmer) | ✅ Ligne supprimée. `search_criteria` et `contact_interactions` supprimés en cascade. |
| CONT-21 | Opt-out email | `[IHM-CRM]` `[BDD]` | 1. Décocher "Accepte les emails" | ✅ `accepts_email=false` en BDD. |

---

## 4. GESTION DES MANDATS

### 4.1 Création

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| MAND-01 | Créer un mandat exclusif | `[IHM-CRM]` `[BDD]` | 1. Mandats → "+ Nouveau mandat" 2. Type=EXCLUSIVE, lier un bien (IMB00001), un mandant (contact SELLER), un agent 3. Prix convenu=300000, honoraires=5%, durée: 01/01/2026 → 31/03/2026 | ✅ Mandat créé, `mandate_number` auto-généré unique. Statut=ACTIVE. BDD : toutes les FK renseignées. |
| MAND-02 | Mandat simple | `[IHM-CRM]` | 1. Type=SIMPLE | ✅ Mandat créé. |
| MAND-03 | Honoraires % calculés | `[IHM-CRM]` | 1. Prix=300000, agencyFeesPercent=5 | ✅ `agency_fees` = 15000 calculé ou vérifié. |
| MAND-04 | Lier un bien déjà sous mandat exclusif | `[IHM-CRM]` | 1. Tenter de créer un 2e mandat EXCLUSIVE sur le même bien | ❌ Message d'erreur "Ce bien a déjà un mandat exclusif actif". |
| MAND-05 | Champs obligatoires manquants | `[IHM-CRM]` | 1. Ne pas remplir `endDate` | ❌ Validation formulaire. |

### 4.2 Alertes & Statuts

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| MAND-06 | Alerte mandat expirant bientôt | `[IHM-CRM]` `[BDD]` | 1. Créer mandat avec `endDate` dans 20 jours | ✅ Dans la liste des mandats, badge orange "Expire dans 20 jours". `isExpiringSoon()` = true (≤ 30 jours). |
| MAND-07 | Mandat expiré | `[IHM-CRM]` `[BDD]` | 1. Créer mandat avec `endDate` = hier | ✅ Statut affiché comme EXPIRED. `isExpired()` = true. Badge rouge. |
| MAND-08 | Filtre par onglets de statut | `[IHM-CRM]` | 1. Cliquer onglet "Actifs" | ✅ Seuls les mandats `status=ACTIVE`. |
| MAND-09 | Annuler un mandat | `[IHM-CRM]` `[BDD]` | 1. Mandat actif → "Annuler" + confirmer | ✅ `status='CANCELLED'` en BDD. |
| MAND-10 | Afficher jours restants | `[IHM-CRM]` | 1. Mandat avec endDate dans 45 jours | ✅ "45 jours restants" affiché. |

### 4.3 Modification

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| MAND-11 | Modifier le prix convenu | `[IHM-CRM]` `[BDD]` | 1. Changer `agreedPrice` | ✅ Nouvelle valeur persistée, `updated_at` mis à jour. |
| MAND-12 | Prolonger la durée | `[IHM-CRM]` `[BDD]` | 1. Modifier `endDate` → + 3 mois | ✅ Nouvelle date persistée. |

---

## 5. PIPELINE DES TRANSACTIONS

### 5.1 Création & Étapes

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| TRANS-01 | Créer une transaction (offre) | `[IHM-CRM]` `[BDD]` | 1. Transactions → "+ Nouvelle transaction" 2. Lier bien, mandat, acheteur (contact), vendeur, agent 3. offerPrice=280000, offerDate=aujourd'hui | ✅ Transaction créée. Statut=OFFER. BDD : toutes les FK et le prix d'offre renseignés. |
| TRANS-02 | Tableau Kanban — affichage | `[IHM-CRM]` | 1. Accéder à la vue transactions | ✅ Colonnes: OFFRE → ACCEPTÉE → COMPROMIS → FINANCEMENT → ACTE → TERMINÉE. Les transactions sont dans la bonne colonne. |
| TRANS-03 | Passage OFFER → ACCEPTED | `[IHM-CRM]` `[BDD]` | 1. Glisser la carte vers "Acceptée" ou cliquer "Avancer" | ✅ `status='ACCEPTED'`, `acceptance_date` renseignée. |
| TRANS-04 | Passage ACCEPTED → COMPROMIS | `[IHM-CRM]` `[BDD]` | 1. Avancer vers "Compromis" | ✅ `status='COMPROMIS'`, `compromis_date` renseignée. Le bien passe automatiquement à `status='COMPROMIS'`. |
| TRANS-05 | Saisie condition suspensive prêt | `[IHM-CRM]` `[BDD]` | 1. Remplir `loanCondition=true`, `loanAmount=200000`, `loanDurationMonths=240`, `loanRate=3.5` | ✅ Informations prêt persistées. |
| TRANS-06 | Passage COMPROMIS → FINANCING | `[IHM-CRM]` `[BDD]` | 1. Avancer vers "Financement" | ✅ `status='FINANCING'` |
| TRANS-07 | Passage FINANCING → ACTE | `[IHM-CRM]` `[BDD]` | 1. Avancer vers "Acte" + saisir `acteDate` | ✅ `status='ACTE'`, `acte_date` renseignée. |
| TRANS-08 | Passage ACTE → COMPLETED | `[IHM-CRM]` `[BDD]` | 1. Avancer vers "Terminée" | ✅ `status='COMPLETED'`. `completion_date` renseignée. Le bien passe à `status='SOLD'` (ou RENTED selon transaction). |
| TRANS-09 | Annuler une transaction | `[IHM-CRM]` `[BDD]` | 1. Transaction en cours → "Annuler" | ✅ `status='CANCELLED'`. Bien repasse à `status='AVAILABLE'`. |
| TRANS-10 | Étapes (TransactionStep) | `[IHM-CRM]` `[BDD]` | 1. Dans une transaction, cocher l'étape "Compromis signé" | ✅ `completed=true`, `completed_date=maintenant` en BDD pour cette `transaction_step`. |
| TRANS-11 | Saisie notaires | `[IHM-CRM]` `[BDD]` | 1. Remplir `notaryBuyer`, `notarySeller`, `notaryOffice` | ✅ Champs persistés. |
| TRANS-12 | Prix de vente = prix convenu mandat | `[IHM-CRM]` | 1. Vérifier que `agreedPrice` de la transaction correspond | ✅ Cohérence entre le prix du mandat et le prix de vente. |

---

## 6. AGENDA & RENDEZ-VOUS

### 6.1 Création

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| AGND-01 | Créer une visite | `[IHM-CRM]` `[BDD]` | 1. Agenda → "+ Nouveau RDV" 2. Type=VISIT, titre, date/heure début 10h00, fin 11h00, lier bien IMB00001, contact | ✅ RDV créé. Statut=PLANNED. BDD : `start_at`, `end_at`, toutes FK renseignées. |
| AGND-02 | Créer une réunion interne | `[IHM-CRM]` | 1. Type=MEETING, sans bien ni contact | ✅ RDV créé sans FK optionnelles. |
| AGND-03 | Créer un RDV de signature | `[IHM-CRM]` | 1. Type=SIGNING, lier transaction | ✅ RDV de type SIGNING créé. |
| AGND-04 | RDV dans le passé | `[IHM-CRM]` | 1. `startAt` = hier | ✅ RDV créé (pour historique). Statut peut être auto-passé à DONE. |
| AGND-05 | Champs requis manquants | `[IHM-CRM]` | 1. Ne pas remplir `startAt` | ❌ Validation formulaire. |
| AGND-06 | Heure fin < heure début | `[IHM-CRM]` | 1. fin=09h00, début=10h00 | ❌ Erreur de validation "La fin doit être après le début". |

### 6.2 Vues Calendrier

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| AGND-07 | Vue mensuelle | `[IHM-CRM]` | 1. Sélectionner vue "Mois" | ✅ Calendrier mensuel affiché, RDV positionnés aux bons jours. |
| AGND-08 | Vue hebdomadaire | `[IHM-CRM]` | 1. Sélectionner vue "Semaine" | ✅ 7 colonnes, RDV affichés avec horaires. |
| AGND-09 | Vue liste | `[IHM-CRM]` | 1. Sélectionner vue "Liste" | ✅ RDV triés chronologiquement. |
| AGND-10 | Navigation entre mois/semaines | `[IHM-CRM]` | 1. Cliquer "Suivant" et "Précédent" | ✅ Changement de période, RDV mis à jour. |

### 6.3 Modification & Statuts

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| AGND-11 | Confirmer un RDV | `[IHM-CRM]` `[BDD]` | 1. RDV → "Confirmer" | ✅ `status='CONFIRMED'`, `confirmed=true` en BDD. |
| AGND-12 | Marquer comme effectué | `[IHM-CRM]` `[BDD]` | 1. RDV → "Marquer fait" | ✅ `status='DONE'` |
| AGND-13 | Annuler un RDV | `[IHM-CRM]` `[BDD]` | 1. RDV → "Annuler" | ✅ `status='CANCELLED'` |
| AGND-14 | Modifier date/heure | `[IHM-CRM]` `[BDD]` | 1. Déplacer le RDV à une autre heure | ✅ `start_at` et `end_at` mis à jour. |
| AGND-15 | Supprimer un RDV | `[IHM-CRM]` `[BDD]` | 1. Supprimer + confirmer | ✅ Ligne supprimée de `appointments`. |

---

## 7. TABLEAU DE BORD & REPORTING

### 7.1 Dashboard

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| DASH-01 | Chargement du dashboard | `[IHM-CRM]` | 1. Accéder à `/dashboard` | ✅ Page chargée en < 2 sec. Tous les widgets présents. |
| DASH-02 | Compteur biens disponibles | `[IHM-CRM]` `[BDD]` | 1. Vérifier le compteur | ✅ = `SELECT COUNT(*) FROM properties WHERE status='AVAILABLE'` |
| DASH-03 | Compteur biens publiés | `[IHM-CRM]` `[BDD]` | 1. Vérifier le compteur | ✅ = `SELECT COUNT(*) FROM properties WHERE published_website=true` |
| DASH-04 | Compteur contacts | `[IHM-CRM]` `[BDD]` | 1. Vérifier le total contacts | ✅ = `SELECT COUNT(*) FROM contacts` |
| DASH-05 | Compteur mandats actifs | `[IHM-CRM]` `[BDD]` | 1. Vérifier | ✅ = `SELECT COUNT(*) FROM mandates WHERE status='ACTIVE'` |
| DASH-06 | Compteur transactions en cours | `[IHM-CRM]` `[BDD]` | 1. Vérifier | ✅ = `SELECT COUNT(*) FROM transactions WHERE status NOT IN ('COMPLETED','CANCELLED')` |
| DASH-07 | RDV du jour | `[IHM-CRM]` | 1. Vérifier la section "RDV aujourd'hui" | ✅ Liste des rendez-vous de la journée courante. |
| DASH-08 | Mandats expirant bientôt | `[IHM-CRM]` | 1. Créer 3 mandats expirant dans < 30 jours | ✅ Ces 3 mandats apparaissent dans le widget d'alerte. |
| DASH-09 | Derniers biens ajoutés | `[IHM-CRM]` | 1. Vérifier la liste | ✅ Les 5 (ou N) derniers biens créés, triés par `created_at DESC`. |
| DASH-10 | Actualisation données | `[IHM-CRM]` | 1. Créer un bien, revenir au dashboard | ✅ Compteur "Biens" incrémenté. |

### 7.2 Reporting

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| REP-01 | Accéder au reporting | `[IHM-CRM]` | 1. Menu → Reporting | ✅ Page chargée avec graphiques. |
| REP-02 | Répartition par type de bien | `[IHM-CRM]` `[BDD]` | 1. Graphique camembert types | ✅ Correspondance avec `SELECT property_type, COUNT(*) FROM properties GROUP BY property_type` |
| REP-03 | Répartition vente/location | `[IHM-CRM]` `[BDD]` | 1. Graphique transaction types | ✅ Correspondance `GROUP BY transaction_type` |
| REP-04 | Biens par statut | `[IHM-CRM]` `[BDD]` | 1. Graphique statuts | ✅ Correspondance `GROUP BY status` |
| REP-05 | Vues par bien (top 10) | `[IHM-CRM]` `[BDD]` | 1. Tableau top biens vus | ✅ `SELECT reference, view_count FROM properties ORDER BY view_count DESC LIMIT 10` |
| REP-06 | Performance par agent | `[IHM-CRM]` `[BDD]` | 1. Tableau agents | ✅ Nombre de biens, transactions par agent. |

---

## 8. SITE PUBLIC — ANNONCES

### 8.1 Page d'Accueil

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| WEB-01 | Chargement page d'accueil | `[IHM-WEB]` | 1. Accéder à `/` | ✅ Hero section, barre de recherche, biens en vedette chargés. |
| WEB-02 | Biens en vedette — seulement publiés | `[IHM-WEB]` `[BDD]` | 1. Vérifier les biens affichés | ✅ Seuls les biens `published_website=true` et `status=AVAILABLE`. |
| WEB-03 | Barre de recherche rapide | `[IHM-WEB]` | 1. Taper "Toulouse" + "Vente" + cliquer Rechercher | ✅ Redirection vers `/search?transactionType=SALE&keyword=Toulouse` avec résultats. |

### 8.2 Recherche Publique

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| WEB-04 | Recherche sans filtre | `[IHM-WEB]` `[API]` | 1. `GET /public/properties` | ✅ Seuls les biens `published_website=true`. Pas d'accès aux biens dépubliés. |
| WEB-05 | Filtre vente/location | `[IHM-WEB]` | 1. Sélectionner "Vente" | ✅ Seuls `transactionType=SALE` |
| WEB-06 | Filtre type de bien | `[IHM-WEB]` | 1. Sélectionner "Maison" | ✅ Seuls `propertyType=HOUSE` |
| WEB-07 | Filtre ville | `[IHM-WEB]` | 1. Saisir "Toulouse" | ✅ Seuls les biens en ville "Toulouse" |
| WEB-08 | Filtre budget | `[IHM-WEB]` | 1. Min=200000 Max=400000 | ✅ Biens dans la fourchette |
| WEB-09 | Filtre surface | `[IHM-WEB]` | 1. Surface min=50m² | ✅ `living_area >= 50` |
| WEB-10 | Filtre pièces | `[IHM-WEB]` | 1. 3 pièces min | ✅ `rooms >= 3` |
| WEB-11 | Filtre équipements | `[IHM-WEB]` | 1. Cocher "Parking", "Jardin" | ✅ Seuls les biens avec parking=true AND garden=true |
| WEB-12 | Filtres combinés | `[IHM-WEB]` | 1. SALE + HOUSE + Toulouse + 3 pièces + jardin | ✅ Intersection correcte |
| WEB-13 | Vue grille | `[IHM-WEB]` | 1. Cliquer vue grille | ✅ Cartes biens en colonnes |
| WEB-14 | Vue liste | `[IHM-WEB]` | 1. Cliquer vue liste | ✅ Biens en lignes horizontales avec plus d'infos |
| WEB-15 | Vue carte (map) | `[IHM-WEB]` | 1. Cliquer vue carte | ✅ Carte géographique avec marqueurs aux coordonnées des biens. |
| WEB-16 | Tri par prix | `[IHM-WEB]` | 1. Tri "Prix croissant" | ✅ Biens triés par price ASC |
| WEB-17 | Tri par surface | `[IHM-WEB]` | 1. Tri "Surface" | ✅ Biens triés par living_area DESC |
| WEB-18 | Pagination | `[IHM-WEB]` | 1. Naviguer entre les pages | ✅ 12 biens par page, boutons fonctionnels |
| WEB-19 | Aucun résultat | `[IHM-WEB]` | 1. Recherche avec critères très restrictifs | ✅ Message "Aucun bien ne correspond à votre recherche" affiché. |
| WEB-20 | Bien non publié n'apparaît pas | `[IHM-WEB]` `[BDD]` | 1. Créer un bien non publié en CRM, chercher sur le site | ✅ Le bien N'apparaît PAS dans les résultats publics. |
| WEB-21 | Adresse masquée | `[IHM-WEB]` `[BDD]` | 1. Bien avec `addressVisible=false` | ✅ Sur le site, seule la ville/CP affichés, pas l'adresse exacte. |

### 8.3 Détail d'une Annonce

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| WEB-22 | Chargement page détail | `[IHM-WEB]` | 1. Cliquer sur une annonce | ✅ Page chargée : galerie photos, infos principales, description, caractéristiques, DPE, agent, carte, formulaire contact. |
| WEB-23 | Galerie photos — navigation | `[IHM-WEB]` | 1. Cliquer sur les flèches de la galerie | ✅ Navigation entre photos. Photo en position 0 affichée en premier. |
| WEB-24 | Compteur de vues incrémenté | `[IHM-WEB]` `[BDD]` | 1. Visiter la page détail | ✅ `view_count + 1` en BDD (via `GET /public/properties/{id}`) |
| WEB-25 | Affichage DPE | `[IHM-WEB]` | 1. Bien avec dpeClass=C, gesClass=D | ✅ Badges DPE et GES colorés, valeurs affichées (kWh/m²/an). |
| WEB-26 | DPE exempté | `[IHM-WEB]` | 1. Bien avec `dpeExempt=true` | ✅ Mention "Dispensé de DPE" à la place des badges. |
| WEB-27 | Visite virtuelle | `[IHM-WEB]` | 1. Bien avec `virtualTourUrl` renseigné | ✅ Bouton "Visite virtuelle 360°" présent et fonctionnel. |
| WEB-28 | Coordonnées agent | `[IHM-WEB]` | 1. Bien avec agent assigné | ✅ Nom, photo, téléphone et email agent affichés. |
| WEB-29 | Lien téléphone agent | `[IHM-WEB]` | 1. Cliquer le numéro de téléphone | ✅ Lien `tel:` correct (espaces retirés du numéro). |
| WEB-30 | Biens similaires | `[IHM-WEB]` | 1. Bas de page détail | ✅ 3 biens similaires (même type/ville/transaction) affichés. |
| WEB-31 | Formulaire de contact — envoi valide | `[IHM-WEB]` `[BDD]` | 1. Remplir nom, email, message 2. Cliquer "Envoyer" | ✅ Message de confirmation affiché. Un contact/interaction créé en BDD ou email envoyé. `contact_count + 1` sur le bien. |
| WEB-32 | Formulaire de contact — email invalide | `[IHM-WEB]` | 1. Saisir email malformé | ❌ Validation formulaire Angular. |
| WEB-33 | Formulaire de contact — champs vides | `[IHM-WEB]` | 1. Envoyer sans remplir | ❌ Validation formulaire. |
| WEB-34 | Partage social | `[IHM-WEB]` | 1. Vérifier les boutons de partage | ✅ Boutons partage Facebook, Twitter, copie de lien fonctionnels. |
| WEB-35 | Référence visible | `[IHM-WEB]` | 1. Vérifier que la référence `IMB000XX` est affichée | ✅ Référence visible dans le détail. |

### 8.4 Estimateur & Simulateur

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| WEB-36 | Accéder à l'outil estimation | `[IHM-WEB]` | 1. Naviguer vers `/estimation` | ✅ Formulaire d'estimation chargé. |
| WEB-37 | Estimation — saisie données | `[IHM-WEB]` | 1. Saisir type=HOUSE, surface=100, ville=Toulouse, état=BON | ✅ Résultat d'estimation affiché. |
| WEB-38 | Simulateur prêt | `[IHM-WEB]` | 1. Naviguer vers `/simulateur-pret` 2. Montant=200000, durée=240 mois, taux=3.5% | ✅ Mensualité calculée correctement. Formule : M = P × [r(1+r)^n] / [(1+r)^n - 1] |
| WEB-39 | Simulateur — changer taux | `[IHM-WEB]` | 1. Modifier le taux | ✅ Mensualité recalculée en temps réel. |

---

## 9. SITE PUBLIC — PAGES STATIQUES

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| PAGE-01 | Page "Notre agence" | `[IHM-WEB]` | 1. Cliquer sur "L'agence" dans la navigation | ✅ Page avec présentation, équipe agents, valeurs, partenaires chargée. |
| PAGE-02 | Photos équipe — overlay téléphone | `[IHM-WEB]` | 1. Survoler la photo d'un agent | ✅ Overlay avec téléphone et email cliquables. |
| PAGE-03 | Page "Contact" | `[IHM-WEB]` | 1. Naviguer vers `/contact` | ✅ Formulaire de contact, adresse agence, téléphone, email, carte Google Maps. |
| PAGE-04 | Formulaire contact agence — envoi | `[IHM-WEB]` | 1. Remplir et envoyer | ✅ Message de confirmation. |
| PAGE-05 | Header — navigation | `[IHM-WEB]` | 1. Vérifier tous les liens du header | ✅ Tous les liens fonctionnels : Accueil, Annonces, L'agence, Contact, Estimation. |
| PAGE-06 | Footer — liens | `[IHM-WEB]` | 1. Vérifier les liens du footer | ✅ Mentions légales, politique de confidentialité, CGU, liens réseaux sociaux. |
| PAGE-07 | Responsive mobile | `[IHM-WEB]` | 1. Réduire la fenêtre à 375px ou tester sur mobile | ✅ Menu hamburger, cartes empilées, textes lisibles, formulaires utilisables. |
| PAGE-08 | Responsive tablette | `[IHM-WEB]` | 1. Tester à 768px | ✅ Mise en page adaptée. |
| PAGE-09 | Navigation — retour arrière | `[IHM-WEB]` | 1. Aller sur un détail → appuyer "Retour" | ✅ Retour à la liste avec les filtres conservés. |

---

## 10. INTÉGRITÉ BASE DE DONNÉES

### 10.1 Contraintes & Unicité

```sql
-- PROP-BDD-01 : Unicité référence bien
SELECT reference, COUNT(*) FROM properties GROUP BY reference HAVING COUNT(*) > 1;
-- Résultat attendu : 0 lignes

-- PROP-BDD-02 : Unicité numéro de mandat
SELECT mandate_number, COUNT(*) FROM mandates GROUP BY mandate_number HAVING COUNT(*) > 1;
-- Résultat attendu : 0 lignes

-- PROP-BDD-03 : Unicité email utilisateur
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
-- Résultat attendu : 0 lignes

-- PROP-BDD-04 : Relation OneToOne SearchCriteria
SELECT contact_id, COUNT(*) FROM search_criteria GROUP BY contact_id HAVING COUNT(*) > 1;
-- Résultat attendu : 0 lignes
```

### 10.2 Intégrité Référentielle

```sql
-- PROP-BDD-05 : Orphelins property_photos (toute photo doit avoir un bien)
SELECT * FROM property_photos WHERE property_id NOT IN (SELECT id FROM properties);
-- Résultat attendu : 0 lignes

-- PROP-BDD-06 : Mandats sans bien existant
SELECT * FROM mandates WHERE property_id NOT IN (SELECT id FROM properties);
-- Résultat attendu : 0 lignes

-- PROP-BDD-07 : Transactions sans bien existant
SELECT * FROM transactions WHERE property_id NOT IN (SELECT id FROM properties);
-- Résultat attendu : 0 lignes

-- PROP-BDD-08 : Appointments sans agent existant
SELECT * FROM appointments WHERE agent_id NOT IN (SELECT id FROM users);
-- Résultat attendu : 0 lignes

-- PROP-BDD-09 : TransactionSteps sans transaction existante
SELECT * FROM transaction_steps WHERE transaction_id NOT IN (SELECT id FROM transactions);
-- Résultat attendu : 0 lignes

-- PROP-BDD-10 : ContactInteractions sans contact existant
SELECT * FROM contact_interactions WHERE contact_id NOT IN (SELECT id FROM contacts);
-- Résultat attendu : 0 lignes
```

### 10.3 Valeurs Métier

```sql
-- PROP-BDD-11 : Aucun bien avec prix nul ou négatif
SELECT * FROM properties WHERE price IS NULL OR price <= 0;
-- Résultat attendu : 0 lignes

-- PROP-BDD-12 : Photos ordonnées correctement (position commence à 0)
SELECT p.reference, ph.position
FROM property_photos ph
JOIN properties p ON ph.property_id = p.id
WHERE ph.position < 0;
-- Résultat attendu : 0 lignes

-- PROP-BDD-13 : Biens publiés ont tous published_at renseigné
SELECT * FROM properties WHERE published_website = true AND published_at IS NULL;
-- Résultat attendu : 0 lignes

-- PROP-BDD-14 : Mandat expiré détecté
SELECT mandate_number, end_date, status FROM mandates WHERE end_date < CURRENT_DATE AND status = 'ACTIVE';
-- Résultat attendu : 0 lignes (si le job de vérification tourne)

-- PROP-BDD-15 : Transactions avec buyer = seller (impossibilité métier)
SELECT * FROM transactions WHERE buyer_id = seller_id;
-- Résultat attendu : 0 lignes

-- PROP-BDD-16 : Timestamps created_at jamais nuls
SELECT COUNT(*) FROM properties WHERE created_at IS NULL;
SELECT COUNT(*) FROM contacts WHERE created_at IS NULL;
SELECT COUNT(*) FROM mandates WHERE created_at IS NULL;
SELECT COUNT(*) FROM transactions WHERE created_at IS NULL;
-- Résultat attendu : 0 pour chaque requête

-- PROP-BDD-17 : Utilisateurs avec mot de passe haché (format BCrypt)
SELECT * FROM users WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%';
-- Résultat attendu : 0 lignes (tous les mots de passe doivent être BCrypt)

-- PROP-BDD-18 : Référence bien au bon format
SELECT * FROM properties WHERE reference NOT LIKE 'IMB%';
-- Résultat attendu : 0 lignes

-- PROP-BDD-19 : Cascade suppression photos
-- 1. Insérer un bien avec 2 photos. Noter les IDs. 2. Supprimer le bien.
SELECT COUNT(*) FROM property_photos WHERE property_id = '<id-supprimé>';
-- Résultat attendu : 0 (cascade supprimé)

-- PROP-BDD-20 : view_count jamais négatif
SELECT * FROM properties WHERE view_count < 0;
-- Résultat attendu : 0 lignes
```

### 10.4 Audit & Traçabilité

```sql
-- PROP-BDD-21 : updated_at > created_at après modification
SELECT * FROM properties WHERE updated_at < created_at;
-- Résultat attendu : 0 lignes

-- PROP-BDD-22 : lastLoginAt mis à jour à la connexion
-- Avant connexion : noter la valeur de last_login_at.
-- Après connexion : vérifier que la valeur a changé.
SELECT last_login_at FROM users WHERE email = 'admin@imoblex.fr';
```

---

## 11. SÉCURITÉ & AUTORISATIONS PAR RÔLE

### 11.1 Matrix des Droits IHM

| Fonctionnalité | ADMIN | MANAGER | AGENT | ASSISTANT |
|----------------|:-----:|:-------:|:-----:|:---------:|
| Voir tous les biens | ✅ | ✅ | ✅ | ✅ |
| Créer un bien | ✅ | ✅ | ✅ | ❌ |
| Modifier un bien | ✅ | ✅ | ✅ | ❌ |
| Supprimer un bien | ✅ | ✅ | ❌ | ❌ |
| Publier un bien | ✅ | ✅ | ✅ | ❌ |
| Gérer les contacts | ✅ | ✅ | ✅ | ✅ |
| Gérer les mandats | ✅ | ✅ | ✅ | ❌ |
| Gérer les transactions | ✅ | ✅ | ✅ | ❌ |
| Accéder au reporting | ✅ | ✅ | ✅ | ❌ |
| Gérer les utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Voir tous les agents | ✅ | ✅ | ❌ | ❌ |

### 11.2 Tests API par Rôle

| # | Scénario | Type | Étapes | Résultat attendu |
|---|----------|------|--------|-----------------|
| SEC-01 | AGENT ne peut pas supprimer un bien | `[API]` | Token AGENT + `DELETE /properties/{id}` | ❌ HTTP 403 Forbidden |
| SEC-02 | AGENT peut créer un bien | `[API]` | Token AGENT + `POST /properties` (body valide) | ✅ HTTP 201 Created |
| SEC-03 | ADMIN peut supprimer | `[API]` | Token ADMIN + `DELETE /properties/{id}` | ✅ HTTP 204 No Content |
| SEC-04 | Sans token — endpoint protégé | `[API]` | `POST /properties` sans Authorization | ❌ HTTP 401 Unauthorized |
| SEC-05 | Injection dans les champs | `[IHM-CRM]` `[API]` | 1. Saisir `<script>alert(1)</script>` dans la description | ✅ Texte stocké tel quel (pas exécuté), affiché encodé sur le site public (XSS impossible). |
| SEC-06 | Injection SQL | `[API]` | `?city=Toulouse' OR '1'='1` | ✅ Requête traitée avec paramètre bindé JPA. Aucune injection. |
| SEC-07 | CORS — origine non autorisée | `[API]` | Requête cross-origin depuis `http://evil.com` | ❌ Réponse sans en-tête CORS, bloquée par le navigateur. |
| SEC-08 | Mot de passe en clair dans les réponses | `[API]` | `GET /users/{id}` (si endpoint existe) | ✅ Le champ `password` n'apparaît JAMAIS dans les réponses JSON. |
| SEC-09 | CSRF — pas nécessaire (stateless) | `[API]` | Vérifier que les requêtes sans CSRF token sont acceptées | ✅ JWT + stateless = pas de CSRF. |
| SEC-10 | Rate limiting (si configuré) | `[API]` | Envoyer 100 requêtes en 1 sec | ✅ HTTP 429 Too Many Requests après le seuil. |

---

## 12. TESTS TRANSVERSAUX & CAS LIMITES

### 12.1 Performance

| # | Scénario | Type | Résultat attendu |
|---|----------|------|-----------------|
| PERF-01 | Chargement liste biens (100 biens) | `[IHM-CRM]` `[API]` | ✅ < 500ms pour la requête paginée |
| PERF-02 | Chargement page détail avec 10 photos | `[IHM-WEB]` | ✅ < 2s avec lazy loading des images |
| PERF-03 | Recherche avec tous les filtres actifs | `[API]` | ✅ < 300ms (index BDD sur `city`, `status`, `transaction_type`, `price`) |
| PERF-04 | Cache Redis — 2ème appel `GET /properties/{id}` | `[API]` | ✅ Latence divisée (réponse depuis le cache) |

### 12.2 Données Limites

| # | Scénario | Type | Résultat attendu |
|---|----------|------|-----------------|
| LIM-01 | Description 5000 caractères exactement | `[API]` | ✅ Accepté |
| LIM-02 | Description 5001 caractères | `[API]` | ❌ HTTP 400 ou troncature |
| LIM-03 | Prix = 0 | `[API]` | ❌ HTTP 400 (contrainte `@Positive`) |
| LIM-04 | Prix = 99999999.99 (grand nombre) | `[API]` | ✅ Accepté (precision=12, scale=2) |
| LIM-05 | UUID inexistant | `[API]` | ❌ HTTP 404 |
| LIM-06 | UUID malformé | `[API]` | ❌ HTTP 400 Bad Request |
| LIM-07 | Pagination — page négative | `[API]` | ❌ HTTP 400 |
| LIM-08 | Pagination — size=0 | `[API]` | ❌ HTTP 400 |
| LIM-09 | Recherche — keyword vide | `[API]` | ✅ Retourne tous les biens (filtre ignoré) |

### 12.3 Scénarios Métier Complets (End-to-End)

| # | Scénario | Flux complet |
|---|----------|-------------|
| E2E-01 | **Vente complète** | 1. Créer un bien [CRM] → 2. Signer un mandat exclusif [CRM] → 3. Publier sur le site [CRM] → 4. Prospect remplit formulaire contact [WEB] → 5. Contact créé en BDD [BDD] → 6. RDV visite planifié [CRM] → 7. Transaction créée (offre) [CRM] → 8. Avancer jusqu'à COMPLETED [CRM] → 9. Bien passe à SOLD [BDD] → 10. Bien dépublié du site [WEB] |
| E2E-02 | **Location** | 1. Créer bien RENT [CRM] → 2. Mandat simple [CRM] → 3. Publication [CRM] → 4. Locataire contacte via site [WEB] → 5. Contact ajouté [BDD] → 6. Visite [CRM Agenda] → 7. Transaction COMPLETED → 8. Bien passe à RENTED [BDD] |
| E2E-03 | **Agent gère son portefeuille** | 1. AGENT se connecte [CRM] → 2. Consulte ses biens assignés [CRM] → 3. Ajoute un nouveau bien [CRM] → 4. Ajoute des photos [CRM] → 5. Publie sur le site [CRM] → 6. Vérifie les stats de vues depuis le dashboard [CRM] |
| E2E-04 | **Renouvellement mandat** | 1. Mandat expire dans 15 jours → alerte dashboard [CRM] → 2. Agent contacte le mandant (interaction NOTE) [CRM] → 3. Modifier la date de fin du mandat [CRM] → 4. Alerte disparaît [CRM] |
| E2E-05 | **Matching acheteur** | 1. Contact BUYER avec SearchCriteria : SALE, APARTMENT, Toulouse, 200-350k, 3 pièces, alertActive=true [CRM] → 2. Créer un bien correspondant [CRM] → 3. Publier [CRM] → 4. Alert doit être déclenchée (email ou log) |

---

## CHECKLIST DE RECETTE FINALE

Avant livraison, valider l'ensemble des points suivants :

### Fonctionnel Back-Office (CRM)
- [ ] Connexion / déconnexion pour chaque rôle
- [ ] CRUD complet : Biens, Contacts, Mandats, Transactions, Agenda
- [ ] Recherche et filtres sur chaque module
- [ ] Tableau de bord avec chiffres corrects
- [ ] Reporting avec graphiques
- [ ] Publication/dépublication des biens
- [ ] Pipeline transaction — tous les statuts

### Fonctionnel Site Public
- [ ] Affichage seulement des biens publiés
- [ ] Recherche avec tous les filtres
- [ ] Détail annonce complet (photos, DPE, agent, formulaire)
- [ ] Formulaire de contact fonctionnel
- [ ] Simulateur prêt
- [ ] Toutes les pages statiques

### Base de Données
- [ ] Contraintes d'unicité respectées
- [ ] Intégrité référentielle (FK)
- [ ] Cascades de suppression
- [ ] Aucun mot de passe en clair
- [ ] Timestamps renseignés

### Sécurité
- [ ] JWT requis sur tous les endpoints privés
- [ ] Droits ADMIN/MANAGER/AGENT/ASSISTANT corrects
- [ ] Endpoints publics accessibles sans token
- [ ] Pas de fuite de données sensibles dans les réponses

### Cross-Cutting
- [ ] Responsive mobile/tablette sur le site public
- [ ] Messages d'erreur explicites
- [ ] Pas de données de test en production
- [ ] Logs applicatifs sans données personnelles

---

*Document généré pour le projet Imoblex — Agence immobilière*
*Stack : Spring Boot 3 · PostgreSQL · Redis · Angular 18 · Tailwind CSS*
