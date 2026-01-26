'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@cloak-db/ui/components/button';
import { Input } from '@cloak-db/ui/components/input';
import { Checkbox } from '@cloak-db/ui/components/checkbox';
import { Select } from '@cloak-db/ui/components/select';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@cloak-db/ui/components/modal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@cloak-db/ui/components/card';
import { useToast } from '@cloak-db/ui/components/toast';
import { trpc } from '@/lib/trpc/client';
import {
  parseSSLMode,
  updateSSLMode,
  SSL_MODE_OPTIONS,
  isEncryptedKey,
  type SSLMode,
  type SSLCertificateConfig,
} from '@/lib/connection-string';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { CertificateInput } from './certificate-input';

interface ConnectionFormProps {
  initialConnectionString?: string;
  initialSsl?: SSLCertificateConfig;
}

export function ConnectionForm({
  initialConnectionString = '',
  initialSsl,
}: ConnectionFormProps) {
  const router = useRouter();
  const [connectionString, setConnectionString] = useState(
    initialConnectionString,
  );
  const [saveConnection, setSaveConnection] = useState(false);
  const [connectionName, setConnectionName] = useState('');
  const { success, error } = useToast();
  const utils = trpc.useUtils();

  // SSL configuration state
  const [sslEnabled, setSslEnabled] = useState(false);
  const [sslMode, setSslMode] = useState<SSLMode>('require');
  const [showDisableWarning, setShowDisableWarning] = useState(false);
  const [allowSelfSigned, setAllowSelfSigned] = useState(false);
  const [sslCertificates, setSslCertificates] = useState<SSLCertificateConfig>(
    {},
  );

  // Track if we're updating from internal changes to prevent loops
  const isInternalUpdate = useRef(false);

  // Debounce the connection string for parsing (300ms)
  const debouncedConnectionString = useDebounce(connectionString, 300);

  // Parse SSL mode when connection string changes (debounced)
  useEffect(() => {
    // Skip if this update came from our own SSL changes
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const parsed = parseSSLMode(debouncedConnectionString);
    setSslEnabled(parsed.enabled);
    if (parsed.mode) {
      setSslMode(parsed.mode);
    }
  }, [debouncedConnectionString]);

  // Update connection string when prop changes (from saved connections)
  useEffect(() => {
    if (initialConnectionString) {
      setConnectionString(initialConnectionString);
      // Parse the initial string immediately
      const parsed = parseSSLMode(initialConnectionString);
      setSslEnabled(parsed.enabled);
      if (parsed.mode) {
        setSslMode(parsed.mode);
      }
    }
  }, [initialConnectionString]);

  // Populate SSL settings from initialSsl prop (for editing saved connections)
  useEffect(() => {
    if (initialSsl) {
      setAllowSelfSigned(initialSsl.rejectUnauthorized === false);
      setSslCertificates({
        ca: initialSsl.ca,
        cert: initialSsl.cert,
        key: initialSsl.key,
        passphrase: initialSsl.passphrase,
      });
    }
  }, [initialSsl]);

  const { data: connectionStatus } = trpc.connection.status.useQuery();
  const disconnectMutation = trpc.connection.disconnect.useMutation();

  const testMutation = trpc.connection.test.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        success('Connection test successful!');
      } else {
        error(data.error?.message || 'Connection test failed');
      }
    },
    onError: (err) => {
      error(err.message || 'An error occurred');
    },
  });

  const connectMutation = trpc.connection.connect.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        success(`Connected to ${data.database}@${data.host}`);
        utils.connection.status.invalidate();
        // Redirect to studio after successful connection
        router.push('/studio');
      } else {
        error(data.error?.message || 'Connection failed');
      }
    },
    onError: (err) => {
      error(err.message || 'An error occurred');
    },
  });

  const saveConnectionMutation = trpc.config.saveConnection.useMutation({
    onSuccess: () => {
      utils.config.get.invalidate();
    },
  });

  // Build SSL config object for backend
  const buildSslConfig = (): SSLCertificateConfig | undefined => {
    if (!sslEnabled) return undefined;

    const hasCertificates =
      sslCertificates.ca ||
      sslCertificates.cert ||
      sslCertificates.key ||
      sslCertificates.passphrase;

    // Include rejectUnauthorized if self-signed is allowed, or if we have certificates
    if (!hasCertificates && !allowSelfSigned) return undefined;

    return {
      rejectUnauthorized: allowSelfSigned ? false : undefined,
      ca: sslCertificates.ca || undefined,
      cert: sslCertificates.cert || undefined,
      key: sslCertificates.key || undefined,
      passphrase: sslCertificates.passphrase || undefined,
    };
  };

  const handleTest = () => {
    if (!connectionString.trim()) {
      error('Please enter a connection string');
      return;
    }
    testMutation.mutate({
      connectionString,
      ssl: buildSslConfig(),
    });
  };

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      error('Please enter a connection string');
      return;
    }

    // Disconnect from current connection first if connected
    if (connectionStatus?.connected) {
      await disconnectMutation.mutateAsync();
      utils.connection.status.invalidate();
    }

    // Save connection first if checkbox is checked
    if (saveConnection && connectionName.trim()) {
      try {
        await saveConnectionMutation.mutateAsync({
          name: connectionName.trim(),
          connectionString,
          ssl: buildSslConfig(),
        });
      } catch {
        // Continue with connect even if save fails
      }
    }

    connectMutation.mutate({
      connectionString,
      ssl: buildSslConfig(),
    });
  };

  // Handle SSL toggle
  const handleSSLToggle = (checked: boolean) => {
    if (checked) {
      // Enable SSL with default mode 'require'
      isInternalUpdate.current = true;
      setSslEnabled(true);
      setSslMode('require');
      setConnectionString(updateSSLMode(connectionString, 'require'));
    } else {
      // Check if there's an existing sslmode to warn about
      const parsed = parseSSLMode(connectionString);
      if (parsed.enabled && parsed.mode) {
        setShowDisableWarning(true);
      } else {
        // No existing sslmode, just disable
        setSslEnabled(false);
      }
    }
  };

  // Handle SSL mode change
  const handleSSLModeChange = (newMode: SSLMode) => {
    isInternalUpdate.current = true;
    setSslMode(newMode);
    setConnectionString(updateSSLMode(connectionString, newMode));
  };

  // Handle disable warning confirmation
  const handleConfirmDisable = () => {
    isInternalUpdate.current = true;
    setSslEnabled(false);
    setConnectionString(updateSSLMode(connectionString, null));
    setShowDisableWarning(false);
  };

  const isLoading =
    testMutation.isPending ||
    connectMutation.isPending ||
    saveConnectionMutation.isPending ||
    disconnectMutation.isPending;

  // Get the description for the current SSL mode
  const currentModeDescription =
    SSL_MODE_OPTIONS.find((opt) => opt.value === sslMode)?.description || '';

  return (
    <>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Connect to Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="connectionString"
              className="text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Connection String
            </label>
            <Input
              id="connectionString"
              type="text"
              placeholder="postgres://user:password@localhost:5432/database"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 dark:text-gray-500">
              Only PostgreSQL databases are supported
            </p>
          </div>

          {/* SSL Configuration */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-slate-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                SSL Configuration
              </span>
            </div>

            <Checkbox
              checked={sslEnabled}
              onChange={(e) => handleSSLToggle(e.target.checked)}
              disabled={isLoading}
              label="Enable SSL"
            />

            <div
              className={`space-y-2 overflow-hidden transition-all duration-200 ease-out ${
                sslEnabled ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <label
                htmlFor="sslMode"
                className="text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                SSL Mode
              </label>
              <Select
                id="sslMode"
                value={sslMode}
                onChange={(e) => handleSSLModeChange(e.target.value as SSLMode)}
                disabled={isLoading || !sslEnabled}
              >
                {SSL_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-slate-500 dark:text-gray-500">
                {currentModeDescription}
              </p>
            </div>

            {/* Self-signed certificate option */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-out ${
                sslEnabled && sslMode !== 'disable'
                  ? 'max-h-20 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={allowSelfSigned}
                  onChange={(e) => setAllowSelfSigned(e.target.checked)}
                  disabled={isLoading}
                  label="Allow self-signed certificates"
                />
                <div
                  className="mt-0.5 relative group"
                  title="Disables certificate verification. Use only for development."
                >
                  <AlertTriangle
                    size={14}
                    className="text-amber-500 cursor-help"
                  />
                </div>
              </div>
              {allowSelfSigned && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                  Disables certificate verification. Development only.
                </p>
              )}
            </div>

            {/* Certificate section - only for verify-ca or verify-full */}
            <div
              className={`space-y-4 overflow-hidden transition-all duration-200 ease-out ${
                sslEnabled &&
                (sslMode === 'verify-ca' || sslMode === 'verify-full')
                  ? 'max-h-[800px] opacity-100 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Certificates
              </span>

              <CertificateInput
                label="CA Certificate"
                value={sslCertificates.ca || ''}
                onChange={(ca) =>
                  setSslCertificates((prev) => ({ ...prev, ca }))
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                disabled={isLoading}
              />

              <CertificateInput
                label="Client Certificate"
                value={sslCertificates.cert || ''}
                onChange={(cert) =>
                  setSslCertificates((prev) => ({ ...prev, cert }))
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                optional
                disabled={isLoading}
              />

              <CertificateInput
                label="Client Key"
                value={sslCertificates.key || ''}
                onChange={(key) =>
                  setSslCertificates((prev) => ({ ...prev, key }))
                }
                placeholder="-----BEGIN PRIVATE KEY-----"
                optional
                showPassphrase={isEncryptedKey(sslCertificates.key || '')}
                passphrase={sslCertificates.passphrase}
                onPassphraseChange={(passphrase) =>
                  setSslCertificates((prev) => ({ ...prev, passphrase }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Save connection option */}
          <div className="space-y-3 text-left">
            <Checkbox
              checked={saveConnection}
              onChange={(e) => setSaveConnection(e.target.checked)}
              disabled={isLoading}
              label="Save this connection"
            />

            <div
              className={`space-y-2 overflow-hidden transition-all duration-200 ease-out ${
                saveConnection ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <label
                htmlFor="connectionName"
                className="text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                Connection Name
              </label>
              <Input
                id="connectionName"
                type="text"
                placeholder="e.g., Local Dev, Staging"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                disabled={isLoading || !saveConnection}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isLoading || !connectionString.trim()}
            >
              {testMutation.isPending ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              variant="yellow"
              onClick={handleConnect}
              disabled={
                isLoading ||
                !connectionString.trim() ||
                (saveConnection && !connectionName.trim())
              }
            >
              {connectMutation.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SSL Disable Warning Modal */}
      <Modal
        open={showDisableWarning}
        onClose={() => setShowDisableWarning(false)}
        className="dark:bg-slate-900"
      >
        <ModalHeader>
          <ModalTitle>Remove SSL?</ModalTitle>
          <ModalDescription>
            Your connection string includes SSL mode &quot;{sslMode}&quot;.
            Disabling SSL will remove this parameter from your connection
            string.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDisableWarning(false)}
          >
            Cancel
          </Button>
          <Button variant="yellow" onClick={handleConfirmDisable}>
            Remove &amp; Disable
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
