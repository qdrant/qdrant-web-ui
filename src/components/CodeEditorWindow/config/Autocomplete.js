const keywords = ["POST", "GET", "PUT", "DELETE", "HEAD"];
import data from "./openapi.json";

export const Autocomplete = (monaco) => ({
  provideCompletionItems: (model, position) => {
    const textUntilPosition = model.getValueInRange({
      endColumn: position.column,
      endLineNumber: position.lineNumber,
      startColumn: 0,
      startLineNumber: position.lineNumber,
    });
    if (textUntilPosition.split(" ").length === 1) {
      const suggestions = [
        ...keywords.map((k) => {
          return {
            label: "Method:" + k,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: k,
          };
        }),
      ];
      return { suggestions: suggestions };
    } else if (textUntilPosition.split(" ").length === 2) {
      const suggestions = [];
      for (var key in data.paths) {
        if (
          key.includes(textUntilPosition.split(" ")[1].split("/")[0]) &&
          key.split("/")[textUntilPosition.split(" ")[1].split("/").length]
        ) {
          console.log(textUntilPosition.split(" ")[1].split("/").length);

          const path =
            key.split("/")[textUntilPosition.split(" ")[1].split("/").length];
          suggestions.push({
            label: path,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: path,
          });
        }
      }
      return { suggestions: suggestions };
    }

    return { suggestions: [] };
  },
});
