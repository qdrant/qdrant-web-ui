const keywords = ["POST", "GET", "PUT", "DELETE", "HEAD"];
import data from "./openapi.json";
import { GetCodeBlocks } from "./Rules";

export const Autocomplete = (monaco) => ({
  provideCompletionItems: (model, position) => {
    const textUntilPosition = model.getValueInRange({
      endColumn: position.column,
      endLineNumber: position.lineNumber,
      startColumn: 0,
      startLineNumber: 0,
    });
    const suggestions = getAutocompleteArray(textUntilPosition);

    console.log(suggestions);
    return { suggestions: suggestions }
  },
});


//this functin selects the code block where autoComplete need to done 
export function getLastCodeBlock(codeText) {
  const codeArray = codeText.replace(/\/\/.*$/gm, "").split("\n");
  var block = { blockText: "", blockStartLine: null, blockEndLine: null };
  var backetcount = 0;
  var codeStartLine = 0;
  var codeEndline = 0;
  for (var i = 0; i < codeArray.length; ++i) {
    // dealing for request which have JSON Body
    if (codeArray[i].includes("{")) {
      if (backetcount === 0) {
        codeStartLine = i;
        block.blockText = codeArray[i - 1] + " \n ";
      }
      backetcount = backetcount + codeArray[i].match(/{/gi)?.length;
    }
    if (codeArray[i].includes("}")) {
      backetcount = backetcount - codeArray[i].match(/}/gi)?.length;
      if (backetcount === 0) {
        codeEndline = i + 1;
      }
    }
    if (i === codeArray.length - 1) {
      codeEndline = i + 1;
    }
    if (codeStartLine) {
      block.blockStartLine = codeStartLine;
      block.blockText = block.blockText + codeArray[i];
      if (codeEndline) {
        block.blockEndLine = codeEndline;
        if (i === codeArray.length - 1) {
          return block;
        }
        codeEndline = 0;
        codeStartLine = 0;
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
      if (i === codeArray.length - 1) {
        block.blockText = codeArray[i];
        block.blockStartLine = i + 1;
        block.blockEndLine = i + 1;
        return block;
      }
      block = { blockText: "", blockStartLine: null, blockEndLine: null };
    }
  }
}



export function getAutocompleteArray(textUntilPosition) {
  const block = getLastCodeBlock(textUntilPosition);
  if (block.blockText.split(" ").length === 1) {
    const suggestions = [
      ...keywords.map((k) => {
        return {
          label: "Method:" + k,
          kind: 17,
          insertText: k,
        };
      }),
    ];
    return suggestions;
  }
  else if (block.blockText.split(" ").length === 2 && keywords.includes(block.blockText.split(" ")[0])) {
    const suggestions = [];
    for (var key in data.paths) {
      if (
        key.includes(block.blockText.split(" ")[1].split("/")[0]) &&
        key.split("/")[block.blockText.split(" ")[1].split("/").length]
      ) {
        const path =
          key.split("/")[block.blockText.split(" ")[1].split("/").length];
        if (!suggestions.some(el => el.insertText === path) && !path.includes("{") ) {
          suggestions.push({
            label: path,
            kind: 17,
            insertText: path,
          });
        }
      }
    }
    return suggestions;
  }

  return [];
}

