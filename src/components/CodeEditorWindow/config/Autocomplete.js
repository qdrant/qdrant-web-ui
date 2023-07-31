import { OpenapiAutocomplete } from 'autocomplete-openapi/src/autocomplete';

export const autocomplete = async (monaco, qdrantClient) => {
  const response = await fetch(import.meta.env.BASE_URL + './openapi.json');
  const openapi = await response.json();

  let collections = [];
  try {
    collections = (await qdrantClient.getCollections()).collections.map((c) => c.name);
  } catch (e) {
    console.error(e);
  }

  const autocomplete = new OpenapiAutocomplete(openapi, collections);

  return {
    provideCompletionItems: (model, position) => {
      // Reuse parsed code blocks to avoid parsing the same code block multiple times
      const selectedCodeBlock = monaco.selectedCodeBlock;

      if (!selectedCodeBlock) {
        return { suggestions: [] };
      }

      const relativeLine = position.lineNumber - selectedCodeBlock.blockStartLine;

      if (relativeLine < 0) {
        // Something went wrong
        return { suggestions: [] };
      }

      if (relativeLine === 0) {
        // Autocomplete for request headers
        const header = selectedCodeBlock.blockText.slice(0, position.column - 1);

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
        const requestLines = selectedCodeBlock.blockText.split(/\r?\n/);

        const lastLine = requestLines[relativeLine].slice(0, position.column - 1);

        const requestHeader = requestLines.shift();

        const requestBodyLines = requestLines.slice(0, relativeLine - 1);

        requestBodyLines.push(lastLine);

        const requestBody = requestBodyLines.join('\n');

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
  };
};
