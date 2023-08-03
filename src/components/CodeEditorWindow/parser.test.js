import { getCodeBlocks, selectBlock } from '../EditorCommon/config/Rules';
import { codeParse } from './config/RequesFromCode';
import { describe, it, expect } from 'vitest';
const testCode = `GET collections

PUT collections/demo1
{
    "vectors":
    {
        "size": 1,
        "distance": "Cosine"
    }
}

GET collections

DELETE collections/demo1

GET collections//single line comment this will be removed

PUT collections/demo1
{
    //line comment 
    //this will be removed
    "vectors":
    {
        "size": 1,
        "distance": "Cosine"
    }
}

GET collections/startups
{
    "vectors":
    {
        "size": 1,, //this should give you error due to double comma improper json and this comment should be ignored/removed
        "distance": "Cosine"
    }
}

{
    "vectors":
    {
        "size": 1,
        "distance": "Cosine"
    }
}

PUT collections/demo1

{
    "vectors":
    {
        "size": 1,
        "distance": "Cosine"
    }
}

`;

describe('parser', () => {
  it('Should extract query blocks from code', () => {
    const requests = getCodeBlocks(testCode);
    expect(requests.length).toEqual(10);
    expect(requests[1].blockStartLine).toEqual(3);
    expect(requests[1].blockEndLine).toEqual(10);
    expect(requests[2].blockStartLine).toEqual(requests[2].blockEndLine);
    expect(requests[3].blockStartLine).toEqual(14);
  });

  it('given an array of blocks and cursor line number: return selected block or null , if cursor is outside', () => {
    const blocks = getCodeBlocks(testCode);

    let block = selectBlock(blocks, 2);

    expect(block).toBeNull();

    block = selectBlock(blocks, 3);
    expect(block).not.toEqual(null);
    expect(block.blockEndLine).toEqual(10);
    expect(block.blockStartLine).toEqual(3);

    block = selectBlock(blocks, 12);
    expect(block).not.toEqual(null);
    expect(block.blockEndLine).toEqual(12);
    expect(block.blockStartLine).toEqual(12);
  });

  it('given block text: convert it into request - url, body, get params', () => {
    const blocks = getCodeBlocks(testCode);

    // PUT collections / demo1
    // {
    //     "vectors":
    //     {
    //         "size": 1,
    //             "distance": "Cosine"
    //     }
    // }
    let block = selectBlock(blocks, 3);
    let requests = codeParse(block.blockText);
    expect(requests.method).toEqual('PUT');
    expect(requests.endpoint).toEqual('collections/demo1');
    expect(requests.error).toEqual(null);
    expect(requests.reqBody).toEqual({
      vectors: { size: 1, distance: 'Cosine' },
    });

    // DELETE collections/demo1
    block = selectBlock(blocks, 14);
    requests = codeParse(block.blockText);
    expect(requests.method).toEqual('DELETE');
    expect(requests.endpoint).toEqual('collections/demo1');
    expect(requests.error).toEqual(null);
    expect(requests.reqBody).toEqual({});

    // GET collections//single line comment this will be removed
    block = selectBlock(blocks, 16);
    requests = codeParse(block.blockText);
    expect(requests.method).toEqual('GET');
    expect(requests.endpoint).toEqual('collections');
    expect(requests.error).toEqual(null);
    expect(requests.reqBody).toEqual({});

    // PUT collections / demo1
    // {
    //     /*Multi line comment (not supported)
    //     this will be removed*/
    //     "vectors":
    //     {
    //         "size": 1,
    //             "distance": "Cosine"
    //     }
    // }
    block = selectBlock(blocks, 18);
    requests = codeParse(block.blockText);
    expect(requests.method).toEqual('PUT');
    expect(requests.endpoint).toEqual('collections/demo1');
    expect(requests.error).toEqual(null);
    expect(requests.reqBody).toEqual({
      vectors: { size: 1, distance: 'Cosine' },
    });

    // GET collections / startups
    // {
    //     "vectors":
    //     {
    //         "size": 1, //this should give you error due to double comma improper json and this comment should be ignored/removed
    //         "distance": "Cosine"
    //     }
    // }
    block = selectBlock(blocks, 29);
    requests = codeParse(block.blockText);
    expect(requests.method).toEqual(null);
    expect(requests.endpoint).toEqual(null);
    expect(requests.error).toEqual('Fix the Position brackets to run & check the json');

    // 38
    // {
    //     "vectors":
    //     {
    //         "size": 1,
    //         "distance": "Cosine"
    //     }
    // }
    block = selectBlock(blocks, 38);
    requests = codeParse(block.blockText);
    expect(requests.method).toEqual(null);
    expect(requests.endpoint).toEqual(null);
    expect(requests.error).toEqual('Add Headline or remove the line gap between json and headline (if any)');

    // 47
    // PUT collections/demo1
    //   //47 this line should be ignored
    // {
    //     "vectors":
    //     {
    //         "size": 1,
    //         "distance": "Cosine"
    //     }
    // }
    block = selectBlock(blocks, 47);
    requests = codeParse(block.blockText);
    expect(requests.method).toEqual(null);
    expect(requests.endpoint).toEqual(null);
    expect(requests.error).toEqual('Add Headline or remove the line gap between json and headline (if any)');
  });
});
