#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const IMAGE_NAME = 'ghcr.io/cloak-db/app';
const DEFAULT_PORT = 3000;
const CLI_VERSION = '0.3.0';

interface CliOptions {
  port: number;
  tag: string;
  version: boolean;
  help: boolean;
}

function printHelp(): void {
  console.log(`
Cloak DB - Local-first database studio

Usage: cloak-app [options]

Options:
  -p, --port <port>     Port to run on (default: ${DEFAULT_PORT})
  -t, --tag <tag>       Docker image tag (default: latest)
  -v, --version         Show CLI version
  -h, --help            Show this help message

Examples:
  cloak-app                    # Run on port ${DEFAULT_PORT}
  cloak-app --port 8080        # Run on port 8080
  cloak-app --tag v0.2.0       # Run specific version

Requirements:
  Docker must be installed and running.
  Install from https://docker.com
`);
}

function parseCliArgs(): CliOptions {
  try {
    const { values } = parseArgs({
      options: {
        port: { type: 'string', short: 'p', default: String(DEFAULT_PORT) },
        tag: { type: 'string', short: 't', default: 'latest' },
        version: { type: 'boolean', short: 'v', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: false,
    });

    return {
      port: parseInt(values.port as string, 10),
      tag: values.tag as string,
      version: values.version as boolean,
      help: values.help as boolean,
    };
  } catch {
    console.error('Error parsing arguments. Use --help for usage information.');
    process.exit(1);
  }
}

function checkDocker(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkDockerRunning(): boolean {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runContainer(options: CliOptions): void {
  const image = `${IMAGE_NAME}:${options.tag}`;
  const containerName = `cloak-app-${Date.now()}`;

  // Mount host config directory to container for persistent connections
  const hostConfigDir = join(homedir(), '.config', 'cloak-db');
  const containerConfigDir = '/home/nextjs/.config/cloak-db';

  console.log(`\n🚀 Starting Cloak DB on port ${options.port}...`);
  console.log(`   Image: ${image}\n`);

  const dockerProcess = spawn(
    'docker',
    [
      'run',
      '--rm',
      '--pull',
      'always',
      '--name',
      containerName,
      '-p',
      `${options.port}:3000`,
      '-v',
      `${hostConfigDir}:${containerConfigDir}`,
      '--add-host=host.docker.internal:host-gateway',
      image,
    ],
    { stdio: 'inherit' },
  );

  // Handle graceful shutdown
  const cleanup = () => {
    console.log('\n\n🛑 Stopping Cloak DB...');
    try {
      execSync(`docker stop ${containerName}`, { stdio: 'ignore' });
    } catch {
      // Container might already be stopped
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  dockerProcess.on('error', (err) => {
    console.error(`Failed to start container: ${err.message}`);
    process.exit(1);
  });

  dockerProcess.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

function main(): void {
  const options = parseCliArgs();

  if (options.version) {
    console.log(CLI_VERSION);
    process.exit(0);
  }

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Check Docker installation
  if (!checkDocker()) {
    console.error(`
❌ Docker is required to run Cloak DB.

Install Docker from: https://docker.com
`);
    process.exit(1);
  }

  // Check Docker is running
  if (!checkDockerRunning()) {
    console.error(`
❌ Docker is installed but not running.

Please start Docker Desktop or the Docker daemon.
`);
    process.exit(1);
  }

  // Validate port
  if (isNaN(options.port) || options.port < 1 || options.port > 65535) {
    console.error(
      `❌ Invalid port: ${options.port}. Must be between 1 and 65535.`,
    );
    process.exit(1);
  }

  runContainer(options);
}

main();
