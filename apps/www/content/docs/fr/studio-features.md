---
title: Fonctionnalités du Studio
description: Plongée dans les capacités du studio Cloak DB
order: 3
---

# Fonctionnalités du Studio

Cloak DB n'est pas qu'une simple interface de base de données. Il est construit autour des workflows que les développeurs utilisent vraiment.

## Édition Multi-Cellules

Sélectionnez plusieurs cellules et modifiez-les toutes en une seule fois.

**Comment ça marche :**
1. `Cmd+Clic` sur les cellules pour les sélectionner (elles se surlignent en jaune)
2. Tapez votre nouvelle valeur
3. Appuyez sur `Entrée` — toutes les cellules sélectionnées se mettent à jour simultanément
4. `Cmd+S` pour enregistrer toutes les modifications

**Cas d'usage :**
- Mettre à jour 50 statuts d'utilisateurs de "en attente" à "actif"
- Définir tous les prix d'une catégorie à la même valeur
- Effacer plusieurs champs en une fois

## Système de Modifications en Attente

Chaque édition est locale jusqu'à ce que vous l'enregistriez explicitement. Pas de modifications de données accidentelles.

**Indicateurs visuels :**
- La barre jaune indique le nombre de modifications en attente
- Le point jaune sur l'onglet indique des données non enregistrées
- Le compteur de modifications affiche les lignes affectées

**Actions :**
- `Cmd+S` — Enregistrer toutes les modifications en attente
- Bouton "Annuler" — Tout annuler
- Annulation individuelle par ligne via le menu contextuel

**Pourquoi c'est important :**
- Révisez les modifications avant de les valider
- Regroupez plusieurs éditions en une seule sauvegarde
- Pas de crainte de modifications accidentelles

## Éditeurs de Cellules Adaptés au Type

Le bon éditeur pour chaque type de données :

| Type | Éditeur |
|------|---------|
| **Booléen** | Interrupteur à bascule (pas besoin de taper "true/false") |
| **JSON** | Éditeur extensible avec coloration syntaxique |
| **Texte** | Éditeur en ligne avec détection multiligne |
| **Nombres** | Validation qui détecte les erreurs de frappe |
| **Timestamps** | Affichage formaté |
| **NULL** | Indicateur clair, basculement NULL facile |

**Bouton d'expansion :** Pour les textes longs ou le JSON, cliquez sur l'icône d'expansion pour ouvrir une modale d'édition complète.

## Palette de Commandes Intelligente

`Cmd+E` ouvre la recherche instantanée de tables.

**Fonctionnalités :**
- Recherche floue avec l'algorithme de Damerau-Levenshtein
- Gère les fautes de frappe avec élégance
- Affiche le nombre de lignes pour le contexte
- Recherche dans les noms de schémas et de tables

**Exemple :** Taper "usrs" trouve quand même la table "users".

## Préservation de l'État dans l'URL

L'état de votre vue est sauvegardé dans l'URL :
- Numéro de page actuel
- Colonne et direction de tri
- Filtres actifs
- Table sélectionnée

**Avantages :**
- Partagez des vues exactes avec vos coéquipiers
- Les boutons précédent/suivant du navigateur fonctionnent naturellement
- Marquez des vues de données spécifiques en favoris

## Filtrage Avancé

Filtrez par n'importe quelle colonne avec des opérateurs adaptés au type :

**Colonnes texte :**
- `=` / `≠` — Correspondance exacte
- `contient` — Correspondance partielle
- `est vide` / `est défini`

**Colonnes numériques :**
- `=` / `≠` / `>` / `≥` / `<` / `≤`
- `est vide` / `est défini`

**Colonnes booléennes :**
- `= vrai` / `= faux`
- `est vide` / `est défini`

Les filtres multiples se combinent avec la logique ET.

## Navigation par Clés Étrangères

Les clés étrangères sont des liens cliquables.

**Dans le navigateur de données :**
- Les colonnes FK s'affichent comme des liens cliquables
- Cliquez pour naviguer vers la ligne référencée
- Un indicateur visuel montre la relation

**Dans l'onglet structure :**
- Visualisation complète des relations
- Affiche la table et la colonne référencées
- Informations sur les index incluses

## Menus Contextuels

Clic droit n'importe où pour des actions contextuelles :

**Sur les cellules :**
- Copier la valeur
- Définir comme NULL
- Éditer dans une modale

**Sur les lignes :**
- Modifier les détails de la ligne
- Dupliquer la ligne
- Supprimer la ligne

**Sur les tables (barre latérale) :**
- Voir les données
- Voir la structure
- Copier le nom de la table

## Modale de Détail de Ligne

Double-cliquez sur une ligne ou utilisez le menu contextuel pour ouvrir l'édition complète de la ligne.

**Fonctionnalités :**
- Toutes les colonnes visibles en même temps
- Édition champ par champ
- Met en surbrillance le champ depuis lequel vous avez cliqué
- N'enregistre que les champs modifiés

## Système d'Onglets

Travaillez avec plusieurs tables simultanément.

**Fonctionnalités :**
- Ouvrez un nombre illimité d'onglets
- Indicateur visuel pour les modifications non enregistrées
- `W` pour fermer l'onglet actuel
- Clic molette pour fermer n'importe quel onglet
- Les onglets persistent pendant la session
