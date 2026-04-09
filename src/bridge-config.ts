import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const STATE_DIR = join(homedir(), ".chrome-devtools-axi");
const CONFIG_FILE = join(STATE_DIR, "bridge-config.json");

export interface BridgeLaunchOptions {
  headless: boolean;
  isolated: boolean;
  autoConnect: boolean;
  browserUrl?: string;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function normalizeBrowserUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptions(
  value: Partial<BridgeLaunchOptions> | null | undefined,
): BridgeLaunchOptions {
  return {
    headless: value?.headless ?? true,
    isolated: value?.isolated ?? true,
    autoConnect: value?.autoConnect ?? false,
    ...(normalizeBrowserUrl(value?.browserUrl)
      ? { browserUrl: normalizeBrowserUrl(value?.browserUrl) }
      : {}),
  };
}

export function readStoredBridgeLaunchOptions(): BridgeLaunchOptions {
  try {
    if (!existsSync(CONFIG_FILE)) return normalizeOptions(undefined);
    const raw = JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) as Partial<
      BridgeLaunchOptions
    >;
    return normalizeOptions(raw);
  } catch {
    return normalizeOptions(undefined);
  }
}

export function resolveBridgeLaunchOptions(
  env: NodeJS.ProcessEnv = process.env,
): BridgeLaunchOptions {
  const stored = readStoredBridgeLaunchOptions();
  const headless = parseBoolean(env.CHROME_DEVTOOLS_AXI_HEADLESS);
  const isolated = parseBoolean(env.CHROME_DEVTOOLS_AXI_ISOLATED);
  const autoConnect = parseBoolean(env.CHROME_DEVTOOLS_AXI_AUTO_CONNECT);
  const browserUrl = normalizeBrowserUrl(env.CHROME_DEVTOOLS_AXI_BROWSER_URL);
  const resolvedAutoConnect = autoConnect ?? stored.autoConnect;

  return {
    headless: headless ?? stored.headless,
    isolated: isolated ?? stored.isolated,
    autoConnect: resolvedAutoConnect,
    ...(browserUrl !== undefined
      ? { browserUrl }
      : resolvedAutoConnect
        ? {}
      : stored.browserUrl
        ? { browserUrl: stored.browserUrl }
        : {}),
  };
}

export function writeStoredBridgeLaunchOptions(
  options: BridgeLaunchOptions,
): void {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(normalizeOptions(options), null, 2));
}

export function mergeBridgeLaunchOptions(
  overrides: Partial<BridgeLaunchOptions>,
): BridgeLaunchOptions {
  const base = readStoredBridgeLaunchOptions();
  const merged = normalizeOptions({
    ...base,
    ...overrides,
    ...(overrides.browserUrl !== undefined
      ? { browserUrl: overrides.browserUrl }
      : {}),
  });
  if (overrides.autoConnect) {
    delete merged.browserUrl;
  }
  if (overrides.browserUrl) {
    merged.autoConnect = false;
  }
  return merged;
}

export function buildChromeDevtoolsMcpArgs(
  options: BridgeLaunchOptions,
): string[] {
  const args = ["-y", "chrome-devtools-mcp@latest"];

  if (options.browserUrl) {
    args.push(`--browserUrl=${options.browserUrl}`);
    return args;
  }

  if (options.autoConnect) {
    args.push("--autoConnect");
    return args;
  }

  if (options.headless) args.push("--headless");
  if (options.isolated) args.push("--isolated");
  return args;
}
