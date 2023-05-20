const keywords = ["POST", "GET", "PUT", "DELETE", "HEAD"];
import data from "./openapi.json";

export const Autocomplete = (monaco) => ({
  provideCompletionItems: (model, position) => {
    const textUntilPosition = model.getValueInRange({
      endColumn: position.column,
      endLineNumber: position.lineNumber,
      startColumn: 0,
      startLineNumber: 0,
    });
    const suggestions = getAutocompleteArray(textUntilPosition);
    return { suggestions: suggestions };
  },
});

function getPath(Path) {
  var sol = "";
  for (var key in data.paths) {
    if (key.includes("{") && key.includes("}") && key.split("/").length === Path.split("/").length) {
      const keyarrays = key.split("/");
      const patharrays = Path.split("/");
      for (var i = 0; i < keyarrays.length; i++) {
        if (keyarrays[i] !== patharrays[i] && !(keyarrays[i].includes("{") && keyarrays[i].includes("}"))) {
          break;
        }
        if (i === keyarrays.length - 1) {
          if (sol.match(/{/gi)?.length > key.match(/{/gi)?.length || sol === "") {
            sol = key;
          }
        }
      }


    }
    else if (key === Path) {
      return key;
    }
  }
  return sol;
}

//this functin selects the code block where autoComplete need to done
export function getLastCodeBlock(codeText) {
  const codeArray = codeText.replace(/\/\/.*$/gm, "").split("\n");
  var block = { blockText: "", blockStartLine: null, blockEndLine: null };
  var backetcount = 0;
  var codeStartLine = 0;
  var codeEndline = 0;
  var level = [];
  for (var i = 0; i < codeArray.length; ++i) {
    // dealing for request which have JSON Body
    if (codeArray[i].includes("{")) {
      if (backetcount === 0) {
        codeStartLine = i;
        block.blockText = codeArray[i - 1] + "\n ";
      }
      backetcount = backetcount + codeArray[i].match(/{/gi)?.length;
    }
    if (codeArray[i].includes("}")) {
      backetcount = backetcount - codeArray[i].match(/}/gi)?.length;
      if (backetcount === 0) {
        codeEndline = i + 1;
      }
      level.pop()
    }
    if (i === codeArray.length - 1) {
      codeEndline = i + 1;
    }
    if (codeStartLine) {
      block.blockStartLine = codeStartLine;
      block.blockText = block.blockText + codeArray[i];
      if (codeArray[i].includes("{") && codeStartLine !== i) {
        level.push(block.blockText.match(/".*?"/gi)[block.blockText.match(/".*?"/gi).length - 1].replace(/"/g, ""))
      }
      if (codeEndline) {
        block.blockEndLine = codeEndline;
        if (i === codeArray.length - 1) {
          block.level = level;
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
  if (block.blockText.split("\n").length === 1) {
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
    } else if (
      block.blockText.split(" ").length === 2 &&
      keywords.includes(block.blockText.split(" ")[0])
    ) {
      const suggestions = [];
      for (var key in data.paths) {
        if (
          key.includes(block.blockText.split(" ")[1].split("/")[0]) &&
          key.split("/")[block.blockText.split(" ")[1].split("/").length]
        ) {
          const path =
            key.split("/")[block.blockText.split(" ")[1].split("/").length];
          if (
            !suggestions.some((el) => el.insertText === path) &&
            !path.includes("{")
          ) {
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
  }
  else if (block.blockText.split("\n").length === 2) {
    const suggestions = [];
    if (block.blockText.split("\n")[0].split(" ").length === 2) {
      var Method = block.blockText.split("\n")[0].split(" ")[0];
      var Path = `/${block.blockText.split("\n")[0].split(" ")[1]}`;
      Path = getPath(Path);
      if (data.paths[Path][Method.toLowerCase()].requestBody?.content["application/json"].schema) {
        let schemaName = data.paths[Path][Method.toLowerCase()].requestBody?.content["application/json"].schema.$ref;
        schemaName = schemaName.split("/")[schemaName.split("/").length - 1];
        var schema = data.components.schemas[schemaName];
        for (var i = 0; i < block.level.length; i++) {
          schemaName = schema.properties[block.level[i]].$ref || schema.properties[block.level[i]].anyOf[0].$ref;
          console.log(schemaName)
          schemaName = schemaName.split("/")[schemaName.split("/").length - 1];
          schema = data.components.schemas[schemaName];
        }
        if (schema.properties) {
          for (var key in schema.properties) {
            suggestions.push({
              label: key,
              kind: 17,
              insertText: key,
              documentation: schema.properties[key].description,
            });
          }
        }
        while (schema.anyOf) {
          for (var i = 0; i < schema.anyOf?.length; i++) {
            if (schema.anyOf[i].$ref) {
              schemaName = schema.anyOf[i].$ref;
              schemaName = schemaName.split("/")[schemaName.split("/").length - 1];
              schema = data.components.schemas[schemaName];
              if (schema.properties) {
                for (var key in schema.properties) {
                  suggestions.push({
                    label: key,
                    kind: 17,
                    insertText: key,
                    documentation: schema.properties[key].description,
                  });
                }
              }
            }
          }
        }

      }
    }
    return suggestions;

  }
  return [];
}
