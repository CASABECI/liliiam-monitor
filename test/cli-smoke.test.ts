import { describe, expect, it } from 'vitest';
import { createProgram } from '../src/cli';

describe('CLI smoke', () => {
  it('registers expected top-level commands', () => {
    const program = createProgram();
    const commandNames = program.commands.map((cmd) => cmd.name());
    expect(commandNames).toContain('monitor');
    expect(commandNames).toContain('analytics');
    expect(commandNames).toContain('snapshots');
    expect(commandNames).toContain('doctor');
  });
});
