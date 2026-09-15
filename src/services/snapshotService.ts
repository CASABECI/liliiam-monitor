import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SubscanClient } from '../clients/subscanClient';
import { DotlakeClient } from '../clients/dotlakeClient';
import { todayIsoDate } from '../utils/time';

export class SnapshotService {
  constructor(
    private readonly subscanClient: SubscanClient,
    private readonly dotlakeClient: DotlakeClient
  ) {}

  async daily(chain: string, outDir: string): Promise<void> {
    const date = todayIsoDate();
    const targetDir = path.join(outDir, date);
    await fs.mkdir(targetDir, { recursive: true });

    const [referenda, dailyResults] = await Promise.all([
      this.subscanClient.fetchReferenda(chain, 100),
      this.dotlakeClient.fetchDailyResults(chain)
    ]);

    await Promise.all([
      fs.writeFile(path.join(targetDir, 'subscan_referenda.json'), JSON.stringify(referenda, null, 2), 'utf8'),
      fs.writeFile(path.join(targetDir, 'dotlake_daily_results.json'), JSON.stringify(dailyResults, null, 2), 'utf8')
    ]);

    console.log(`Snapshots written to ${targetDir}`);
  }
}
