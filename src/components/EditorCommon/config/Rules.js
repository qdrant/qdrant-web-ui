import { OpenapiDocs } from 'autocomplete-openapi/src/request-docs';
import openapi from '/openapi.json??url&raw';

const Method = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
const DOCS_BASE_URL = 'https://api.qdrant.tech/api-reference/';

const apiDocs = new OpenapiDocs(JSON.parse(openapi));

export const Rules = {
  Method,
  tokenizer: {
    root: [
      [
        /@?[a-zA-Z][\w$]*/,
        {
          cases: {
            '@Method': 'keyword',

            '@default': 'variable',
          },
        },
      ],

      [/".*?"/, 'string'],

      [/\/\/.*/, 'comment'],
    ],
  },
};

export const langConfig = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
  ],
  indentationRules: {
    increaseIndentPattern: /{\s*$/,
    decreaseIndentPattern: /^\s*}/,
  },
};

export const options = {
  scrollBeyondLastLine: false,
  readOnly: false,
  fontSize: 12,
  wordWrap: 'on',
  minimap: { enabled: false },
  automaticLayout: true,
  mouseWheelZoom: true,
  glyphMargin: true,
  wordBasedSuggestions: false,
  scrollbar: {
    verticalScrollbarSize: 7,
    horizontalScrollbarSize: 7,
  },
};

export function btnconfig(commandId, beutifyCommandId, docsCommandId) {
  return {
    // function takes model and token as arguments
    provideCodeLenses: function (model) {
      const codeBlocks = getCodeBlocks(model.getValue());
      const lenses = [];

      for (let i = 0; i < codeBlocks.length; ++i) {
        const range = {
          startLineNumber: codeBlocks[i].blockStartLine,
          startColumn: 1,
          endLineNumber: codeBlocks[i].blockStartLine,
          endColumn: 1,
        };

        lenses.push({
          range,
          id: 'RUN',
          command: {
            id: commandId,
            title: 'RUN',
            arguments: [codeBlocks[i].blockText],
          },
        });

        lenses.push({
          range,
          id: 'BEAUTIFY',
          command: {
            id: beutifyCommandId,
            title: 'BEAUTIFY',
            arguments: [codeBlocks[i]],
          },
        });

        const terminal = apiDocs.getRequestDocs(codeBlocks[i].blockText.split('\n')[0]);
        if (terminal) {
          const operationId = terminal.operationId.replace('_', '-').toLowerCase();
          const tag = terminal.tags[0].toLowerCase();
          const docsURL = DOCS_BASE_URL + tag + '/' + operationId;
          lenses.push({
            range,
            id: 'DOCS',
            command: {
              id: docsCommandId,
              title: 'DOCS',
              arguments: [docsURL],
            },
          });
        }
      }

      return {
        lenses: lenses,
        dispose: () => {},
      };
    },
    // function takes model, codeLens and token as arguments
    resolveCodeLens: function (model, codeLens) {
      return codeLens;
    },
  };
}

export function selectBlock(blocks, location) {
  for (let i = 0; i < blocks.length; ++i) {
    if (blocks[i].blockStartLine <= location && location <= blocks[i].blockEndLine) {
      return blocks[i];
    }
  }
  return null;
}

/*
A function which parses text into blocks of code.

Each block is an HTTP request, which starts with a method (GET, POST, etc) and optionally has a JSON body.

Example of code block:

```
POST collections/collection_name/points/scroll
{
  "limit": 10,
  "filter": {
    "must":{
      "key": "city",
      "match": {
        "value": "Berlin"
      }
    }
  }
}
```

Function should find all such blocks in the text and return them as an array of objects.
Example of return value:

```
[
  {
    blockText: '<here full text of the block>',
    blockStartLine: 7,
    blockEndLine: 16
  }
]
```

All other lines should be ignored.

Example of input text:

```
// List all collections
GET collections

// Get collection info
GET collections/collection_name

// List points in a collection, using filter
POST collections/collection_name/points/scroll
{
  "limit": 10
}

unrelated text
```

Example of return value:

```
[
  {
    blockText: 'GET collections',
    blockStartLine: 1,
    blockEndLine: 1
  },
  {
    blockText: 'GET collections/collection_name',
    blockStartLine: 3,
    blockEndLine: 3
  },
  {
    blockText: 'POST collections/collection_name/points/scroll\n{\n  "limit": 10\n}',
    blockStartLine: 7,
    blockEndLine: 10
  }
]

*/
export function getCodeBlocks(text) {
  // Define HTTP methods
  const HTTP_METHODS = new Set(Method);

  const lines = text.split(/\r?\n/);
  const blocks = [];
  const totalLines = lines.length;
  let i = 0;

  while (i < totalLines) {
    const line = lines[i].trim();
    if (line === '') {
      i++;
      continue; // Ignore empty lines
    }

    // Split the line by whitespace to get the first word
    const firstWord = line.split(/\s+/)[0].toUpperCase();

    if (HTTP_METHODS.has(firstWord)) {
      const blockStartLine = i + 1; // 1-based indexing
      let blockText = lines[i];
      let blockEndLine = blockStartLine;

      // Check if next line exists and starts with '{'
      let j = i + 1;
      if (j < totalLines && lines[j].trim().startsWith('{')) {
        // Start of JSON body
        const jsonLines = [];
        let braceCount = 0;
        while (j < totalLines) {
          const currentLine = lines[j];
          jsonLines.push(currentLine);
          // Count braces to find the matching closing brace
          for (const char of currentLine) {
            if (char === '{') braceCount++;
            else if (char === '}') braceCount--;
          }
          if (braceCount === 0) {
            break; // Found the closing brace
          }
          j++;
        }

        if (braceCount !== 0) {
          // JSON body is not closed
          i++;
          continue;
        }
        blockText += '\n' + jsonLines.join('\n');
        blockEndLine = j + 1;
        i = j + 1;
      } else {
        // No JSON body
        i++;
      }

      blocks.push({
        blockText: blockText,
        blockStartLine: blockStartLine,
        blockEndLine: blockEndLine,
      });
    } else {
      // Not a code block start
      i++;
    }
  }

  return blocks;
}
