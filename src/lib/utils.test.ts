import { describe, it, expect, vi } from 'vitest';
import { parseReactionsFromScript, withTimeout } from './utils';

describe('parseReactionsFromScript', () => {
  it('should parse reactions from a valid script', () => {
    const script = `Some preamble text
--- Character Reactions ---
Trump: "This is tremendous!"
Trump: "The best ever!"
Trump: "Nobody does it better!"`;

    const reactions = parseReactionsFromScript(script);

    expect(reactions).toHaveLength(3);
    expect(reactions[0]).toBe('This is tremendous!');
    expect(reactions[1]).toBe('The best ever!');
    expect(reactions[2]).toBe('Nobody does it better!');
  });

  it('should return empty array if no reaction section', () => {
    const script = 'Just some text without reaction section';
    const reactions = parseReactionsFromScript(script);

    expect(reactions).toHaveLength(0);
  });

  it('should filter out empty lines', () => {
    const script = `Text
--- Character Reactions ---
Trump: "First reaction"

Trump: "Second reaction"

`;

    const reactions = parseReactionsFromScript(script);

    expect(reactions).toHaveLength(2);
    expect(reactions[0]).toBe('First reaction');
    expect(reactions[1]).toBe('Second reaction');
  });

  it('should handle different character names', () => {
    const script = `Text
--- Character Reactions ---
Art Critic: "Fascinating composition"
Detective: "Something's not right here"`;

    const reactions = parseReactionsFromScript(script);

    expect(reactions).toHaveLength(2);
    expect(reactions[0]).toBe('Fascinating composition');
    expect(reactions[1]).toBe("Something's not right here");
  });
});

describe('withTimeout', () => {
  it('should resolve with promise result if completed before timeout', async () => {
    const fastPromise = Promise.resolve('success');

    const result = await withTimeout(fastPromise, 1000);

    expect(result).toBe('success');
  });

  it('should reject with timeout error if promise takes too long', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000);
    });

    await expect(withTimeout(slowPromise, 100, 'Timeout!')).rejects.toThrow('Timeout!');
  });

  it('should use default timeout message if not provided', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000);
    });

    await expect(withTimeout(slowPromise, 100)).rejects.toThrow('Request timeout');
  });

  it('should reject with original error if promise fails before timeout', async () => {
    const failingPromise = Promise.reject(new Error('Original error'));

    await expect(withTimeout(failingPromise, 1000)).rejects.toThrow('Original error');
  });

  it('should handle different types of resolved values', async () => {
    const numberPromise = Promise.resolve(42);
    const objectPromise = Promise.resolve({ key: 'value' });
    const arrayPromise = Promise.resolve([1, 2, 3]);

    expect(await withTimeout(numberPromise, 1000)).toBe(42);
    expect(await withTimeout(objectPromise, 1000)).toEqual({ key: 'value' });
    expect(await withTimeout(arrayPromise, 1000)).toEqual([1, 2, 3]);
  });
});
