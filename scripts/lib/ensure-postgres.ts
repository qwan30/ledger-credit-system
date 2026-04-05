import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { Socket } from "node:net";

interface EnsurePostgresOptions {
  cwd?: string;
  databaseUrl?: string | undefined;
  timeoutMs?: number;
  quiet?: boolean | undefined;
}

function log(message: string, quiet: boolean | undefined): void {
  if (!quiet) {
    console.log(message);
  }
}

function canReachPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();

    socket.setTimeout(1_000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function hasDockerCli(): boolean {
  try {
    execSync(process.platform === "win32" ? "where docker" : "which docker", {
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

function isDockerEngineReady(): boolean {
  try {
    execSync("docker info", {
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

function launchDockerDesktop(): boolean {
  if (process.platform !== "win32") {
    return false;
  }

  const dockerDesktopPath = "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe";
  if (!existsSync(dockerDesktopPath)) {
    return false;
  }

  const child = spawn(dockerDesktopPath, [], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();

  return true;
}

async function waitForDockerEngine(timeoutMs: number): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (isDockerEngineReady()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error("Docker engine did not become ready within the expected time window.");
}

function startDockerComposePostgres(cwd: string): void {
  execSync("docker compose up -d postgres", {
    cwd,
    env: process.env,
    stdio: "inherit"
  });
}

async function ensureDockerBackedPostgres(cwd: string, timeoutMs: number, quiet?: boolean): Promise<void> {
  if (!hasDockerCli()) {
    throw new Error("Docker CLI is not installed. Install Docker Desktop or provide a reachable DATABASE_URL.");
  }

  if (!isDockerEngineReady()) {
    const launchedDesktop = launchDockerDesktop();

    if (!launchedDesktop) {
      throw new Error("Docker engine is not running. Start Docker Desktop or provide a reachable DATABASE_URL.");
    }

    log("Starting Docker Desktop for local PostgreSQL...", quiet);
    await waitForDockerEngine(timeoutMs);
  }

  log("Ensuring PostgreSQL container is running...", quiet);
  startDockerComposePostgres(cwd);
}

export async function ensurePostgres(options: EnsurePostgresOptions = {}): Promise<void> {
  const databaseUrl = new URL(options.databaseUrl ?? process.env.DATABASE_URL ?? "");
  const port = Number(databaseUrl.port || "5432");
  const host = databaseUrl.hostname;
  const cwd = options.cwd ?? process.cwd();
  const timeoutMs = options.timeoutMs ?? 60_000;

  if (await canReachPort(host, port)) {
    return;
  }

  if (!process.env.CI) {
    await ensureDockerBackedPostgres(cwd, timeoutMs, options.quiet);
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await canReachPort(host, port)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`PostgreSQL did not become reachable at ${host}:${port} within ${timeoutMs}ms.`);
}

async function main(): Promise<void> {
  await ensurePostgres();
}

if (require.main === module) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
