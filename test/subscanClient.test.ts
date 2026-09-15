import { describe, expect, it, afterEach } from 'vitest';
import nock from 'nock';
import { SubscanClient } from '../src/clients/subscanClient';
import { AppConfig } from '../src/config/env';

const config: AppConfig = {
  subscanApiKey: 'test-key',
  subscanBaseUrl: 'https://polkadot.api.subscan.io',
  dotlakeApiKey: undefined,
  dotlakeBaseUrl: 'https://api.dotlake.io',
  whaleVoteThreshold: 500000,
  defaultChain: 'polkadot',
  requestTimeoutMs: 1000,
  maxRetries: 0
};

describe('SubscanClient', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('normalizes referendum aliases from HTTP payload', async () => {
    nock('https://polkadot.api.subscan.io')
      .post('/api/scan/referenda/referendums')
      .reply(200, {
        data: {
          list: [
            {
              referendum_id: 777,
              referendum_status: 'Deciding',
              proposal_title: 'Treasury spend',
              track_name: 'Treasurer',
              updated_at: '2026-09-01T00:00:00Z',
              vote_amount: '999999'
            }
          ]
        }
      });

    const client = new SubscanClient(config);
    const refs = await client.fetchReferenda('polkadot', 1);

    expect(refs).toHaveLength(1);
    expect(refs[0].id).toBe('777');
    expect(refs[0].status).toBe('Deciding');
    expect(refs[0].title).toBe('Treasury spend');
    expect(refs[0].track).toBe('Treasurer');
    expect(refs[0].whaleAmount).toBe(999999);
  });
});
