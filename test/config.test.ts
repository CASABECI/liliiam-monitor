import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { loadConfig, resolveSubscanBaseUrl } from '../src/config/env';

const originalEnv = { ...process.env };

describe('config parsing', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUBSCAN_API_KEY;
    delete process.env.SUBSCAN_BASE_URL;
    delete process.env.DOTLAKE_API_KEY;
    delete process.env.DOTLAKE_BASE_URL;
    delete process.env.WHALE_VOTE_THRESHOLD;
    delete process.env.DEFAULT_CHAIN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads defaults', () => {
    const config = loadConfig();
    expect(config.defaultChain).toBe('polkadot');
    expect(config.whaleVoteThreshold).toBe(500000);
    expect(resolveSubscanBaseUrl(config.defaultChain, config.subscanBaseUrl)).toBe('https://polkadot.api.subscan.io');
  });

  it('loads custom env values', () => {
    process.env.DEFAULT_CHAIN = 'kusama';
    process.env.WHALE_VOTE_THRESHOLD = '12345';
    process.env.SUBSCAN_BASE_URL = 'https://custom-subscan';
    const config = loadConfig();

    expect(config.defaultChain).toBe('kusama');
    expect(config.whaleVoteThreshold).toBe(12345);
    expect(resolveSubscanBaseUrl(config.defaultChain, config.subscanBaseUrl)).toBe('https://custom-subscan');
  });
});
