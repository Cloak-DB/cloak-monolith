---
title: Premiers Pas
description: Démarrez avec Cloak DB en quelques minutes
order: 1
---

# Premiers Pas

Cloak DB est un studio PostgreSQL conçu pour les développeurs. Parcourez vos données, exécutez des requêtes et modifiez des lignes — le tout depuis une interface optimisée pour le clavier.

## Installation

Cloak DB s'exécute comme un conteneur Docker. Assurez-vous que [Docker](https://docker.com) est installé et en cours d'exécution.

```bash
npx @cloak-app/app
```

Cela va :
1. Télécharger la dernière image Cloak DB
2. Démarrer le studio sur le port 3000
3. Ouvrir votre navigateur automatiquement

**Options :**
- `--port 3001` — Utiliser un port différent
- `--tag 0.2.4` — Utiliser une version spécifique

## Connexion à Votre Base de Données

1. Cliquez sur **Ajouter une connexion** sur l'écran d'accueil
2. Entrez votre chaîne de connexion PostgreSQL :
   ```
   postgresql://user:password@localhost:5432/mydb
   ```
3. Donnez-lui un nom (ex. "Dev Local")
4. Cliquez sur **Tester la connexion** pour vérifier
5. Cliquez sur **Enregistrer**

Vos connexions sont stockées localement dans `~/.config/cloak-db/config.json`.

## Navigation dans le Studio

Une fois connecté, vous verrez :

- **Barre latérale gauche** — Vos schémas et tables
- **Zone principale** — Navigateur de données ou éditeur de requêtes
- **Onglets** — Ouvrez plusieurs tables simultanément

### Actions Rapides

| Action | Raccourci |
|--------|-----------|
| Rechercher des tables | `Cmd+E` |
| Nouvel onglet requête | `Cmd+J` |
| Fermer l'onglet | `W` |
| Enregistrer les modifications | `Cmd+S` |
| Afficher tous les raccourcis | `?` |

## Parcourir les Données

Cliquez sur n'importe quelle table pour voir ses données. Vous pouvez :

- **Trier** — Cliquez sur les en-têtes de colonnes
- **Filtrer** — Utilisez la barre de filtre avec des opérateurs comme `=`, `>`, `contient`
- **Rechercher** — Recherche floue dans la page actuelle
- **Paginer** — Naviguez dans les grandes tables (25-1000 lignes par page)

## Modifier les Données

Cloak DB suit vos modifications avant de les enregistrer :

1. **Cliquez sur une cellule** pour éditer en ligne
2. **L'indicateur jaune** montre les modifications en attente
3. **Cmd+S** pour enregistrer toutes les modifications
4. **Annuler** pour revenir en arrière

Vous pouvez aussi :
- **Ajouter des lignes** avec `Cmd+N`
- **Supprimer des lignes** en sélectionnant et appuyant sur `Suppr`
- **Multi-sélectionner des cellules** avec `Cmd+Clic`

## Exécuter des Requêtes

Ouvrez un onglet requête avec `Cmd+J` et écrivez du SQL :

```sql
SELECT * FROM users WHERE created_at > '2024-01-01';
```

Appuyez sur `Cmd+Entrée` pour exécuter. Les résultats sont limités à 500 lignes.

**Sécurité :** Les opérations dangereuses comme `DROP DATABASE` sont bloquées.

## Prochaines Étapes

- [Raccourcis Clavier](/docs/keyboard-shortcuts) — Référence complète des raccourcis
- [Fonctionnalités du Studio](/docs/studio-features) — Détails du navigateur de données
- [Connexions SSL](/docs/ssl-connections) — Connexions sécurisées à la base de données

## Feuille de Route

Nous travaillons activement sur :
- **Time Machine** — Sauvegardez et restaurez les états de la base de données
- **Inspecteur de Ressources** — Visualisez les relations
- **Anonymisation** — Masquez les données personnelles pour des tests sécurisés

Suivez notre progression sur [GitHub](https://github.com/Cloak-DB/cloak-monolith).
