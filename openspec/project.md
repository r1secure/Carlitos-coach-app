# Project Context

## Purpose
Carlitos v3 est une application de coaching tennis intelligente qui combine vision par ordinateur, machine learning et IA générative pour offrir un accompagnement personnalisé aux joueurs de tous niveaux.

### Objectifs Principaux

1/ Analyse vidéo Biomécanique : Analyser les gestes techniques des joueurs via upload de vidéos et détection de pose (MediaPipe) pour visualiser les défauts et opportunités d'amélioration

2/ Analyse coach virtuel : Analyser les gestes techniques des joueurs via upload de vidéos par un (LLM prompté ou fine-tuné) détection de pose (MediaPipe) pour identifier les qualités et les défauts puis proposer des recommandations d'entraînement.

3/ Recommandations d'Entraînement : Proposer des drills et exercices ciblés basés sur le profil du joueur (améliorations technique et physique identifiée)

4/ Coaching Holistique : Fournir des programmes d'entraînement physique et mental personnalisés via LLM fine-tuné

5/ Chat IA : Fournir un chat IA pour discuter des joueurs et des entraînements

6/ Suivi de Progression : Tracker l'évolution des métriques techniques et physiques dans le temps

7/ Base de Connaissances : Stocker des drills, exercices, tips ciblés pour chaque type d'entraînement (technique, physique, mental et tactique)

### Proposition de Valeur

1/ Démocratiser l'accès à un coaching tennis de qualité

2/ Fournir un feedback objectif et quantifié basé sur des analyses biomécaniques et des recommandations d'entraînement

3/ Offrir une expérience d'entraînement personnalisée

4/ Accélérer la progression des joueurs par des recommandations data-driven

### Utilisateurs Cibles

1/ Primaire : Joueurs amateurs (niveau intermédiaire) cherchant à améliorer leur tennis (technique, physique, mental et tactique)

2/ Secondaire : Entraîneurs professionnels souhaitant des outils d'analyse et de recommandations pour leurs élèves

### User Roles & Spaces

#### Rôles Utilisateurs

- **Player (Joueur)** : Utilisateur principal qui upload ses vidéos, reçoit des analyses et suit sa progression
- **Coach (Entraîneur)** : Utilisateur avancé qui peut gérer plusieurs joueurs, annoter leurs vidéos, et créer des programmes personnalisés
- **Admin** : Gestion de la plateforme, utilisateurs, et contenu de la base de connaissances

#### Espace Joueur (Player Space)

**Fonctionnalités principales** :
- Upload et gestion de ses propres vidéos
- Visualisation des analyses biomécaniques personnelles
- Accès au chat IA pour questions et conseils
- Suivi de sa progression (graphiques, métriques temporelles)
- Bibliothèque de drills recommandés basés sur son profil
- Programme d'entraînement personnalisé (technique, physique, mental)
- Historique des sessions et analyses

**Restrictions** :
- Ne peut voir que ses propres données
- Accès en lecture seule aux drills de la bibliothèque
- Pas d'accès aux données d'autres joueurs

#### Espace Coach (Coach Space)

**Fonctionnalités principales** :
- Dashboard multi-joueurs avec vue d'ensemble
- Gestion de plusieurs profils joueurs (ses élèves)
- Upload de vidéos pour ses élèves
- Annotations avancées sur les vidéos (texte, dessins, timestamps)
- Création et personnalisation de drills
- Création de programmes d'entraînement pour ses élèves
- Comparaison de joueurs (métriques, progression)
- Export de rapports d'analyse (PDF, CSV)
- Accès au chat IA en mode "Coach" pour conseils pédagogiques

**Permissions** :
- Accès complet aux données de ses élèves assignés
- Création/modification de drills dans la bibliothèque
- Invitation de nouveaux joueurs (lien d'invitation)
- Gestion des programmes d'entraînement de ses élèves

**Restrictions** :
- Ne peut voir que les joueurs qui lui sont assignés
- Pas d'accès aux données d'autres coachs

#### Gestion des Relations Coach-Joueur

- **Assignment** : Un joueur peut être assigné à un coach (relation 1-to-many)
- **Invitation** : Le coach peut inviter des joueurs via email/lien
- **Autonomie** : Un joueur peut utiliser l'app sans coach (mode autonome)
- **Transition** : Un joueur autonome peut rejoindre un coach ultérieurement
- **Permissions** : Le joueur doit accepter le partage de données avec un coach


## Tech Stack

### Frontend

- **Framework** : Next.js 14+ (App Router) avec TypeScript

- **UI Library** : shadcn/ui + Tailwind CSS + Radix UI

- **Design System** : Composants modernes avec :

- Dark mode support

- Animations fluides (Framer Motion)

- Responsive design mobile-first

- Accessibility (WCAG 2.1 AA)

- **State Management** :

- Zustand pour état global (user, app settings)

- TanStack Query pour cache serveur et synchronisation

- Context API pour thème et i18n

- **Visualisation** :

- Three.js + React Three Fiber (skeleton 3D)

- Recharts (graphiques temporels, statistiques)

- D3.js (visualisations avancées optionnelles)

- Plotly.js (graphing interactif des points de pose)

- **Video** :

- Video.js (lecture, annotations)

- Uppy.io (upload avec preview et progression)

- React Player (lecture multi-sources)

- **Forms & Validation** : React Hook Form + Zod

- **Rich Text** : TipTap ou Draft.js (annotations coach)

- **Notifications** : React Hot Toast + Service Workers (push)

### Backend

- **Framework** : FastAPI (Python 3.11+)

- **Database** :

- PostgreSQL 15+ avec extensions :

- pgvector (embeddings)

- pg_trgm (full-text search)

- Alembic (migrations)

- SQLAlchemy 2.0 (ORM)

- **Storage** :

- MinIO (S3-compatible, Docker local et production)

- **Cache & Queue** :

- Redis (cache, sessions, rate limiting)

- Celery + Redis (traitement async vidéos)

- Bull (alternative Node.js si nécessaire)

- **Authentication** :

- OAuth 2.0 / OpenID Connect
avec tinyauth : https://github.com/steveiliop56/tinyauth


- Authlib (OIDC client Python)

- Google OAuth 2.0 (provider principal)

- JWT avec python-jose (access/refresh tokens)

- RBAC (Role-Based Access Control)

- **API** :

- OpenAPI 3.0 (auto-généré FastAPI)

- WebSockets (notifications temps réel)

- GraphQL (optionnel pour queries complexes)

### Machine Learning & AI

- **Pose Detection** :

- MediaPipe Pose (Python)

- MediaPipe Holistic (optionnel, mains)

- **ML Framework** :

- PyTorch 2.0+ (modèles customs)

- scikit-learn (preprocessing, classification)

- NumPy, Pandas (manipulation données)

- **Video Processing** :

- OpenCV (cv2) - traitement frames

- FFmpeg - transcoding, compression, extraction

- Pillow (manipulation images)

- **LLM & RAG** :

- LiteLLM (abstraction multi-providers)

- LangChain (orchestration RAG)

- Gemini 3 pro (fallback/comparaison)

- **Embeddings & Vector DB** :

- PostgreSQL pgvector (stockage embeddings)

- nomic-embed-text:latest (embeddings) via ollama

- FAISS (recherche similarité locale)

- **Web Scraping & Extraction** :

- BeautifulSoup4 (parsing HTML)

- Playwright (navigation web, JS rendering)

- youtube-dl / yt-dlp (téléchargement YouTube)

- instaloader (téléchargement Instagram)

- requests / httpx (requêtes HTTP)

### Infrastructure & DevOps

- **Containerization** :

- Docker Compose (dev local)

- Dockerfile multi-stage (optimisation)

- **Services Locaux** :

- PostgreSQL + pgvector

- Ollama

- Redis

- MinIO

- Backend API (FastAPI)

- Celery Workers (2-4 instances)

- Frontend (Next.js dev server)

- **Hosting** (Production) :

- Reverse proxy: traefik + letsencrypt

- Frontend: Next.js dans Docker (port 2000)

- Backend: FastAPI dans Docker (port 8000)

- Database: PostgreSQL + pgvector dans Docker (port 5432)

- Storage: MinIO self-hosted dans Docker (ports 9000/9001)

- Cache/Queue: Redis dans Docker (port 6379)

- Workers: Celery workers dans Docker (multiple instances)

## Project Conventions

### Code Style
- **Python**: Follow PEP 8, use type hints, async/await for I/O operations

- **JavaScript/React**: ESLint configuration, functional components with hooks

- **Naming**: kebab-case for files, camelCase for JS variables, snake_case for Python

- **Language**: French for UI text and user-facing content

### Architecture Patterns

#### Frontend Architecture

Keep it simple, clean and readable.

##### **Patterns Utilisés pour frontend**

- **Component Composition** : Petits composants réutilisables et composables

- **Custom Hooks** : Logique métier extraite (useVideoUpload, useAnalysis, usePoseTracking)

- **Server Components** : Par défaut, Client Components explicites avec 'use client'

- **API Routes** : Uniquement pour proxying/webhooks, pas de logique métier

- **Service Layer** : Abstraction complète des appels API backend

- **Type Safety** : TypeScript strict, types partagés avec backend via schemas

- **Error Boundaries** : Gestion d'erreurs gracieuse par domaine

- **Lazy Loading** : Code splitting pour optimiser les performances

#### Backend Architecture

Keep it simple, clean and readable.

##### **Patterns Utilisés pour backend**

- **Layered Architecture** : Router → Service → Repository → Model

- **Dependency Injection** : FastAPI Depends() pour DB, auth, services

- **Repository Pattern** : Abstraction accès données avec méthodes génériques

- **Service Layer** : Logique métier isolée, testable unitairement

- **Task Queue** : Celery pour traitements longs et asynchrones

- **Error Handling** :

- Custom exceptions par domaine

- Middleware centralisé pour logging

- Responses standardisées (success, error)

- **CQRS Light** : Séparation reads/writes pour analyses complexes

- **Event-Driven** : Événements pour notifications (vidéo terminée, nouveau commentaire)

#### Database Schema Design

**Principes**:

- Normalisation 3NF minimum

- JSONB pour données semi-structurées (analyses)

- Indexes sur foreign keys et colonnes fréquemment queryées

- Timestamps (created_at, updated_at) sur toutes tables

- Soft deletes (deleted_at) pour données utilisateur

- Row Level Security (RLS) activé via Supabase

### Testing Strategy
[Explain your testing approach and requirements]

### Git Workflow
[Describe your branching strategy and commit conventions]

## Domain Context

### Tennis Biomechanics

#### Gestes Techniques Analysés

1.**Service**

- Phases : préparation, armé, frappe, accompagnement

- Métriques clés : angle épaule (180°±10°), rotation tronc (90°±15°), extension genou

2.**Coup Droit**

- Unités/semi-ouvert/ouvert stance

- Métriques : transfer poids, rotation hanches, accélération raquette

3.**Revers (1 ou 2 mains)**

- Plan de frappe, finish haut/bas

- Métriques : alignement épaules, extension bras (1 main)

4.**Volée**

- Split-step timing, bloc vs punch

5.**Smash**

- Similaire service, accent sur coordination

#### Landmarks MediaPipe Pertinents

- 33 landmarks, focus sur:

NOSE = 0

LEFT_SHOULDER = 11

RIGHT_SHOULDER = 12

LEFT_ELBOW = 13

RIGHT_ELBOW = 14

LEFT_WRIST = 15

RIGHT_WRIST = 16

LEFT_HIP = 23

RIGHT_HIP = 24

LEFT_KNEE = 25

RIGHT_KNEE = 26

LEFT_ANKLE = 27

RIGHT_ANKLE = 28

- Chaîne cinétique service (exemple):

Cheville → Genou → Hanche → Épaule → Coude → Poignet


### Tennis Coaching Terminology

#### Niveaux de Jeu (Classification française FFT)

- **Débutant** : Découverte, échanges courts

- **Niveau 1-2** : Échanges réguliers, début tactique

- **Niveau 3-4** : Compétition départementale/régionale

- **Niveau 5+** : Haut niveau, national

#### Types d'Entraînement

- **Drills techniques** : Répétition gestes (panier, lance-balles)

- **Situations de jeu** : Patterns tactiques (fond de court, montée au filet)

- **Matchs d'entraînement** : Application conditions réelles

- **Préparation physique** : Cardio, musculation, mobilité

- **Mental** : Gestion stress, routines, visualisation

#### Méthodologie Coaching

- **Feedback positif** : Souligner les réussites avant corrections

- **Cue technique** : Max 1-2 consignes simultanées

- **Progressivité** : Augmenter difficulté graduellement

- **Individualisation** : Adapter au profil (âge, physique, objectifs)



### Machine Learning Specifics

#### Video Processing Pipeline

```python

1. Upload & Validation

- Formats acceptés: MP4, MOV, AVI

- Max size: 100MB (compressé si nécessaire)

- Min resolution: 720p

- Frame rate: 30-60 fps optimal

  

2. Preprocessing

- Extraction keyframes (ffmpeg)

- Normalisation dimensions (1280x720)

- Détection orientation (rotation si nécessaire)

  

3. Inference

- MediaPipe Pose frame-by-frame

- Confidence threshold: 0.6 minimum

- Temporal smoothing (Kalman filter sur landmarks)

  

4. Post-processing

- Calcul métriques agrégées

- Détection phases mouvement (DTW)

- Comparaison avec modèles référence

  

5. Storage

- Raw landmarks: JSONB PostgreSQL

- Processed metrics: Tables relationnelles

- Original video: S3 (7 jours), puis archive ou delete

```

#### LLM Coaching Context

S'appuie sur le contexte de coaching de tennis avec des données biomécaniques et des vidéos.
à partir d'un LLM prompté pour être un coach de tennis. Prompt défini dans le fichier [CartlitosCoachPrompt.md](file:///Users/leloupp/Documents/Code/PERSO/Carlitos-coach-app/CartlitosCoachPrompt.md) à la racine du projet.

---

### UI/UX Constraints (IHM Moderne)

#### Design Principles

- **Design System Cohérent** :

- Palette de couleurs harmonieuse (primaire, secondaire, accents)

- Typographie lisible et hiérarchisée (3 niveaux max)

- Espacement consistant (système 4px/8px)

- Composants réutilisables avec variants

- **Clarté et Simplicité** :

- Maximum 3 actions principales par écran

- Navigation intuitive (max 3 clics pour toute action)

- Hiérarchie visuelle claire (taille, contraste, espacement)

- Éviter la surcharge cognitive

- **Feedback Visuel** :

- États interactifs clairs (hover, active, disabled, loading)

- Animations significatives (pas décoratives)

- Notifications contextuelles (success, error, warning, info)

- Indicateurs de progression pour actions longues

#### Layout et Navigation

##### **Structure Globale**

- **Sidebar Collapsible** : Navigation principale persistante

- **Top Bar** : Profil utilisateur, notifications, recherche

- **Content Area** : Zone principale avec scroll vertical

- **Breadcrumbs** : Fil d'Ariane pour navigation profonde

##### **Responsive Breakpoints**

```css

- Mobile: < 640px (menu hamburger, stack vertical)

- Tablet: 640px - 1024px (sidebar réduite, grilles 2 colonnes)

- Desktop: > 1024px (sidebar complète, grilles 3-4 colonnes)

- Large: > 1440px (colonnes latérales optionnelles)

```

#### Composants Clés Modernes

##### **Dashboard**

- **Cards avec statistiques** : Métriques principales en évidence

- **Graphiques interactifs** : Tooltips, zoom, export

- **Timeline d'activité** : Événements récents chronologiques

- **Quick actions** : Boutons d'action flottants (FAB)

##### **Upload Vidéo**

- **Drag & Drop Zone** : Zone de dépôt visuelle avec preview

- **Progress Bar** : Progression détaillée (upload + traitement)

- **Thumbnail Preview** : Aperçu immédiat de la vidéo

- **Cancel Action** : Possibilité d'annuler l'upload

##### **Visualisation Analyse**

- **Video Player Enrichi** :

- Contrôles avancés (vitesse, frame-by-frame)

- Timeline avec marqueurs de phases

- Overlay skeleton activable/désactivable

- Comparaison split-screen (avant/après)

- **Graphiques Temporels** :

- Graphiques interactifs (Plotly/Recharts)

- Zoom et pan sur axes

- Multi-sélection de métriques

- Export PNG/CSV

- Annotations et commentaires inline

##### **Chat IA**

- **Interface Conversationnelle** :

- Messages bubbles différenciés (user/assistant)

- Typing indicator animé

- Support markdown dans réponses

- Code syntax highlighting

- **Mode Selector** :

- Chips/Pills visuels pour 5 modes

- Icônes distinctives par mode

- Couleurs thématiques par mode

- Description hover des modes

##### **Bibliothèque**

- **Card Grid Layout** : Grille responsive de drills

- **Filtres Avancés** : Sidebar avec filtres multiples

- **Search Bar** : Recherche avec suggestions

- **Preview Modale** : Modale pour détails drill avec vidéo

#### Dark Mode

- **Support Complet** :

- Toggle dans user settings

- Palette de couleurs adaptée (contraste suffisant)

- Images/icônes adaptées au thème

- Préférence système respectée par défaut

- Transition douce entre thèmes

#### Micro-interactions

- **Animations Subtiles** :

- Hover effects (scale, color shift)

- Loading skeletons (pas de spinners seuls)

- Success animations (checkmark, confetti léger)

- Transitions de page fluides (fade, slide)

- Drag & drop feedback visuel

#### Accessibilité (A11y)

- **Keyboard Navigation** : Toutes les actions accessibles au clavier

- **Focus Indicators** : Indicateurs visuels clairs

- **ARIA Labels** : Attributs appropriés pour screen readers

- **Contraste Couleurs** : Ratio minimum 4.5:1 (texte normal)

- **Alt Text** : Descriptions pour toutes les images

- **Skip Links** : Lien pour sauter la navigation

#### Performance UI

## Important Constraints

### Technical Constraints

#### Performance

- **Video processing** : < 60 secondes pour 30 secondes de vidéo

- **Page load** : < 2 secondes (First Contentful Paint)

- **API response** : < 500ms (endpoints non-ML)

- **Real-time analysis** : 15 fps minimum pour feedback live (future feature)

#### Scalability

- **Concurrent users** : Support 2-3 utilisateurs simultanés (phase MVP)

- **Storage** : 1GB/utilisateur maximum (quota vidéos)

- **Database** : Indexes sur queries fréquentes, connection pooling

- **Celery workers** : 2-4 workers pour processing vidéo (auto-scale futur)

#### Compatibility

- **Browsers** : Chrome/Edge 90+, Firefox 88+, Safari 14+ (desktop)

- **Mobile** : Responsive design, support upload mobile

- **Video codecs** : H.264 (baseline profile) pour compatibilité maximale[List any technical, business, or regulatory constraints]

## External Dependencies

### Development Dependencies

#### FFmpeg (Video Processing)

- **Purpose** : Extraction frames, transcoding, compression

- **Version** : 5.1+

- **Installation** : Système (apt/brew), Dockerized en production

- **Common operations** :

```bash

# Extract frames at 30fps

ffmpeg -i input.mp4 -vf fps=30 frames/frame_%04d.jpg

# Compress video

ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast output.mp4

```

#### MediaPipe (Pose Detection)

- **Purpose** : Détection des landmarks pour l'analyse biomécanique

- **Version** : 0.10.9+ (Python)

- **Model** : pose_landmarker_heavy.task (accuracy maximale)

- **Fallback** : pose_landmarker_lite.task si contraintes ressources

- **Licensing** : Apache 2.0

- **Documentation** : <https://developers.google.com/mediapipe>[Document key external services, APIs, or systems]

#### LiteLLM

- **Purpose** : Gestion des appels API LLM

- **Documentation** : <https://docs.litellm.ai/docs/>


#### LLM Gemini Pro

- **Purpose** : Appel API LLM Gemini Pro pour le coaching (video analysis, chat, etc.)
