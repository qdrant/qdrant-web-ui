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

export function btnconfig(commandId) {
  return {
    // function takes model and token as arguments
    provideCodeLenses: function (model) {
      const codeBlocks = getCodeBlocks(model.getValue());
      const lenses = [];

      for (let i = 0; i < codeBlocks.length; ++i) {
        lenses.push({
          range: {
            startLineNumber: codeBlocks[i].blockStartLine,
            startColumn: 1,
            endLineNumber: codeBlocks[i].blockStartLine,
            endColumn: 1,
          },
          id: 'RUN',
          command: {
            id: commandId,
            title: 'RUN',
            arguments: [codeBlocks[i].blockText],
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
  const codeArray = codeText.replace(/\/\/.*$/gm, '').split(/\r?\n/);
  const blocksArray = [];
  let block = { blockText: '', blockStartLine: null, blockEndLine: null };
  let backetcount = 0;
  let codeStarLine = 0;
  let codeEndline = 0;
  for (let i = 0; i < codeArray.length; ++i) {
    // dealing for request which have JSON Body
    if (codeArray[i].includes('{')) {
      if (backetcount === 0) {
        codeStarLine = i + 1;
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
  }
  return blocksArray;
}
