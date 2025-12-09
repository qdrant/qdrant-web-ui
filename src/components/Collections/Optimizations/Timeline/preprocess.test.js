import { describe, it, expect } from 'vitest';
import { preprocess } from './preprocess';
import { MOCK_DATA as data, MOCK_REQUEST_TIME as requestTime } from './mock';

describe('preprocess', () => {
  //   it('should return empty array if data is null or undefined', () => {
  //     expect(preprocess(null, requestTime)).toEqual([]);
  //     expect(preprocess(undefined, requestTime)).toEqual([]);
  //   });

  it('should preprocess mock data', () => {
    const result = preprocess(data, requestTime);

    console.log(data.ongoing.length);
    console.log(data.completed.length);
    // todo: should print result in a readable format
    console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
  });

  //   it('should use requestTime as finished_at for ongoing items without finished_at', () => {
  //     const data = {
  //       ongoing: [{
  //         name: 'ongoing_no_finish',
  //         started_at: '2025-12-09T12:00:00.000Z',
  //         // no finished_at
  //         children: [{ name: 'child' }]
  //       }]
  //     };

  //     const result = preprocess(data, requestTime);
  //     expect(result).toHaveLength(1);
  //     expect(result[0].finished_at).toBe(requestTime);
  //   });

  //   it('should filter out items with duration less than 1 second', () => {
  //     const data = {
  //       completed: [
  //         {
  //           name: 'short',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:00.500Z', // 0.5s duration
  //           children: [{ name: 'child' }]
  //         },
  //         {
  //           name: 'exact_one',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:01.000Z', // 1s duration
  //           children: [{ name: 'child' }]
  //         },
  //         {
  //           name: 'long',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:02.000Z', // 2s duration
  //           children: [{ name: 'child' }]
  //         }
  //       ]
  //     };

  //     const result = preprocess(data, requestTime);
  //     expect(result).toHaveLength(2);
  //     expect(result.find(i => i.name === 'short')).toBeUndefined();
  //     expect(result.find(i => i.name === 'exact_one')).toBeDefined();
  //     expect(result.find(i => i.name === 'long')).toBeDefined();
  //   });

  //   it('should filter out items without children', () => {
  //     const data = {
  //       completed: [
  //         {
  //           name: 'no_children',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:05.000Z',
  //           children: []
  //         },
  //         {
  //           name: 'undefined_children',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:05.000Z'
  //         },
  //         {
  //           name: 'with_children',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:05.000Z',
  //           children: [{ name: 'child' }]
  //         }
  //       ]
  //     };

  //     const result = preprocess(data, requestTime);
  //     expect(result).toHaveLength(1);
  //     expect(result[0].name).toBe('with_children');
  //   });

  //   it('should filter out items missing started_at or finished_at (if requestTime is also missing)', () => {
  //     // If requestTime is provided, finished_at is filled for ongoing.
  //     // But if start is missing, it should drop.
  //     const data = {
  //       completed: [
  //         {
  //           name: 'no_start',
  //           // no started_at
  //           finished_at: '2025-12-09T12:00:05.000Z',
  //           children: [{ name: 'child' }]
  //         },
  //         {
  //           name: 'valid',
  //           started_at: '2025-12-09T12:00:00.000Z',
  //           finished_at: '2025-12-09T12:00:05.000Z',
  //           children: [{ name: 'child' }]
  //         }
  //       ]
  //     };

  //     const result = preprocess(data, requestTime);
  //     expect(result).toHaveLength(1);
  //     expect(result[0].name).toBe('valid');
  //   });

  //   it('should sort items by started_at ascending', () => {
  //     const data = {
  //       completed: [
  //         {
  //           name: 'second',
  //           started_at: '2025-12-09T12:00:05.000Z',
  //           finished_at: '2025-12-09T12:00:10.000Z',
  //           children: [{ name: 'child' }]
  //         },
  //         {
  //           name: 'first',
  //           started_at: '2025-12-09T12:00:01.000Z',
  //           finished_at: '2025-12-09T12:00:10.000Z',
  //           children: [{ name: 'child' }]
  //         },
  //         {
  //           name: 'third',
  //           started_at: '2025-12-09T12:00:10.000Z',
  //           finished_at: '2025-12-09T12:00:15.000Z',
  //           children: [{ name: 'child' }]
  //         }
  //       ]
  //     };

  //     const result = preprocess(data, requestTime);
  //     expect(result).toHaveLength(3);
  //     expect(result[0].name).toBe('first');
  //     expect(result[1].name).toBe('second');
  //     expect(result[2].name).toBe('third');
  //   });
});
