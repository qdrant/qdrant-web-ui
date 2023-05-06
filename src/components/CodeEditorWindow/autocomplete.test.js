import {getAutocompleteArray} from "./config/Autocomplete";
import { describe, it, expect } from "vitest";
import { getLastCodeBlock } from "./config/Autocomplete";

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

describe("Autocomplete", () => {
    it("1st", () => {
        const array = getAutocompleteArray("GET c");
        expect(array).toEqual([
            {
                "label": "metrics",
                "kind": 17,
                "insertText": "metrics"
            },
            {
                "label": "locks",
                "kind": 17,
                "insertText": "locks"
            },
            {
                "label": "cluster",
                "kind": 17,
                "insertText": "cluster"
            },
            {
                "label": "collections",
                "kind": 17,
                "insertText": "collections"
            }
        ]);
    });
    it("2nd", () => {
        const array = getAutocompleteArray("GET collectio");
        expect(array).toEqual([
            {
                "label": "collections",
                "kind": 17,
                "insertText": "collections"
            }
        ]);
    });
    it("3rd", () => {     
        const array = getAutocompleteArray("G");
        expect(array).toEqual(    [
               {
                 insertText: 'POST',
                 kind: 17,
                 label: 'Method:POST',
               },
               {
                 insertText: 'GET',
                 kind: 17,
                 label: 'Method:GET',
               },
               {
                 insertText: 'PUT',
                 kind: 17,
                 label: 'Method:PUT',
               },
               {
                 insertText: 'DELETE',
                 kind: 17,
                 label: 'Method:DELETE',
               },
               {
                 insertText: 'HEAD',
                 kind: 17,
                 label: 'Method:HEAD',
               },
              ]);
    });
    it("3rd", () => {     
        const array = getAutocompleteArray("GET cl");
        expect(array).toEqual(   [
              {
                insertText: 'cluster',
                kind: 17,
                label: 'cluster',
              },
              {
                insertText: 'collections',
                kind: 17,
                label: 'collections',
              },
              ]);
    });
    it("4th", () => {
        const array = getAutocompleteArray("GET loc");
        expect(array).toEqual([

                        {
                          insertText: 'locks',
                          kind: 17,
                          label: 'locks',
                        }
                    
        ]
        );
    });
});


