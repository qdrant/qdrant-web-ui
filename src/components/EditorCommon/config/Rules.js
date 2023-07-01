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