#!/bin/bash
# Generate SSL certificates for PostgreSQL testing
# All certificates are self-signed for local development only

set -e

CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

echo "Generating SSL certificates in $CERT_DIR..."

# Clean up old certs
rm -f *.pem *.key *.crt *.csr *.srl

# 1. Generate CA (Certificate Authority)
echo "1. Generating CA..."
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt \
  -subj "/C=US/ST=Dev/L=Local/O=CloakDB/CN=CloakDB-CA"

# 2. Generate Server Certificate (for PostgreSQL)
echo "2. Generating server certificate..."
openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=Dev/L=Local/O=CloakDB/CN=localhost"

# Create extensions file for SAN (Subject Alternative Names)
cat > server.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = pg-ssl-require
DNS.3 = pg-ssl-verify-ca
DNS.4 = pg-ssl-verify-full
IP.1 = 127.0.0.1
EOF

openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt -extfile server.ext

# 3. Generate Client Certificate (for mTLS testing)
echo "3. Generating client certificate..."
openssl genrsa -out client.key 4096
openssl req -new -key client.key -out client.csr \
  -subj "/C=US/ST=Dev/L=Local/O=CloakDB/CN=postgres"

cat > client.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
EOF

openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client.crt -extfile client.ext

# 4. Generate encrypted client key (for passphrase testing)
echo "4. Generating encrypted client key..."
openssl rsa -aes256 -in client.key -out client-encrypted.key -passout pass:testpassword

# 5. Set proper permissions (PostgreSQL is strict about this)
chmod 600 server.key client.key client-encrypted.key
chmod 644 ca.crt server.crt client.crt

# Clean up temporary files
rm -f *.csr *.ext *.srl

echo ""
echo "Certificates generated successfully!"
echo ""
echo "Files created:"
ls -la "$CERT_DIR"
echo ""
echo "CA Certificate: ca.crt"
echo "Server Certificate: server.crt / server.key"
echo "Client Certificate: client.crt / client.key"
echo "Encrypted Client Key: client-encrypted.key (passphrase: testpassword)"
