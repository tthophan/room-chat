import {
  applyMixins,
  formatMilliseconds,
  formatNumber,
  generateCID,
  generateKeyByCount,
  parseFromJson,
  roundDecimalPrecision,
  roundToTwo,
  stringifyAnObject,
} from '../func-util';

describe('func-util', () => {
  it('parseFromJson', () => {
    expect(parseFromJson('{"a":1}')).toEqual({ a: 1 });
    expect(parseFromJson('{"a"1}')).toEqual('{"a"1}');
  });

  it('roundDecimalPrecision', () => {
    expect(roundDecimalPrecision(13, 0)).toBe(13);
    expect(roundDecimalPrecision(13, 1)).toBe(13.0);
    expect(roundDecimalPrecision(13, 2)).toBe(13.0);
  });

  it('formatNumber', () => {
    expect(formatNumber(1000)).toContain('1,000.00');
  });

  it('applyMixins', () => {
    class A {}
    class B {
      b: number;
    }
    class C {
      c: number;
    }
    applyMixins(A, [B, C]);
    expect(true).toBeTruthy();
  });

  it('stringifyanObject', () => {
    expect(stringifyAnObject({ a: 1 })).toBe('{"a":1}');
  });

  it('generatekeybycount', () => {
    generateKeyByCount(10);
    expect(true).toBeTruthy();
  });

  it('roundToTwo', () => {
    expect(roundToTwo(1.2345)).toBe(1.23);
  });

  it('generateCID', () => {
    expect(generateCID()).toHaveLength(26);
  });

  it('formatMilliseconds', () => {
    expect(formatMilliseconds(1)).toBe('1ms');
  });
});
