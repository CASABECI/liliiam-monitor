import { DotlakeClient } from '../clients/dotlakeClient';
import { printJson, printTable } from '../utils/formatting';

export class AnalyticsService {
  constructor(private readonly dotlakeClient: DotlakeClient) {}

  async monthly(months: number, network: string | undefined, asJson: boolean): Promise<void> {
    const rows = await this.dotlakeClient.fetchMonthlyParticipation(months, network);
    if (asJson) {
      printJson(rows);
      return;
    }

    printTable(
      ['Month', 'Network', 'Voter Type', 'Count'],
      rows.map((row) => [row.month, row.network, row.voterType, row.count])
    );
  }
}
