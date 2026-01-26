'use client';

import { useState, useRef } from 'react';
import { Eye, EyeOff, X, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@cloak-db/ui/components/button';
import { Input } from '@cloak-db/ui/components/input';
import {
  isValidPemFormat,
  normalizeCertificate,
} from '@/lib/connection-string';

interface CertificateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  optional?: boolean;
  acceptedExtensions?: string[];
  showPassphrase?: boolean;
  passphrase?: string;
  onPassphraseChange?: (value: string) => void;
  disabled?: boolean;
}

export function CertificateInput({
  label,
  value,
  onChange,
  placeholder = '-----BEGIN CERTIFICATE-----',
  optional = false,
  acceptedExtensions = ['.pem', '.crt', '.cer', '.key'],
  showPassphrase = false,
  passphrase = '',
  onPassphraseChange,
  disabled = false,
}: CertificateInputProps) {
  const [isMasked, setIsMasked] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.trim().length > 0;

  // Handle file selection
  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const content = await file.text();
        const normalized = normalizeCertificate(content);
        onChange(normalized);
        validateContent(normalized);
        setIsMasked(true);
      } catch {
        setValidationError('Failed to read file');
      }
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle direct text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    onChange(content);
    if (content.trim()) {
      validateContent(content);
    } else {
      setValidationError(null);
    }
  };

  // Validate PEM format
  const validateContent = (content: string) => {
    if (content.trim() && !isValidPemFormat(content)) {
      setValidationError(
        'Invalid format: expected PEM format starting with -----BEGIN',
      );
    } else {
      setValidationError(null);
    }
  };

  // Clear the certificate
  const handleClear = () => {
    onChange('');
    setValidationError(null);
    setIsMasked(true);
    onPassphraseChange?.('');
  };

  // Count lines in the certificate
  const lineCount = value.split('\n').length;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
        {label}
        {optional && (
          <span className="text-slate-500 dark:text-gray-500 ml-1">
            (optional)
          </span>
        )}
      </label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedExtensions.join(',')}
        className="hidden"
      />

      {hasValue && isMasked ? (
        // Masked state - show "Certificate loaded" with actions
        <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-black dark:border-white bg-green-50 dark:bg-green-900/20">
          <div className="flex-1">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {label.includes('Key') ? 'Key' : 'Certificate'} loaded
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-500 ml-2">
              ({lineCount} lines)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsMasked(false)}
            disabled={disabled}
            title="Show content"
          >
            <Eye size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            title="Clear"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        // Input state - textarea with browse button
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={value}
              onChange={handleTextChange}
              placeholder={placeholder}
              disabled={disabled}
              rows={4}
              className={`
                w-full rounded-lg border-2 px-4 py-3 pr-10
                text-sm font-mono text-black placeholder:text-gray-500
                bg-white
                dark:bg-transparent dark:text-white dark:placeholder:text-gray-400 dark:border-white
                focus-visible:outline-none focus-visible:ring-0
                transition-all duration-100 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none
                ${
                  validationError
                    ? 'border-amber-500 dark:border-amber-500'
                    : 'border-black dark:border-white'
                }
              `}
            />
            {hasValue && (
              <button
                type="button"
                onClick={() => setIsMasked(true)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Hide content"
              >
                <EyeOff size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBrowse}
              disabled={disabled}
            >
              <Upload size={14} className="mr-1.5" />
              Browse...
            </Button>
            {hasValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Validation warning */}
      {validationError && (
        <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span className="text-xs">{validationError}</span>
        </div>
      )}

      {/* Passphrase field for encrypted keys */}
      {showPassphrase && (
        <div className="space-y-1 pt-2">
          <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
            Key Passphrase
          </label>
          <Input
            type="password"
            value={passphrase}
            onChange={(e) => onPassphraseChange?.(e.target.value)}
            placeholder="Enter passphrase for encrypted key"
            disabled={disabled}
          />
          <p className="text-xs text-slate-500 dark:text-gray-500">
            Your key appears to be encrypted. Enter the passphrase to use it.
          </p>
        </div>
      )}
    </div>
  );
}
