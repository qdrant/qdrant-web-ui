import { OpenapiAutocomplete } from 'autocomplete-openapi/src/autocomplete';

export const autocomplete = async (monaco, qdrantClient, collectionName, customRequestSchema) => {
  const response = await fetch(import.meta.env.BASE_URL + './openapi.json');
  const openapi = await response.json();

  const vectorNames = [];
  try {
    const collectionInfo = await qdrantClient.getCollection(collectionName);
    Object.keys(collectionInfo.config.params.vectors).map((key) => {
      if (typeof collectionInfo.config.params.vectors[key] === 'object') {
        vectorNames.push(key);
      }
    });
  } catch (e) {
    console.error(e);
  }

  openapi.components.schemas.CustomRequest = customRequestSchema(vectorNames);

  const autocomplete = new OpenapiAutocomplete(openapi, []);

  return {
    provideCompletionItems: (model, position) => {
      // Reuse parsed code blocks to avoid parsing the same code block multiple times
      const selectedCodeBlock = monaco.editor.selectedCodeBlock;
      if (!selectedCodeBlock) {
        return { suggestions: [] };
      }
      const relativeLine = position.lineNumber - selectedCodeBlock.blockStartLine;

      if (relativeLine < 0) {
        // Something went wrong
        return { suggestions: [] };
      }

      if (relativeLine > 0) {
        // Autocomplete for request body
        const requestLines = selectedCodeBlock.blockText.split(/\r?\n/);

        const lastLine = requestLines[relativeLine].slice(0, position.column);

        const requestBodyLines = requestLines.slice(0, relativeLine);

        requestBodyLines.push(lastLine);

        const requestBody = requestBodyLines.join('\n');

        let suggestions = autocomplete.completeRequestBodyByDataRef('#/components/schemas/CustomRequest', requestBody);
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
