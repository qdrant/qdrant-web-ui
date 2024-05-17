import { OpenapiAutocomplete } from 'autocomplete-openapi/src/autocomplete';

export const autocomplete = async (monaco, qdrantClient,collectionName) => {
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
  const FilterRequest = {
    description: 'Filter request',
    type: 'object',
    properties: {
      limit: {
        description: 'Page size. Default: 10',
        type: 'integer',
        format: 'uint',
        minimum: 1,
        nullable: true,
      },
      filter: {
        description: 'Look only for points which satisfies this conditions. If not provided - all points.',
        anyOf: [
          {
            $ref: '#/components/schemas/Filter',
          },
          {
            nullable: true,
          },
        ],
      },
      vector_name: {
        description: 'Vector field name',
        type: 'string',
        enum: vectorNames,
      },
      color_by: {
        description: 'Color points by this field',
        type: 'string',
        nullable: true,
      },
    },
  };
  openapi.components.schemas.FilterRequest = FilterRequest;

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

        let suggestions = autocomplete.completeRequestBodyByDataRef('#/components/schemas/FilterRequest', requestBody);
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
