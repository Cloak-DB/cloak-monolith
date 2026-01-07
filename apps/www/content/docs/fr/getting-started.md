---
title: Premiers Pas
description: Démarrez avec Cloak DB
order: 1
---

# Premiers Pas avec Cloak DB

## Qu'est-ce que Cloak DB?

Cloak DB est un **outil open-source, local d'abord** qui vous permet de restaurer des snapshots de bases de données de production vers votre environnement de développement—avec anonymisation, filtrage intelligent et scénarios de test réutilisables.

Travaillez avec des données réalistes localement. Aucune dépendance cloud. Aucun secret exposé.

## Le Problème que Nous Résolvons

Tester et développer avec des données réalistes est difficile :
- La saisie manuelle de données est fastidieuse et non réaliste
- Les dumps de production contiennent des informations sensibles
- Configurer des scénarios de test complexes prend trop de temps
- Les équipes QA peinent à reproduire des cas particuliers spécifiques
- Les démos nécessitent des états de données spécifiques difficiles à créer

## Comment Cloak DB Aide

### 1. Restaurer les Données de Production Localement
Connectez-vous à votre base de données de production et exportez les données vers votre environnement de développement avec filtrage intelligent :
- Restaurez seulement ce dont vous avez besoin (ex. "5 utilisateurs + toutes les données associées")
- Parcours automatique des clés étrangères pour assurer l'intégrité référentielle
- Inclusion explicite de tables pour un contrôle fin
- Support actuel de PostgreSQL (plus de bases de données à venir)

### 2. Anonymiser les Données Sensibles
Transformez les champs sensibles avant que les données n'atteignent votre machine locale :
- Définissez des règles d'anonymisation via configuration TypeScript
- Basé sur Faker pour des données factices réalistes
- Configuration auditable et compatible git
- Protège la confidentialité tout en maintenant le réalisme des données

### 3. Scénarios de Test Réutilisables
Sauvegardez et restaurez des scénarios de test spécifiques en un clic :
- Exemple : "Utilisateur avec 3 éléments en attente, un en retard"
- Parfait pour les workflows QA, démos et tests répétables
- Partageable en équipe via contrôle de version
- Aucun secret stocké dans votre dépôt

## Qui Devrait Utiliser Cloak DB?

- **Équipes QA** — Configurez des états de test complexes sans saisie manuelle
- **Développeurs** — Testez avec des données réalistes localement, détectez les cas limites tôt
- **Démo/Ventes** — Montrez des scénarios spécifiques aux parties prenantes en quelques secondes
- **Tests E2E** — Créez des suites de tests fiables avec des données réalistes

## Comment Ça Fonctionne

1. **Serveur Local** — S'exécute sur votre machine avec une interface web et une API
2. **Configuration** — Configurez les connexions aux bases de données et les règles d'anonymisation (compatible git, secrets injectés au runtime)
3. **Restauration** — Récupérez des données réalistes de production vers votre base de développement
4. **Création de Scénarios** — Sauvegardez des scénarios de test réutilisables
5. **Restauration en un Clic** — Restaurez n'importe quel scénario instantanément

## Architecture

Cloak DB s'exécute entièrement sur votre machine locale :
- Interface web pour gérer les connexions et scénarios
- Serveur API pour orchestrer les opérations de données
- Moteur d'introspection de base de données
- Pipeline d'anonymisation
- Système de gestion de scénarios

Toutes vos données restent locales. Vos secrets de production ne quittent jamais votre contrôle.

## Statut Actuel

Cloak DB est en **développement actif** avec un programme bêta disponible. Rejoignez la bêta pour obtenir un accès anticipé et aider à façonner le produit.

