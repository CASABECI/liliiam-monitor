import { SubscanClient } from '../clients/subscanClient';
import { printJson, printTable } from '../utils/formatting';

export class MonitorService {
  constructor(private readonly subscanClient: SubscanClient) {}

  async live(chain: string, limit: number, asJson: boolean): Promise<void> {
    const referenda = await this.subscanClient.fetchReferenda(chain, limit);
    if (asJson) {
      printJson(referenda);
      return;
    }

    printTable(
      ['Referendum', 'Status', 'Title', 'Track', 'Created', 'Updated'],
      referenda.map((r) => [r.id, r.status, r.title, r.track, r.createdAt, r.updatedAt])
    );
  }
}
