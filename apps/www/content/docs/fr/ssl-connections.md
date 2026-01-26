---
title: Connexions SSL
description: Configurer les connexions SSL/TLS vers votre base de donnees PostgreSQL dans Cloak DB
order: 4
---

# Connexions SSL

Cloak DB prend en charge les connexions chiffrees SSL/TLS vers votre base de donnees PostgreSQL. Cette page explique comment configurer SSL dans Cloak DB et ce qui se passe avec vos parametres.

## Demarrage Rapide

Pour la plupart des bases de donnees cloud :

1. Activez le bouton **SSL** dans le formulaire de connexion
2. Selectionnez le mode **Require**
3. Connectez-vous

## Modes SSL

Cloak DB prend en charge quatre modes SSL, correspondant au parametre `sslmode` de PostgreSQL :

| Mode | Description |
|------|-------------|
| **Disable** | Pas de chiffrement SSL |
| **Require** | Chiffrement SSL, sans verification de certificat |
| **Verify CA** | Chiffrement SSL avec verification du certificat CA |
| **Verify Full** | Chiffrement SSL avec verification CA et du nom d'hote |

Le niveau de securite dont vous avez besoin depend de votre environnement et de vos exigences.

## Comment Cloak DB Gere SSL

Lorsque vous configurez SSL dans le formulaire de connexion :

1. **Chaine de connexion** - Cloak DB ajoute le parametre `sslmode` a votre chaine de connexion
2. **Certificats** - Si fournis, les certificats sont transmis au pilote PostgreSQL
3. **Stockage** - Les parametres SSL sont sauvegardes avec votre connexion dans `~/.config/cloak-db/config.json`

Cloak DB ne modifie ni ne transmet jamais vos certificats ailleurs - ils sont utilises uniquement pour etablir la connexion a la base de donnees.

## Configuration des Certificats

Pour les modes **Verify CA** et **Verify Full**, vous pouvez fournir des certificats :

### Certificat CA

Le certificat CA qui a signe le certificat de votre serveur de base de donnees. Collez le contenu directement - il doit commencer par `-----BEGIN CERTIFICATE-----`.

### Certificat Client et Cle (Optionnel)

Pour le TLS mutuel (mTLS), fournissez votre certificat client et votre cle privee.

### Cles Protegees par Mot de Passe

Si votre cle client est chiffree, Cloak DB le detecte automatiquement et affiche un champ pour la phrase de passe.

## Certificats Auto-Signes

Pour les bases de donnees utilisant des certificats auto-signes :

1. Activez SSL et selectionnez n'importe quel mode sauf Disable
2. Cochez **Autoriser les certificats auto-signes**

Cela definit `rejectUnauthorized: false` dans la connexion, desactivant la verification des certificats.

## Notes par Fournisseur

### AWS RDS

AWS RDS exige SSL pour la plupart des configurations. Utilisez le mode **Require**, ou telechargez le [bundle CA RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html) pour les modes de verification.

### Supabase

Supabase utilise des certificats publiquement approuves. Le mode **Require** fonctionne sans configuration supplementaire.

### Neon

Neon utilise des certificats Let's Encrypt. Le mode **Require** fonctionne sans configuration supplementaire.

### Developpement Local

Pour PostgreSQL local avec des certificats auto-signes, activez **Autoriser les certificats auto-signes**.

## Connexions Sauvegardees

Lorsque vous sauvegardez une connexion avec SSL configure :

- Le contenu des certificats est stocke (pas les chemins de fichiers)
- Tous les parametres SSL persistent entre les redemarrages de l'application
- Modifiez les connexions sauvegardees depuis la page Parametres pour mettre a jour la configuration SSL

## Depannage

| Erreur | Solution |
|--------|----------|
| "SSL connection required" | Activez SSL et selectionnez le mode Require ou superieur |
| "self signed certificate" | Cochez **Autoriser les certificats auto-signes** ou fournissez le certificat CA |
| "certificate verify failed" | Verifiez que vous avez le bon certificat CA |
| "hostname mismatch" | Utilisez **Verify CA** au lieu de **Verify Full**, ou verifiez votre nom d'hote |
