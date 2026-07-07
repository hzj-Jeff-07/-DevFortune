import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/commands/parser.js';

describe('parseArgs', () => {
  it('returns defaults when no args', () => {
    const args = parseArgs([]);
    expect(args.detail).toBe(false);
    expect(args.brief).toBe(false);
    expect(args.noColor).toBe(false);
    expect(args.raw).toBe(false);
    expect(args.version).toBe(false);
    expect(args.help).toBe(false);
    expect(args.date).toBeUndefined();
    expect(args.format).toBeUndefined();
  });

  it('parses -d / --date', () => {
    expect(parseArgs(['-d', '2024-03-15']).date).toBe('2024-03-15');
    expect(parseArgs(['--date', '2024-01-01']).date).toBe('2024-01-01');
  });

  it('parses -t / --time', () => {
    expect(parseArgs(['-t', '14:30']).time).toBe('14:30');
    expect(parseArgs(['--time', '09:05']).time).toBe('09:05');
    expect(parseArgs([]).time).toBeUndefined();
  });

  it('parses -l / --lang with valid values', () => {
    expect(parseArgs(['-l', 'en']).lang).toBe('en');
    expect(parseArgs(['--lang', 'zh-CN']).lang).toBe('zh-CN');
    expect(parseArgs(['-l', 'fr']).lang).toBeUndefined();
  });

  it('parses -D / --detail', () => {
    expect(parseArgs(['-D']).detail).toBe(true);
    expect(parseArgs(['--detail']).detail).toBe(true);
  });

  it('parses -b / --brief', () => {
    expect(parseArgs(['-b']).brief).toBe(true);
    expect(parseArgs(['--brief']).brief).toBe(true);
  });

  it('parses -f / --format with valid values', () => {
    expect(parseArgs(['-f', 'json']).format).toBe('json');
    expect(parseArgs(['--format', 'markdown']).format).toBe('markdown');
    expect(parseArgs(['-f', 'text']).format).toBe('text');
  });

  it('ignores invalid format values', () => {
    expect(parseArgs(['-f', 'xml']).format).toBeUndefined();
  });

  it('parses -c / --no-color', () => {
    expect(parseArgs(['-c']).noColor).toBe(true);
    expect(parseArgs(['--no-color']).noColor).toBe(true);
  });

  it('parses -r / --raw', () => {
    expect(parseArgs(['-r']).raw).toBe(true);
    expect(parseArgs(['--raw']).raw).toBe(true);
  });

  it('parses -v / --version', () => {
    expect(parseArgs(['-v']).version).toBe(true);
    expect(parseArgs(['--version']).version).toBe(true);
  });

  it('parses -h / --help', () => {
    expect(parseArgs(['-h']).help).toBe(true);
    expect(parseArgs(['--help']).help).toBe(true);
  });

  it('parses multiple flags together', () => {
    const args = parseArgs(['-D', '-c', '-d', '2024-06-01', '-f', 'json']);
    expect(args.detail).toBe(true);
    expect(args.noColor).toBe(true);
    expect(args.date).toBe('2024-06-01');
    expect(args.format).toBe('json');
  });
});
