let testCode = `GET collections

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
    /*Multi line comment 
    this will be removed*/
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

import { GetCodeBlocks, HighlightText } from "./config/Rules";
import { codeParse } from "./config/RequesFromCode";

describe('parser', () => {
    it('Should extract query blocks from code', () => {
        let requests = GetCodeBlocks(testCode);
        expect(requests.length).toEqual(10);
        expect(requests[1].blockStartLine).toEqual(3);
        expect(requests[1].blockEndLine).toEqual(10);
        expect(requests[2].blockStartLine).toEqual(requests[2].blockEndLine);
        expect(requests[3].blockStartLine).toEqual(14);
    });
    it('given an array of blocks and cursor line number: return selected block or nothing [0,0,""] , if cursor is outside', () => {
        let requests = HighlightText({ lineNumber: 2 }, testCode);
        expect(requests.length).toEqual(3);
        expect(requests[1]).toEqual(0);
        expect(requests[0]).toEqual(0);
        requests = HighlightText({ lineNumber: 3 }, testCode);
        expect(requests.length).toEqual(3);
        expect(requests[1]).toEqual(10);
        expect(requests[0]).toEqual(3);
        requests = HighlightText({ lineNumber: 12 }, testCode);
        expect(requests.length).toEqual(3);
        expect(requests[1]).toEqual(12);
        expect(requests[0]).toEqual(12);
    })
    it("given block text: convert it into request - url, body, get params", () => {

        // PUT collections / demo1
        // {
        //     "vectors":
        //     {
        //         "size": 1,
        //             "distance": "Cosine"
        //     }
        // }
        let range = HighlightText({ lineNumber: 3 }, testCode);
        let requests = codeParse(range[2]);
        expect(requests.method).toEqual("PUT");
        expect(requests.endpoint).toEqual("collections/demo1");
        expect(requests.error).toEqual(null);
        expect(requests.reqBody).toEqual({ "vectors": { "size": 1, "distance": "Cosine" } })

        // DELETE collections/demo1
        range = HighlightText({ lineNumber: 14 }, testCode);
        requests = codeParse(range[2]);
        expect(requests.method).toEqual("DELETE");
        expect(requests.endpoint).toEqual("collections/demo1");
        expect(requests.error).toEqual(null);
        expect(requests.reqBody).toEqual({})

        //GET collections//single line comment this will be removed
        range = HighlightText({ lineNumber: 16 }, testCode);
        requests = codeParse(range[2]);
        expect(requests.method).toEqual("GET");
        expect(requests.endpoint).toEqual("collections");
        expect(requests.error).toEqual(null);
        expect(requests.reqBody).toEqual({})

         
        // PUT collections / demo1
        // {
        //     /*Multi line comment 
        //     this will be removed*/
        //     "vectors":
        //     {
        //         "size": 1,
        //             "distance": "Cosine"
        //     }
        // }
        range = HighlightText({ lineNumber: 18 }, testCode);
        requests = codeParse(range[2]);
        expect(requests.method).toEqual("PUT");
        expect(requests.endpoint).toEqual("collections/demo1");
        expect(requests.error).toEqual(null);
        expect(requests.reqBody).toEqual({ "vectors": { "size": 1, "distance": "Cosine" } })


        // GET collections / startups
        // {
        //     "vectors":
        //     {
        //         "size": 1,, //this should give you error due to double comma improper json and this comment should be ignored/removed
        //             "distance": "Cosine"
        //     }
        // }
        range = HighlightText({ lineNumber: 29 }, testCode);
        requests = codeParse(range[2]);
        expect(requests.method).toEqual(null);
        expect(requests.endpoint).toEqual(null);
        expect(requests.error).toEqual("Fix the Position brackets to run & check the json");
        expect(requests.reqBody).toEqual(null)

        //38
        // {
        //     "vectors":
        //     {
        //         "size": 1,
        //         "distance": "Cosine"
        //     }
        // }
        range = HighlightText({ lineNumber: 38 }, testCode);
        requests = codeParse(range[2]);
        expect(requests.method).toEqual(null);
        expect(requests.endpoint).toEqual(null);
        expect(requests.error).toEqual("Add headline or remove the line gap between json and headline (if any)");
        expect(requests.reqBody).toEqual(null)
        //47
        // PUT collections/demo1
        
        // {
        //     "vectors":
        //     {
        //         "size": 1,
        //         "distance": "Cosine"
        //     }
        // }
        range = HighlightText({ lineNumber: 47 }, testCode);
        requests = codeParse(range[2]);
        expect(requests.method).toEqual(null);
        expect(requests.endpoint).toEqual(null);
        expect(requests.error).toEqual("Add headline or remove the line gap between json and headline (if any)");
        expect(requests.reqBody).toEqual(null)
    })
});

