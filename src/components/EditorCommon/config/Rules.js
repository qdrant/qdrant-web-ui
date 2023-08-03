const Method = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

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
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
  ],
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
};

export function btnconfig(commandId, beutifyCommandId) {
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

export function getCodeBlocks(codeText) {
  const codeArray = codeText.split(/\r?\n/);
  const blocksArray = [];
  let block = { blockText: '', blockStartLine: null, blockEndLine: null };
  let backetcount = 0;
  let codeStarLine = 0;
  let codeEndline = 0;
  for (let i = 0; i < codeArray.length; ++i) {
    // dealing for request which have JSON Body
    if (codeArray[i].includes('{')) {
      if (backetcount === 0) {
        codeStarLine = i;
        block.blockText = codeArray[i - 1] + ' \n ';
      }
      backetcount = backetcount + codeArray[i].match(/{/gi).length;
    }
    if (codeArray[i].includes('}')) {
      backetcount = backetcount - codeArray[i].match(/}/gi).length;
      if (backetcount === 0) {
        codeEndline = i + 1;
      }
    }
    if (codeStarLine) {
      block.blockStartLine = codeStarLine;
      block.blockText = block.blockText + codeArray[i] + '\n';
      if (codeEndline) {
        block.blockEndLine = codeEndline;
        blocksArray.push(block);
        codeEndline = 0;
        codeStarLine = 0;
        block = { blockText: '', blockStartLine: null, blockEndLine: null };
      }
    }

    // dealing for request which don't have JSON Body
    if (
      codeArray[i].replace(/\s/g, '').length &&
      backetcount === 0 &&
      !codeArray[i].includes('}') &&
      !codeArray[i + 1]?.includes('{')
    ) {
      block.blockText = codeArray[i];
      block.blockStartLine = i + 1;
      block.blockEndLine = i + 1;
      blocksArray.push(block);
      block = { blockText: '', blockStartLine: null, blockEndLine: null };
    }
  }
  return blocksArray;
}
