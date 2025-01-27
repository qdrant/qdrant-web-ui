import { describe, it, expect } from 'vitest';
import { getCodeBlocks } from '../config/Rules';

describe('get-code-blocks', () => {
  it('should return 4 code blocks', () => {
    const codeText = `
// List all collections
GET collections

// Get collection info
GET collections/collection_name

// List points in a collection, using filter
POST collections/collection_name/points/scroll
{
  "limit": 10,
  "filter": {
    "must": [
      {
        "key": "city",
        "match": {
          "any": [
            "San Francisco",
            "New York",
            "Berlin"
          ]
        }
      }
    ]
  }
}

lalal something unrelated

GET collections/collection_name/points/{point_id}
`;
    let blocks = getCodeBlocks(codeText);

    expect(blocks.length).toBe(4);
  });

  it('should return 1 code block with correct start and end lines', () => {
    const codeText = `
// List all collections
GET collections

// Get collection info
THIS IS NOT A CODE BLOCK
{
    lalalal
}

`;

    let blocks = getCodeBlocks(codeText);

    expect(blocks.length).toBe(1);
    expect(blocks[0].blockStartLine).toBe(3);
    expect(blocks[0].blockEndLine).toBe(3);
  });

  it('incomplete block should be ignored', () => {
    const codeText = `
// List all collections
GET collections

// Scrolling through points
POST collections/collection_name/points/scroll
{
  "limit": 10

This is not a complete block

// Get point info
GET collections/collection_name/points/{point_id}

`;
    let blocks = getCodeBlocks(codeText);

    expect(blocks.length).toBe(2);

    expect(blocks[0].blockStartLine).toBe(3);
    expect(blocks[0].blockEndLine).toBe(3);
    // The incomplete block should be ignored
    // Go straight to the next block
    expect(blocks[1].blockStartLine).toBe(13);
    expect(blocks[1].blockEndLine).toBe(13);
  });
});
