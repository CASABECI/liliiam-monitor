#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './config/env';
import { SubscanClient } from './clients/subscanClient';
import { DotlakeClient } from './clients/dotlakeClient';
import { MonitorService } from './services/monitorService';
import { AlertService } from './services/alertService';
import { AnalyticsService } from './services/analyticsService';
import { SnapshotService } from './services/snapshotService';
import { DoctorService } from './services/doctorService';
import { AppError } from './utils/errors';

function toNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function handleFatal(error: unknown): void {
  const message = error instanceof AppError ? error.message : (error as Error)?.message || 'Unknown error';
  console.error(message);
  process.exitCode = 1;
}

export function createProgram(): Command {
  const config = loadConfig();
  const subscanClient = new SubscanClient(config);
  const dotlakeClient = new DotlakeClient(config);
  const monitorService = new MonitorService(subscanClient);
  const alertService = new AlertService(subscanClient, config);
  const analyticsService = new AnalyticsService(dotlakeClient);
  const snapshotService = new SnapshotService(subscanClient, dotlakeClient);
  const doctorService = new DoctorService(config, subscanClient, dotlakeClient);

  const program = new Command();
  program.name('liliiam').description('Terminal-first governance monitoring CLI').version('0.1.0');

  const monitor = program.command('monitor').description('Live monitoring commands');

  monitor
    .command('live')
    .option('--chain <name>', 'Chain name', config.defaultChain)
    .option('--limit <n>', 'Result limit', '10')
    .option('--json', 'Output JSON')
    .action(async (opts) => {
      try {
        await monitorService.live(opts.chain, toNumber(opts.limit, 10), Boolean(opts.json));
      } catch (error) {
        handleFatal(error);
      }
    });

  monitor
    .command('alerts')
    .option('--chain <name>', 'Chain name', config.defaultChain)
    .option('--interval <sec>', 'Polling interval in seconds', '60')
    .option('--threshold <number>', 'Whale alert threshold')
    .option('--once', 'Run one cycle and exit')
    .option('--json', 'Output JSON')
    .action(async (opts) => {
      try {
        await alertService.run({
          chain: opts.chain,
          intervalSec: toNumber(opts.interval, 60),
          threshold: opts.threshold !== undefined ? toNumber(opts.threshold, config.whaleVoteThreshold) : undefined,
          once: Boolean(opts.once),
          asJson: Boolean(opts.json)
        });
      } catch (error) {
        handleFatal(error);
      }
    });

  const analytics = program.command('analytics').description('Analytics commands');

  analytics
    .command('monthly')
    .option('--network <name>', 'Optional network filter')
    .option('--months <n>', 'Months to retrieve', '12')
    .option('--json', 'Output JSON')
    .action(async (opts) => {
      try {
        await analyticsService.monthly(toNumber(opts.months, 12), opts.network, Boolean(opts.json));
      } catch (error) {
        handleFatal(error);
      }
    });

  const snapshots = program.command('snapshots').description('Snapshot commands');

  snapshots
    .command('daily')
    .option('--chain <name>', 'Chain name', config.defaultChain)
    .option('--out <path>', 'Output directory', 'snapshots')
    .action(async (opts) => {
      try {
        await snapshotService.daily(opts.chain, opts.out);
      } catch (error) {
        handleFatal(error);
      }
    });

  program
    .command('doctor')
    .description('Validate env and data source connectivity')
    .option('--chain <name>', 'Chain name', config.defaultChain)
    .action(async (opts) => {
      try {
        await doctorService.run(opts.chain);
      } catch (error) {
        handleFatal(error);
      }
    });

  return program;
}

if (require.main === module) {
  createProgram().parseAsync(process.argv);
}
