import qdrantClient from "../../../common/client";
import { OpenapiAutocomplete } from "autocomplete-openapi/src/autocomplete";

const keywords = ["POST", "GET", "PUT", "DELETE", "HEAD"];


export const Autocomplete = async (monaco) => {

  let response = await fetch("./openapi.json");
  let openapi = await response.json();

  let collections = [];
  try {
    collections = (await qdrantClient().getCollections()).collections.map((c) => c.name);
  } catch (e) {
    console.error(e);
  }

  let autocomplete = new OpenapiAutocomplete(openapi, collections);

  return {
    provideCompletionItems: (model, position) => {

      // Reuse parsed code blocks to avoid parsing the same code block multiple times
      let selectedCodeBlock = monaco.selectedCodeBlock;

      if (!selectedCodeBlock) {
        return { suggestions: [] };
      }

      let relativeLine = position.lineNumber - selectedCodeBlock.blockStartLine;

      if (relativeLine < 0) {
        // Something went wrong
        return { suggestions: [] };
      }

      if (relativeLine === 0) {
        // Autocomplete for request headers
        let header = selectedCodeBlock.blockText.slice(0, position.column - 1);

        let suggestions = autocomplete.completeRequestHeader(header);

        suggestions = suggestions.map((s) => {
          return {
            label: s,
            kind: 17,
            insertText: s,
          };
        });

        return { suggestions: suggestions };
      } else {
        // Autocomplete for request body
        let requestLines = selectedCodeBlock.blockText.split("\n");

        let lastLine = requestLines[relativeLine].slice(0, position.column - 1);

        let requestHeader = requestLines.shift();

        let requestBodyLines = requestLines.slice(0, relativeLine - 1);

        requestBodyLines.push(lastLine);

        let requestBody = requestBodyLines.join("\n");

        let suggestions = autocomplete.completeRequestBody(requestHeader, requestBody);

        suggestions = suggestions.map((s) => {
          return {
            label: s,
            kind: 17,
            insertText: s,
          };
        });

        return { suggestions: suggestions };
      }
    },
  }
};
