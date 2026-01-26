---
title: SSL Connections
description: Configure SSL/TLS connections to your PostgreSQL database in Cloak DB
order: 4
---

# SSL Connections

Cloak DB supports SSL/TLS encrypted connections to your PostgreSQL database. This page explains how to configure SSL in Cloak DB and what happens with your settings.

## Quick Start

For most cloud databases:

1. Enable the **SSL** toggle in the connection form
2. Select **Require** mode
3. Connect

## SSL Modes

Cloak DB supports four SSL modes, matching PostgreSQL's `sslmode` parameter:

| Mode | Description |
|------|-------------|
| **Disable** | No SSL encryption |
| **Require** | SSL encryption, no certificate verification |
| **Verify CA** | SSL encryption with CA certificate verification |
| **Verify Full** | SSL encryption with CA and hostname verification |

The level of security you need depends on your environment and requirements.

## How Cloak DB Handles SSL

When you configure SSL in the connection form:

1. **Connection string** - Cloak DB adds the `sslmode` parameter to your connection string
2. **Certificates** - If provided, certificates are passed to the PostgreSQL driver
3. **Storage** - SSL settings are saved with your connection in `~/.config/cloak-db/config.json`

Cloak DB never modifies or transmits your certificates elsewhere - they're used only to establish the database connection.

## Certificate Configuration

For **Verify CA** and **Verify Full** modes, you can provide certificates:

### CA Certificate

The CA certificate that signed your database server's certificate. Paste the content directly - it should start with `-----BEGIN CERTIFICATE-----`.

### Client Certificate & Key (Optional)

For mutual TLS (mTLS), provide your client certificate and private key.

### Password-Protected Keys

If your client key is encrypted, Cloak DB detects this automatically and shows a passphrase field.

## Self-Signed Certificates

For databases using self-signed certificates:

1. Enable SSL and select any mode except Disable
2. Check **Allow self-signed certificates**

This sets `rejectUnauthorized: false` in the connection, disabling certificate verification.

## Provider Notes

### AWS RDS

AWS RDS requires SSL for most configurations. Use **Require** mode, or download the [RDS CA bundle](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html) for verification modes.

### Supabase

Supabase uses publicly trusted certificates. **Require** mode works without additional configuration.

### Neon

Neon uses Let's Encrypt certificates. **Require** mode works without additional configuration.

### Local Development

For local PostgreSQL with self-signed certificates, enable **Allow self-signed certificates**.

## Saved Connections

When you save a connection with SSL configured:

- Certificate content is stored (not file paths)
- All SSL settings persist across app restarts
- Edit saved connections from the Settings page to update SSL configuration

## Troubleshooting

| Error | Solution |
|-------|----------|
| "SSL connection required" | Enable SSL and select Require mode or higher |
| "self signed certificate" | Check **Allow self-signed certificates** or provide the CA certificate |
| "certificate verify failed" | Verify you have the correct CA certificate |
| "hostname mismatch" | Use **Verify CA** instead of **Verify Full**, or check your hostname |
