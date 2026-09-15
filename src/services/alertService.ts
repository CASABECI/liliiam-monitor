import { SubscanClient } from '../clients/subscanClient';
import { AppConfig } from '../config/env';
import { printJson } from '../utils/formatting';

interface AlertMessage {
  type: 'status_change' | 'whale_vote';
  referendumId: string;
  message: string;
  value?: number;
}

export class AlertService {
  private readonly statusCache = new Map<string, string>();
  private readonly whaleCache = new Set<string>();

  constructor(
    private readonly subscanClient: SubscanClient,
    private readonly config: AppConfig
  ) {}

  private evaluateAlerts(
    referenda: Array<{ id: string; status?: string; whaleAmount?: number }>,
    threshold: number
  ): AlertMessage[] {
    const alerts: AlertMessage[] = [];

    for (const ref of referenda) {
      const priorStatus = this.statusCache.get(ref.id);
      if (ref.status) {
        if (priorStatus && priorStatus !== ref.status) {
          alerts.push({
            type: 'status_change',
            referendumId: ref.id,
            message: `Status changed: ${priorStatus} -> ${ref.status}`
          });
        }
        this.statusCache.set(ref.id, ref.status);
      }

      const whaleAmount = ref.whaleAmount;
      if (typeof whaleAmount === 'number' && whaleAmount >= threshold) {
        const key = `${ref.id}:${whaleAmount}`;
        if (!this.whaleCache.has(key)) {
          alerts.push({
            type: 'whale_vote',
            referendumId: ref.id,
            message: `Whale vote threshold breached (${whaleAmount} >= ${threshold})`,
            value: whaleAmount
          });
          this.whaleCache.add(key);
        }
      }
    }

    return alerts;
  }

  async run(opts: {
    chain: string;
    intervalSec: number;
    threshold?: number;
    once?: boolean;
    asJson?: boolean;
  }): Promise<void> {
    const threshold = opts.threshold ?? this.config.whaleVoteThreshold;

    do {
      const referenda = await this.subscanClient.fetchReferenda(opts.chain, 50);
      const alerts = this.evaluateAlerts(referenda, threshold);

      if (opts.asJson) {
        printJson({ checkedAt: new Date().toISOString(), alerts });
      } else if (alerts.length === 0) {
        console.log('No new alerts.');
      } else {
        for (const alert of alerts) {
          console.log(`🚨 [${alert.type}] ref ${alert.referendumId}: ${alert.message}`);
        }
      }

      if (opts.once) return;
      await new Promise((resolve) => setTimeout(resolve, opts.intervalSec * 1000));
    } while (true);
  }
}
