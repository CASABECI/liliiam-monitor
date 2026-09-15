import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  subscanApiKey?: string;
  subscanBaseUrl?: string;
  dotlakeApiKey?: string;
  dotlakeBaseUrl: string;
  whaleVoteThreshold: number;
  defaultChain: string;
  requestTimeoutMs: number;
  maxRetries: number;
}

const DEFAULT_DOTLAKE_BASE_URL = 'https://api.dotlake.io';

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveSubscanBaseUrl(chain: string, override?: string): string {
  if (override) return override;
  return `https://${chain}.api.subscan.io`;
}

export function loadConfig(): AppConfig {
  const defaultChain = process.env.DEFAULT_CHAIN || 'polkadot';

  return {
    subscanApiKey: process.env.SUBSCAN_API_KEY,
    subscanBaseUrl: process.env.SUBSCAN_BASE_URL,
    dotlakeApiKey: process.env.DOTLAKE_API_KEY,
    dotlakeBaseUrl: process.env.DOTLAKE_BASE_URL || DEFAULT_DOTLAKE_BASE_URL,
    whaleVoteThreshold: parseNumber(process.env.WHALE_VOTE_THRESHOLD, 500000),
    defaultChain,
    requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, 12000),
    maxRetries: parseNumber(process.env.MAX_RETRIES, 3)
  };
}
