import { AppConfig } from '../config/env';
import { SubscanClient } from '../clients/subscanClient';
import { DotlakeClient } from '../clients/dotlakeClient';
import { printTable } from '../utils/formatting';

interface CheckResult {
  check: string;
  ok: boolean;
  hint: string;
}

export class DoctorService {
  constructor(
    private readonly config: AppConfig,
    private readonly subscanClient: SubscanClient,
    private readonly dotlakeClient: DotlakeClient
  ) {}

  async run(chain: string): Promise<void> {
    const checks: CheckResult[] = [];

    checks.push({
      check: 'SUBSCAN_API_KEY set',
      ok: Boolean(this.config.subscanApiKey),
      hint: 'Set SUBSCAN_API_KEY in .env'
    });
    checks.push({
      check: 'DOTLAKE_API_KEY set',
      ok: Boolean(this.config.dotlakeApiKey),
      hint: 'Set DOTLAKE_API_KEY in .env'
    });

    try {
      await this.subscanClient.fetchReferenda(chain, 1);
      checks.push({ check: 'Subscan reachable', ok: true, hint: '' });
    } catch {
      checks.push({
        check: 'Subscan reachable',
        ok: false,
        hint: 'Verify SUBSCAN_BASE_URL/DEFAULT_CHAIN and network connectivity'
      });
    }

    try {
      await this.dotlakeClient.fetchMonthlyParticipation(1, chain);
      checks.push({ check: 'DotLake reachable', ok: true, hint: '' });
    } catch {
      checks.push({
        check: 'DotLake reachable',
        ok: false,
        hint: 'Verify DOTLAKE_BASE_URL/API key and network connectivity'
      });
    }

    printTable(
      ['Check', 'Result', 'Hint'],
      checks.map((c) => [c.check, c.ok ? 'PASS' : 'FAIL', c.hint])
    );

    const failed = checks.filter((c) => !c.ok);
    if (failed.length > 0) {
      process.exitCode = 1;
    }
  }
}
