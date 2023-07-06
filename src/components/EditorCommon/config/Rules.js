const Method = ["POST", "GET", "PUT", "DELETE", "PATCH", "HEAD"];

export const Rules = {
  Method,
  tokenizer: {
    root: [
      [
        /@?[a-zA-Z][\w$]*/,
        {
          cases: {
            "@Method": "keyword",

            "@default": "variable",
          },
        },
      ],

      [/".*?"/, "string"],

      [/\/\/.*/, "comment"],
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
  wordWrap: "on",
  minimap: { enabled: false },
  automaticLayout: true,
  mouseWheelZoom: true,
  glyphMargin: true,
  wordBasedSuggestions: false,
};

export function btnconfig(commandId, beutifyCommandId) {
  return {
    provideCodeLenses: function (model, token) {
      let codeBlocks = GetCodeBlocks(model.getValue());
      let lenses = [];

      for (var i = 0; i < codeBlocks.length; ++i) {
        let range = {
          startLineNumber: codeBlocks[i].blockStartLine,
          startColumn: 1,
          endLineNumber: codeBlocks[i].blockStartLine,
          endColumn: 1,
        }

        lenses.push({
          range,
          id: "RUN",
          command: {
            id: commandId,
            title: "RUN",
            arguments: [codeBlocks[i].blockText],
          },
        });

        lenses.push({
          range,
          id: "BEAUTIFY",
          command: {
            id: beutifyCommandId,
            title: "BEAUTIFY",
            arguments: [codeBlocks[i]],
          },
        });

      }

      return {
        lenses: lenses,
        dispose: () => {},
      };
    },
    resolveCodeLens: function (model, codeLens, token) {
      return codeLens;
    },
  };
}

export function selectBlock(blocks, location) {
  for (var i = 0; i < blocks.length; ++i) {
    if (
      blocks[i].blockStartLine <= location &&
      location <= blocks[i].blockEndLine
    ) {
      return blocks[i];
    }
  }
  return null;
}

export function GetCodeBlocks(codeText) {
  const codeArray = codeText.replace(/\/\/.*$/gm, "").split(/\r?\n/);
  var blocksArray = [];
  var block = { blockText: "", blockStartLine: null, blockEndLine: null };
  var backetcount = 0;
  var codeStarLine = 0;
  var codeEndline = 0;
  for (var i = 0; i < codeArray.length; ++i) {
    // dealing for request which have JSON Body
    if (codeArray[i].includes("{")) {
      if (backetcount === 0) {
        codeStarLine = i;
        block.blockText = codeArray[i - 1] + " \n ";
      }
      backetcount = backetcount + codeArray[i].match(/{/gi).length;
    }
    if (codeArray[i].includes("}")) {
      backetcount = backetcount - codeArray[i].match(/}/gi).length;
      if (backetcount === 0) {
        codeEndline = i + 1;
      }
    }
    if (codeStarLine) {
      block.blockStartLine = codeStarLine;
      block.blockText = block.blockText + codeArray[i] + "\n";
      if (codeEndline) {
        block.blockEndLine = codeEndline;
        blocksArray.push(block);
        codeEndline = 0;
        codeStarLine = 0;
        block = { blockText: "", blockStartLine: null, blockEndLine: null };
      }
    }

    // dealing for request which don't have JSON Body
    if (
      codeArray[i].replace(/\s/g, "").length &&
      backetcount === 0 &&
      !codeArray[i].includes("}") &&
      !codeArray[i + 1]?.includes("{")
    ) {
      block.blockText = codeArray[i];
      block.blockStartLine = i + 1;
      block.blockEndLine = i + 1;
      blocksArray.push(block);
      block = { blockText: "", blockStartLine: null, blockEndLine: null };
    }
  }
  return blocksArray;
}
