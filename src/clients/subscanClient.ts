import axios, { AxiosInstance } from 'axios';
import { AppConfig, resolveSubscanBaseUrl } from '../config/env';
import { normalizeError } from '../utils/errors';
import { retry } from '../utils/retry';
import { Referendum } from '../types';
import { log } from '../utils/logger';

const REFERENDA_ENDPOINT = '/api/scan/referenda/referendums';

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

export function normalizeReferendum(input: Record<string, unknown>): Referendum {
  const id = pickString(input, ['referendum_index', 'referendumId', 'referendum_id', 'id', 'index']) || 'unknown';
  const status = pickString(input, ['status', 'state', 'referendum_status']);
  const title = pickString(input, ['title', 'proposal_title', 'name']);
  const track = pickString(input, ['track', 'track_name', 'origin']);
  const updatedAt = pickString(input, ['updated_at', 'updatedAt', 'last_updated', 'end']);
  const createdAt = pickString(input, ['created_at', 'createdAt', 'submitted_at', 'start']);
  const whaleAmount = pickNumber(input, ['vote_amount', 'amount', 'balance', 'total_votes', 'ayes', 'nays']);

  if (!status || !title) {
    log('warn', 'Optional referendum fields missing from API payload', { id, hasStatus: Boolean(status), hasTitle: Boolean(title) });
  }

  return { id, status, title, track, updatedAt, createdAt, whaleAmount, raw: input };
}

export class SubscanClient {
  private readonly config: AppConfig;
  private readonly axiosInstance: AxiosInstance;

  constructor(config: AppConfig, instance?: AxiosInstance) {
    this.config = config;
    this.axiosInstance = instance || axios.create({ timeout: config.requestTimeoutMs });
  }

  async fetchReferenda(chain: string, limit: number): Promise<Referendum[]> {
    const baseURL = resolveSubscanBaseUrl(chain, this.config.subscanBaseUrl);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.config.subscanApiKey) {
      headers['X-API-Key'] = this.config.subscanApiKey;
    }

    try {
      const response = await retry(
        () => this.axiosInstance.post(`${baseURL}${REFERENDA_ENDPOINT}`, { page: 0, row: limit }, { headers }),
        { retries: this.config.maxRetries }
      );

      const list = ((response.data as { data?: { list?: unknown[] } })?.data?.list || []) as unknown[];
      return list
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => normalizeReferendum(item));
    } catch (error) {
      throw normalizeError('Failed to fetch Subscan referenda', error);
    }
  }
}
