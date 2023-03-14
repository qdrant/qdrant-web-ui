
const keywords=["POST", "GET", "PUT","DELETE" ,"HEAD" ,"collections"];
export const Autocomplete = {
    provideCompletionItems: (model, position) => {
        const suggestions
            =
            [
                ...keywords.map(k => {
                    return {
                        label: "Method:" +k,
                        kind: "monaco.languages.CompletionItemKind.Keyword",
                        insertText: k,
                    };
                })
            ];
        return { suggestions: suggestions };
    }
}