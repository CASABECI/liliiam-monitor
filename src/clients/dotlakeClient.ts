import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../config/env';
import { normalizeError } from '../utils/errors';
import { retry } from '../utils/retry';
import { MonthlyParticipationRow } from '../types';

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function normalizeMonthlyRow(input: Record<string, unknown>): MonthlyParticipationRow {
  return {
    month: pickString(input, ['month', 'period', 'date']) || 'unknown',
    network: pickString(input, ['network', 'chain', 'relay']) || 'unknown',
    voterType: pickString(input, ['voter_type', 'voterType', 'type']) || 'unknown',
    count: pickNumber(input, ['count', 'voters', 'value']),
    raw: input
  };
}

export class DotlakeClient {
  private readonly config: AppConfig;
  private readonly axiosInstance: AxiosInstance;

  constructor(config: AppConfig, instance?: AxiosInstance) {
    this.config = config;
    this.axiosInstance = instance || axios.create({ timeout: config.requestTimeoutMs });
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.config.dotlakeApiKey) {
      headers.Authorization = ['Bearer', this.config.dotlakeApiKey].join(' ');
    }
    return headers;
  }

  async fetchMonthlyParticipation(months: number, network?: string): Promise<MonthlyParticipationRow[]> {
    const params: Record<string, string | number> = { months };
    if (network) params.network = network;

    try {
      const response = await retry(
        () =>
          this.axiosInstance.get(`${this.config.dotlakeBaseUrl}/api/monthly-opengov-participation`, {
            params,
            headers: this.headers()
          }),
        { retries: this.config.maxRetries }
      );
      const rows = ((response.data as { data?: unknown[] })?.data || []) as unknown[];
      return rows
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => normalizeMonthlyRow(item));
    } catch (error) {
      throw normalizeError('Failed to fetch DotLake monthly participation', error);
    }
  }

  async fetchDailyResults(network?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (network) params.network = network;

    try {
      const response = await retry(
        () =>
          this.axiosInstance.get(`${this.config.dotlakeBaseUrl}/api/daily-opengov-referenda-results`, {
            params,
            headers: this.headers()
          }),
        { retries: this.config.maxRetries }
      );
      return response.data;
    } catch (error) {
      throw normalizeError('Failed to fetch DotLake daily results', error);
    }
  }
}
