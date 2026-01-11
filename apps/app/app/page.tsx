import Link from 'next/link';
import { Button } from '@cloak-db/ui/components/button';
import { Badge } from '@cloak-db/ui/components/badge';
import { HealthCheck } from './components/HealthCheck';

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black">
      {/* Ambient gradient orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-purple-500 to-blue-500 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-yellow-500 to-orange-500 pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <Badge variant="yellow" className="uppercase tracking-wider">
            Early Access
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Cloak DB
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-700 dark:text-gray-400 max-w-lg mx-auto">
          You're early! This app is not functional yet. We're actively building
          the core features. Check back soon.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild variant="yellow" size="lg">
            <Link
              href="https://www.cloak-db.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Website
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link
              href="https://www.cloak-db.com/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Docs
            </Link>
          </Button>
        </div>

        {/* Health Check Component */}
        <div className="pt-8">
          <HealthCheck />
        </div>
      </div>
    </main>
  );
}
