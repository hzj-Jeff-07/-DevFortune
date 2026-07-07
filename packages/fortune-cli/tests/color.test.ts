import { describe, it, expect } from 'vitest';
import { shouldUseColor } from '../src/output/color.js';

describe('shouldUseColor', () => {
  it('enabled on a TTY with no overrides', () => {
    expect(shouldUseColor(false, {}, true)).toBe(true);
  });

  it('--no-color flag wins', () => {
    expect(shouldUseColor(true, {}, true)).toBe(false);
  });

  it('NO_COLOR env disables color even when empty (no-color.org)', () => {
    expect(shouldUseColor(false, { NO_COLOR: '1' }, true)).toBe(false);
    expect(shouldUseColor(false, { NO_COLOR: '' }, true)).toBe(false);
  });

  it('non-TTY output (pipe/redirect) disables color', () => {
    expect(shouldUseColor(false, {}, false)).toBe(false);
    expect(shouldUseColor(false, {}, undefined)).toBe(false);
  });
});
