'use client';

import { useState } from 'react';
import { Button } from '@cloak-db/ui/components/button';
import { Input } from '@cloak-db/ui/components/input';
import { Card } from '@cloak-db/ui/components/card';
import { ArrowRight, Check } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics/client';

type EmailCaptureProps = {
  dict: {
    badge: string;
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    successMessage: string;
  };
  locale: string;
};

export function EmailCapture({ dict, locale }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { track } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }

      track('form_submitted', {
        form_id: 'early_access',
        source: 'landing_page',
        email_domain: email.split('@')[1],
        status: 'success',
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      setErrorMessage(message);
      track('form_submitted', {
        form_id: 'early_access',
        source: 'landing_page',
        status: 'error',
        error: message,
      });
    }
  };

  return (
    <section
      id="beta"
      className="border-t-2 border-black dark:border-white bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black relative overflow-hidden"
    >
      {/* Ambient gradient orbs - like hero/how it works */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-yellow-400 to-orange-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-green-400 to-blue-400 pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 border-2 border-black dark:border-yellow-500 text-black dark:text-black px-3 py-1.5 font-black text-xs uppercase rotate-[-1deg] shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(234,179,8,0.3)]">
            {dict.badge}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-purple-200 dark:to-blue-200">
            {dict.title}
          </h2>

          <p className="text-xl font-semibold text-slate-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {dict.description}
          </p>

          {status === 'success' ? (
            <Card
              className="p-8 bg-gradient-to-r from-green-400 to-emerald-400 dark:bg-transparent border-2 border-green-500 shadow-[6px_6px_0px_theme(colors.black)] dark:shadow-[6px_6px_0px_rgba(34,197,94,0.5)] animate-fade-in-up"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white dark:bg-green-500 rounded-full p-1.5">
                  <Check
                    className="w-5 h-5 text-green-600 dark:text-black"
                    strokeWidth={3}
                  />
                </div>
                <p className="text-xl font-black text-black dark:text-white">
                  {dict.successMessage}
                </p>
              </div>
            </Card>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
              aria-label="Email subscription form"
            >
              <div className="flex-1 space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.placeholder}
                  required
                  aria-label="Email address"
                  aria-invalid={status === 'error'}
                  aria-describedby={
                    status === 'error' ? 'email-error' : undefined
                  }
                  className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold border-2 border-black dark:border-white shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)] focus:shadow-[5px_5px_0px_theme(colors.black)] dark:focus:shadow-[5px_5px_0px_rgba(255,255,255,0.4)] focus:translate-y-[-2px] transition-all duration-300 ease-out disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={status === 'loading'}
                />
                {status === 'error' && errorMessage && (
                  <p
                    id="email-error"
                    className="text-sm font-bold text-red-600 dark:text-red-400 px-1"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="yellow"
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-black uppercase group disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading
                  </span>
                ) : (
                  <>
                    {dict.buttonText}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
