import { OpenapiAutocomplete } from "autocomplete-openapi/src/autocomplete";

export const Autocomplete = async (monaco, qdrantClient) => {

  let response = await fetch(import.meta.env.BASE_URL + "./openapi.json");
  let openapi = await response.json();

  let collections = [];
  try {
    collections = (await qdrantClient.getCollections()).collections.map((c) => c.name);
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

      if (relativeLine > 0) {
        // Autocomplete for request body
        let requestLines = selectedCodeBlock.blockText.split(/\r?\n/);

        let lastLine = requestLines[relativeLine].slice(0, position.column);

        let requestBodyLines = requestLines.slice(0, relativeLine);

        requestBodyLines.push(lastLine);

        let requestBody = requestBodyLines.join("\n");

        if ('"color_by"'.indexOf(lastLine.trim()) === 0) {
          return {
            suggestions: [{
              label: 'color_by":',
              kind: 17,
              insertText: 'color_by":',
            }]
          };
        }
        if ('"vector_name"'.indexOf(lastLine.trim()) === 0) {
          return {
            suggestions: [{
              label: 'vector_name":',
              kind: 17,
              insertText: 'vector_name":',
            }]
          };
        }

        let suggestions = autocomplete.completeRequestBody("POST collections/collection_name/points/scroll", requestBody);
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
