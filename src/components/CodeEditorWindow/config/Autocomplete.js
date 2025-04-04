import { OpenapiAutocomplete } from 'autocomplete-openapi/src/autocomplete';
import { enhanceSnippet } from './snippetEnhancer';
import { customSnippets } from './customSnippets';

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
  let snippets = autocomplete.getSnippets();
  snippets = [...snippets, ...customSnippets];
  snippets = snippets.map((snippet) => {
    snippet.insertText = enhanceSnippet(snippet.insertText, collections);
    return snippet;
  });

  return {
    provideCompletionItems: (model, position) => {
      let suggestions = [];
      // Reuse parsed code blocks to avoid parsing the same code block multiple times
      const selectedCodeBlock = monaco.editor.selectedCodeBlock;

      if (!selectedCodeBlock) {
        suggestions = [
          ...suggestions,
          {
            label: 'POST',
            kind: 17,
            insertText: 'POST',
          },
          {
            label: 'GET',
            kind: 17,
            insertText: 'GET',
          },
          {
            label: 'PUT',
            kind: 17,
            insertText: 'PUT',
          },
          {
            label: 'DELETE',
            kind: 17,
            insertText: 'DELETE',
          },
          {
            label: 'PATCH',
            kind: 17,
            insertText: 'PATCH',
          },
        ];
        const word = model.getWordUntilPosition(position);
        snippets.forEach((snippet) => {
          suggestions.push({
            label: snippet.documentation,
            kind: 1,
            documentation: snippet.documentation,
            insertText: snippet.insertText,
            insertTextRules: 4,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: 0,
              endColumn: word.endColumn,
            },
          });
        });

        return { suggestions };
      }

      const relativeLine = position.lineNumber - selectedCodeBlock.blockStartLine;

      if (relativeLine < 0) {
        // Something went wrong
        return { suggestions: [] };
      }

      if (relativeLine === 0) {
        // Autocomplete for request headers
        const header = selectedCodeBlock.blockText.slice(0, position.column - 1);

        suggestions = autocomplete.completeRequestHeader(header);

        suggestions = suggestions
          .filter((s) => s !== '')
          .map((s) => {
            return {
              label: s,
              kind: 17,
              insertText: s,
            };
          });

        return { suggestions };
      } else {
        // Autocomplete for request body
        const requestLines = selectedCodeBlock.blockText.split(/\r?\n/);

        const lastLine = requestLines[relativeLine].slice(0, position.column - 1);

        const requestHeader = requestLines.shift();

        const requestBodyLines = requestLines.slice(0, relativeLine - 1);

        requestBodyLines.push(lastLine);

        const requestBody = requestBodyLines.join('\n');

        let suggestions = autocomplete.completeRequestBody(requestHeader, requestBody);

        suggestions = suggestions.reduce((acc, s) => {
          if (acc.findIndex((a) => a.label === s) === -1) {
            acc.push({
              label: s,
              kind: 17,
              insertText: s,
            });
          }
          return acc;
        }, []);

        return { suggestions };
      }
    },
    triggerCharacters: ['/', '"', ': ', ' '],
  };
};
