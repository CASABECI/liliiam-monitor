import Table from 'cli-table3';
import chalk from 'chalk';

export function printTable(head: string[], rows: Array<Array<string | number | undefined>>): void {
  const table = new Table({ head: head.map((h) => chalk.cyan(h)) });
  for (const row of rows) {
    table.push(row.map((cell) => (cell === undefined ? 'n/a' : cell)));
  }
  console.log(table.toString());
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}
