export interface Referendum {
  id: string;
  status?: string;
  title?: string;
  track?: string;
  updatedAt?: string;
  createdAt?: string;
  whaleAmount?: number;
  raw?: Record<string, unknown>;
}

export interface MonthlyParticipationRow {
  month: string;
  network: string;
  voterType: string;
  count: number;
  raw?: Record<string, unknown>;
}
