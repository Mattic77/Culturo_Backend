# Rapport d'avancement — Application Mobile Culturo

## 1. Présentation du projet

Culturo est une application mobile de quiz culturel basant sur les pays développée avec **Flutter**. Ce rapport présente l'état d'avancement du développement mobile , les choix techniques effectués et les fonctionnalités implémentées.

---

## 2. Mise en place de l'environnement technique

### 2.1 Stack technologique

Avant tout développement fonctionnel, une architecture technique complète a été mise en place pour garantir la robustesse, la maintenabilité et la scalabilité du projet.

| Composant | Technologie | Rôle |
|-----------|------------|------|
| Framework | Flutter | Développement cross-platform (iOS / Android) |
| Langage | Dart 3+ | Fonctionnalités modernes : sealed classes, pattern matching, dot shorthands |
| State Management | flutter_bloc 9.1.1 | Gestion d'état via le pattern Cubit |
| Injection de dépendances | get_it 9.2.1 | Service locator centralisé |
| Client HTTP | dio 5.9.2 | Requêtes API avec intercepteurs |
| Stockage sécurisé | flutter_secure_storage 10.1.0 | Conservation chiffrée du token JWT |
| Stockage local | shared_preferences 2.5.5 | Préférences utilisateur |
| Responsive UI | flutter_screenutil 5.9.3 | Adaptation à toutes les tailles d'écran |
| Typographie | google_fonts 8.1.0 | Polices Inter, Instrument Serif, JetBrains Mono |

### 2.2 Architecture MVVM en couches

L'application suit l'architecture officielle Flutter **MVVM** avec séparation stricte des responsabilités :

```
UI Layer          →    Domain Layer (optionnel)    →    Data Layer
(View + Cubit)         (use cases)                      (repository + service)
```

Chaque fonctionnalité est organisée selon la structure suivante :

```
features/{feature}/
├── data/
│   ├── services/        ← appels API (Dio)
│   ├── dtos/            ← modèles JSON
│   └── repositories/    ← source de vérité unique
├── domain/              ← entités et contrats (optionnel)
└── ui/
    ├── cubit/           ← ViewModel : état + logique
    └── screens/         ← rendu pur, zéro logique métier
```

### 2.3 Injection de dépendances

Toutes les dépendances sont enregistrées dans `core/di/dependency_injection.dart` et résolues via **get_it** au démarrage de l'application, avant le lancement du widget tree :

```dart
// main_development.dart
await setupGetIt();
runApp(CulturoApp());
```

Stratégie d'enregistrement :
- **LazySingleton** pour les APIs et repositories — une seule instance partagée, créée à la première utilisation
- **Factory** pour les Cubits — nouvelle instance à chaque navigation, garantissant un état propre

### 2.4 Gestion centralisée des erreurs réseau

Un système de gestion d'erreurs typé a été mis en place via la classe scellée `ApiResult<T>` :

```dart
sealed class ApiResult<T> { ... }
class ApiSuccess<T> extends ApiResult<T> { final T data; }
class ApiFailure<T> extends ApiResult<T> { final ApiErrorModel error; }
```

Le `ApiErrorHandler` mappe chaque type d'erreur Dio vers un `ApiErrorModel` structuré, couvrant : `badRequest`, `unauthorized`, `notFound`, `internalServer`, `timeout`, `noInternet`, et d'autres. Aucune exception brute ne remonte jusqu'à l'interface.

### 2.5 Configuration du client HTTP (Dio)

Le `DioFactory` configure le client HTTP avec :
- **Base URL :** `https://culturo-backend.onrender.com/`
- **Timeout :** 30 secondes (connexion + réception)
- **Headers par défaut :** `Accept: application/json` + `Authorization: Bearer <token>`
- **Logging :** intercepteur `PrettyDioLogger` pour le débogage des échanges réseau
- **Injection de token :** méthode `setTokenIntoHeaderAfterLogin()` appelée après connexion réussie

### 2.6 Système de design (Design System)

Un design system complet a été codifié dans `lib/core/theming/` pour garantir la cohérence visuelle et faciliter les évolutions :

**Palette de couleurs — thème *Desert* (défaut) :**

| Token | Couleur | Usage |
|-------|---------|-------|
| `background` | `#F4ECDD` | Fond principal (beige chaud) |
| `surface` | `#FBFBEA` | Surfaces des cartes |
| `primary` | `#0E5C3A` | Vert émeraude — actions principales |
| `accent` | `#C8512B` | Terracotta — mise en valeur |
| `ink` | `#1F2A24` | Texte principal |
| `gold` | `#C9A24A` | Badges premium |

**Typographie — trois familles de polices :**

| Police | Famille | Usage |
|--------|---------|-------|
| **Inter** | Sans-serif | Corps de texte, boutons, labels |
| **Instrument Serif** | Serif italique | Titres, chiffres décoratifs |
| **JetBrains Mono** | Monospace | Statistiques, compteurs |

Plus de **60 styles typographiques prédéfinis** sont définis (taille, graisse, couleur) et importés directement dans les widgets — aucune valeur hardcodée dans l'interface.

**Responsive design :**
Toutes les dimensions sont exprimées avec `flutter_screenutil` sur une maquette de référence **375×812 px**, garantissant un rendu cohérent sur tous les appareils.

---

## 3. Fonctionnalités développées

### 3.1 Authentification

#### Sign Up (Inscription)

L'écran d'inscription guide l'utilisateur en deux étapes :

**Étape 1 — Formulaire de création de compte**

Saisie de l'adresse e-mail et du mot de passe avec validation en temps réel sur chaque champ.

**Étape 2 — Vérification de l'e-mail**

Un code OTP à 6 chiffres est envoyé à l'adresse fournie. L'utilisateur saisit ce code pour activer son compte. Un bouton *Renvoyer le code* est disponible en cas de non-réception.

---

#### Sign In (Connexion) — Intégration API complète

L'écran de connexion est entièrement connecté au backend. Voici la chaîne d'intégration complète, de l'interface jusqu'au serveur :

**Interface utilisateur :**
- Champ e-mail avec validation en temps réel (icône de confirmation affichée si le format est valide)
- Champ mot de passe avec toggle de visibilité
- Bouton **Se connecter** avec indicateur de chargement pendant la requête
- Boutons de connexion sociale (*Google*, *Apple*)
- Gestion des états d'erreur via snackbar

**Flux d'appel API :**

```
View (SignInScreen)
  → SignInCubit.signIn(email, password)
    → emit(SignInLoading)
    → SignInRepository.signIn()
      → SignInApi.signIn()           POST /auth/signin
      ← SiginInResponse(accessToken)
    → DioFactory.setTokenIntoHeaderAfterLogin(token)
    ← ApiSuccess → emit(SignInSuccess)
    ← ApiFailure → emit(SignInError(message))
```

**Détail de la requête API :**

| Propriété | Valeur |
|-----------|--------|
| Méthode | `POST` |
| Endpoint | `https://culturo-backend.onrender.com/auth/signin` |
| Content-Type | `application/json` |

Corps de la requête :
```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse"
}
```

Réponse en cas de succès :
```json
{
  "accessToken": "<jwt_token>"
}
```

**Gestion du token :**
Le JWT retourné est stocké de manière chiffrée via `flutter_secure_storage` (clé `userToken`) et injecté automatiquement dans les en-têtes HTTP de toutes les requêtes suivantes via le `DioFactory`.

**États Cubit gérés :**

| État | Déclencheur |
|------|------------|
| `SignInInitial` | Chargement de l'écran |
| `SignInLoading` | Soumission du formulaire |
| `SignInSuccess` | Réponse 200 du serveur |
| `SignInError(message)` | Erreur réseau ou credentials invalides |
| `CreateAccountState` | Tap sur le lien d'inscription |

---

### 3.2 Écran d'accueil (Home Screen)

L'écran d'accueil est le tableau de bord principal après connexion. Il s'articule autour de quatre composants distincts :

**En-tête utilisateur**
Avatar avec initiales, prénom et badge de série quotidienne (streak) avec icône de flamme.

**Carte Défi du Jour**
Carte mise en avant sur fond vert profond présentant la date du défi, un compte à rebours de remise à zéro, le nombre de questions et le nombre de participants. Accès direct au quiz en un tap.

**Rangée de statistiques**
Trois indicateurs alignés horizontalement :
- **Série** — jours consécutifs joués
- **Précision** — pourcentage de bonnes réponses
- **Classement** — rang de l'utilisateur dans sa ville

**Aperçu des catégories**
Liste verticale des catégories disponibles avec lien *Tout voir* vers l'écran dédié.

---

### 3.3 Écran des catégories

Présentation complète du catalogue de contenu en grille à deux colonnes. L'en-tête indique la progression de déblocage de l'utilisateur (ex. *2 / 8 débloquées*).

Chaque carte affiche l'icône colorée de la catégorie, son nom, un sous-titre descriptif, le nombre de questions disponibles et l'indicateur d'accès (libre ou premium).

**Catalogue actuel :**

| Catégorie | Questions | Accès |
|-----------|-----------|-------|
| Histoire | 248 | Libre |
| Darja | 312 | Libre |
| Wilayas | 198 | Premium |
| Football | 156 | Premium |
| Musique | 124 | Premium |
| Ramadan | 88 | Premium |
| Cuisine | 102 | Premium |
| Cinéma | 64 | Premium |

---

## 4. Respect de la maquette

L'ensemble des écrans développés a été réalisé en conformité avec les maquettes fournies. Les points de fidélité assurés :

- **Palette de couleurs** : les trois thèmes (*Desert*, *Patriotic*, *Midnight*) sont codifiés et appliqués de manière cohérente — aucune couleur hardcodée dans l'interface
- **Typographie** : utilisation exclusive des styles prédéfinis dans `core/theming/` (Inter, Instrument Serif, JetBrains Mono) avec les tailles, graisses et couleurs de la charte
- **Espacement et proportions** : toutes les dimensions sont définies en unités responsives via `flutter_screenutil` sur la base de la maquette de référence 375×812 px
- **Composants UI** : les icônes, cartes, boutons et badges correspondent visuellement aux écrans définis dans la maquette

---

## 5. Synthèse de l'avancement

| Composant | Statut |
|-----------|--------|
| Setup architecture MVVM | Terminé |
| Système de design (thème, typo, couleurs) | Terminé |
| Injection de dépendances (get_it) | Terminé |
| Client HTTP + gestion erreurs (Dio + ApiResult) | Terminé |
| Stockage sécurisé du token | Terminé |
| Routage applicatif | Terminé |
| Sign In — intégration API complète | Terminé |
| Sign Up — écrans UI | Terminé |
| Sign Up — intégration API | En cours |
| Home Screen | Terminé (données mock) |
| Écran Catégories | Terminé (données mock) |
| Connexion API (Home + Catégories) | À venir |

---

## 6. Développement Backend

Le backend de Culturo a été conçu pour être le moteur de l'expérience de jeu, gérant la logique métier, la sécurité et la progression des utilisateurs.

### 6.1 Architecture et Socle Technique

| Composant | Technologie | Rôle |
|-----------|------------|------|
| Framework | NestJS 11 | Architecture modulaire et scalable |
| Langage | TypeScript 5 | Typage statique et sécurité du code |
| ORM | Prisma | Gestion fluide de la base de données PostgreSQL |
| Base de données | PostgreSQL (Supabase) | Stockage relationnel robuste |
| Documentation | Swagger / Open API | Spécification et test des endpoints (/api/docs) |
| Sécurité | bcrypt & JWT | Hachage des mots de passe et authentification |

### 6.2 Modules Core Implémentés

- **Authentification & Sécurité** :
    - Système d'inscription avec **vérification OTP** par e-mail.
    - Gestion des sessions via **JWT (JSON Web Tokens)**.
    - Protection des routes via des **Guards NestJS**.

- **Gestion des Données Culturelles** :
    - Importation et synchronisation automatique de **250 pays** via l'API REST Countries.
    - Organisation du contenu par catégories (Histoire, Science, Géographie, Sports, Art).
    - Système d'injection de questions massives par script de seeding.

- **Moteur de Jeu Offline (Sécurisé)** :
    - Passage d'un modèle "Full Fetch" à un modèle **"Stateful Session"**.
    - **Validation Serveur** : les réponses sont vérifiées sur le backend question par question.
    - **Protection Anti-Triche** : les réponses correctes sont systématiquement supprimées des objets Quiz avant envoi au mobile.

- **Système de Progression & Rangs** :
    - **UserLevel** : Gestion de l'XP et des niveaux (Level 1 à 3).
    - **Logique d'XP** : Gain de points pondéré par la difficulté (Easy: 5, Medium: 10, Hard: 20).
    - **Ranking Système** : Hiérarchie compétitive de **Silver III** jusqu'à **Diamond I** (13 divisions) avec seuils de points automatisés.
    - **Déblocage Progressif** : Le mode "Battle" est restreint jusqu'à l'obtention de 1000 XP.

---

## 7. Synthèse de l'avancement Global

### 7.1 Application Mobile (Flutter)

| Composant | Statut |
|-----------|--------|
| Setup architecture MVVM | Terminé |
| Système de design | Terminé |
| Sign In / Sign Up UI | Terminé |
| Intégration API Auth | Terminé |
| Home & Catégories UI | Terminé |

### 7.2 Backend (NestJS)

| Composant | Statut |
|-----------|--------|
| Architecture & DB Setup | Terminé |
| Module Authentification (OTP/JWT) | Terminé |
| Module Pays & Catégories | Terminé |
| Moteur de Jeu (Sessions sécurisées) | Terminé |
| Système XP & Rangs | Terminé |
| Module Battle (Temps réel) | En cours |
