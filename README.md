# 🎨 Poster Editor App

[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-6.0.4-green)](https://www.djangoproject.com/)
[![Konva.js](https://img.shields.io/badge/Konva.js-10.2.3-red)](https://konvajs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-teal)](https://tailwindcss.com/)

Une application web moderne pour créer des affiches visuelles interactives. Éditez des posters avec un canvas intuitif, importez des images, stylisez du texte, et exportez en haute résolution.

## ✨ Fonctionnalités

### 🖼️ Éditeur Canvas Interactif
- **Canvas Konva.js** avec drag & drop, redimensionnement, rotation
- **Gestion de calques** (z-index, visibilité, verrouillage)
- **Outils de dessin** : texte, images, formes géométriques
- **Transformateur visuel** pour manipulation précise

### 🎨 Personnalisation Avancée
- **Import d'images** locales et fonds personnalisés
- **Stylisation de texte** : polices, couleurs, ombres, alignement
- **Fonds personnalisables** : couleurs, dégradés, images
- **Propriétés en temps réel** : opacité, rotation, dimensions

### 💾 Gestion de Projets
- **Sauvegarde automatique** et manuelle (Ctrl+S)
- **Chargement de projets** existants
- **Thumbnails automatiques** pour prévisualisation
- **Historique undo/redo** complet

### 📤 Export Professionnel
- **Export PNG** haute résolution (jusqu'à 4x pixel ratio)
- **Export PDF** avec formats prédéfinis (A4, A3, Letter) ou dimensions custom
- **Qualité optimisée** pour impression

### 🎯 Templates Prédéfinis
- **5 templates spécialisés** pour événements Yu-Gi-Oh et tournois
- **Catégories** : Événements, Tournois, Annonces, Générique
- **Canvas_data JSON** réutilisable

### 🎪 Expérience Utilisateur
- **Interface moderne** avec Tailwind CSS et shadcn/ui
- **Mode sombre** automatique
- **Raccourcis clavier** (Ctrl+Z, Ctrl+S, Delete, etc.)
- **Animations fluides** et feedback visuel
- **Responsive design** pour tous les écrans

## 🛠️ Stack Technique

### Frontend
- **Next.js 16.2.2** - Framework React avec App Router
- **React 19.2.4** - Bibliothèque UI avec hooks modernes
- **Konva.js 10.2.3** - Manipulation canvas 2D
- **TypeScript 5.0** - Typage statique
- **Tailwind CSS 4.0** - Framework CSS utilitaire
- **Zustand** - State management léger
- **shadcn/ui** - Composants UI accessibles

### Backend
- **Django 6.0.4** - Framework web Python
- **Django REST Framework** - API REST
- **SQLite** - Base de données
- **Pillow** - Traitement d'images
- **CORS headers** - Gestion cross-origin

### Outils de Développement
- **Turbopack** - Compilation ultra-rapide Next.js
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatage de code
- **Python-dotenv** - Gestion des variables d'environnement

## 🚀 Installation & Configuration

### Prérequis
- **Node.js** >= 18.0.0
- **Python** >= 3.10
- **Git**

### 1. Clonage du Repository
```bash
git clone https://github.com/Kazuyoshi-06/poster-editor.git
cd poster-editor-app
```

### 2. Configuration Backend (Django)
```bash
# Création de l'environnement virtuel
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installation des dépendances
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs
```

### 3. Configuration Frontend (Next.js)
```bash
# Installation des dépendances
cd ../frontend
npm install

# Variables d'environnement
cp .env.local.example .env.local
# Éditez .env.local si nécessaire
```

### 4. Initialisation de la Base de Données
```bash
# Depuis le dossier backend
python manage.py migrate
python manage.py load_templates  # Charge les 5 templates prédéfinis
```

### 5. Démarrage des Serveurs
```bash
# Terminal 1: Backend Django
cd backend
python manage.py runserver

# Terminal 2: Frontend Next.js
cd frontend
npm run dev
```

### 6. Accès à l'Application
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000/api
- **Admin Django** : http://localhost:8000/admin

## 📖 Utilisation

### Création d'un Nouveau Poster
1. **Accès** : Cliquez sur "Nouveau projet" depuis la page d'accueil
2. **Configuration** : Choisissez les dimensions du canvas (794x1123 par défaut)
3. **Édition** : Utilisez la barre d'outils pour ajouter des éléments

### Outils Disponibles
- **Sélecteur** : Sélection et manipulation d'objets
- **Texte** : Ajout de texte stylisable
- **Image** : Import d'images depuis votre ordinateur
- **Rectangle** : Formes géométriques
- **Fond** : Modification de l'arrière-plan

### Gestion des Calques
- **Panneau latéral droit** : Contrôle visibilité et verrouillage
- **Réorganisation** : Drag & drop pour changer l'ordre Z
- **Propriétés** : Édition des attributs de l'objet sélectionné

### Export
- **PNG** : Export haute résolution pour le web
- **PDF** : Format optimisé pour l'impression
- **Options** : Choix du format et de la qualité

## 🔌 API REST

### Endpoints Principaux

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/` | Liste des projets |
| `POST` | `/api/projects/` | Création de projet |
| `GET` | `/api/projects/:id/` | Détails d'un projet |
| `PUT` | `/api/projects/:id/` | Mise à jour de projet |
| `DELETE` | `/api/projects/:id/` | Suppression de projet |
| `POST` | `/api/projects/:id/thumbnail/` | Génération de thumbnail |
| `GET` | `/api/templates/` | Liste des templates |
| `GET` | `/api/assets/` | Liste des assets uploadés |
| `POST` | `/api/assets/` | Upload d'asset |

### Format des Données

#### Structure Canvas (JSON)
```json
{
  "version": "1.0",
  "stage": { "width": 794, "height": 1123 },
  "background": { "type": "color", "value": "#1a1a2e" },
  "layers": [
    {
      "id": "layer-content",
      "name": "Contenu",
      "locked": false,
      "visible": true,
      "objects": [
        {
          "id": "text-001",
          "type": "text",
          "text": "Titre",
          "x": 100, "y": 80,
          "fontSize": 48,
          "fill": "#FFD700"
        }
      ]
    }
  ]
}
```

## 📁 Structure du Projet

```
poster-editor-app/
├── backend/                          # API Django
│   ├── config/                       # Configuration Django
│   ├── projects/                     # App projets & templates
│   ├── uploads/                      # App gestion assets
│   ├── media/                        # Fichiers uploadés
│   └── db.sqlite3                    # Base de données
├── frontend/                         # Application Next.js
│   ├── app/                          # Pages Next.js (App Router)
│   │   ├── editor/                   # Éditeur principal
│   │   └── components/               # Composants partagés
│   ├── store/                        # State management Zustand
│   ├── types/                        # Types TypeScript
│   └── lib/                          # Utilitaires
└── docs/                             # Documentation
```

## 🎮 Raccourcis Clavier

| Raccourci | Action |
|---|---|
| `Ctrl+Z` | Annuler la dernière action |
| `Ctrl+Y` | Rétablir l'action annulée |
| `Ctrl+S` | Sauvegarder le projet |
| `Delete` | Supprimer l'objet sélectionné |
| `Ctrl+C` | Copier l'objet sélectionné |
| `Ctrl+V` | Coller l'objet copié |
| `Ctrl+A` | Sélectionner tous les objets |
| `Échap` | Désélectionner |

## 🔧 Scripts Disponibles

### Backend
```bash
python manage.py runserver          # Démarrer le serveur de développement
python manage.py migrate            # Appliquer les migrations
python manage.py load_templates     # Charger les templates prédéfinis
python manage.py createsuperuser    # Créer un administrateur
```

### Frontend
```bash
npm run dev                         # Démarrage en développement
npm run build                       # Build de production
npm run start                       # Démarrage en production
npm run lint                        # Vérification ESLint
```

## 🤝 Contribution

### Processus de Contribution
1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez** une branche pour votre fonctionnalité
4. **Commit** vos changements
5. **Push** vers votre fork
6. **Créez** une Pull Request

### Standards de Code
- **TypeScript** strict activé
- **ESLint** et **Prettier** configurés
- **Tests** requis pour les nouvelles fonctionnalités
- **Documentation** à jour

### Types de Contributions
- 🐛 **Bug fixes**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Documentation**
- 🎨 **Améliorations UI/UX**
- 🧪 **Tests**

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Konva.js** pour le moteur de canvas
- **shadcn/ui** pour les composants UI
- **Tailwind CSS** pour le système de design
- **Django REST Framework** pour l'API
- **Next.js** pour le framework frontend

## 📞 Support

Pour toute question ou problème :
- 📧 **Email** : kazuyoshi.perso@gmail.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/Kazuyoshi-06/poster-editor/issues)
- 📖 **Documentation** : [Wiki](https://github.com/Kazuyoshi-06/poster-editor/wiki)

---

**© 2026 Kazuyoshi - Poster Editor App**</content>
<filePath">c:\Projects\poster_editor_app\poster_editor_app\README.md