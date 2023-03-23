const Method = ["POST", "GET", "PUT", "DELETE", "HEAD"];

export const Rules = {
    base: 'json',
    Method,
    tokenizer: {
        root: [
            [/@?[a-zA-Z][\w$]*/, {
                cases: {
                    '@Method': 'keyword',

                    '@default': 'variable',
                }
            }],

            [/".*?"/, 'string'],

            [/\/\//, 'comment'],
        ]
    }
}

export const options = {
    scrollBeyondLastLine: false,
    readOnly: false,
    fontSize: 12,
    wordWrap: "on",
    minimap: { enabled: false },
    automaticLayout: true,
    mouseWheelZoom: true,
    glyphMargin: true,
}

export function btnconfig(range, commandId) {
    return ({
        provideCodeLenses: function (model, token) {
            return {
                lenses: [
                    {
                        range: {
                            startLineNumber: range[0],
                            startColumn: 1,
                            endLineNumber: range[0],
                            endColumn: 1,
                        },
                        id: "RUN",
                        command: {
                            id: commandId,
                            title: "RUN",
                        },
                    },
                ],
                dispose: () => { },
            };
        },
        resolveCodeLens: function (model, codeLens, token) {
            return codeLens;
        },
    })
}

export function HighlightText(location, code) {
    const blocksArray = GetCodeBlocks(code);
    for (var i = 0; i < blocksArray.length; ++i) {
        if (blocksArray[i].blockStartLine <= location.lineNumber &&location.lineNumber<=blocksArray[i].blockEndLine) {
            return [blocksArray[i].blockStartLine, blocksArray[i].blockEndLine, blocksArray[i].blockText] 
        }
    }
    return[0,0,""]
}

export function GetCodeBlocks(codeText) {
    const codeArray = codeText.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g,'').trim().split("\n");
    var blocksArray = [];
    var block = { blockText: "", blockStartLine: null, blockEndLine: null }
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
            block.blockText = block.blockText + codeArray[i];
            if (codeEndline) {
                block.blockEndLine = codeEndline;
                blocksArray.push(block);
                codeEndline = 0
                codeStarLine = 0
                block = { blockText: "", blockStartLine: null, blockEndLine: null }
            }
        }

        // dealing for request which don't have JSON Body
        if (codeArray[i].replace(/\s/g, '').length && backetcount === 0 && !codeArray[i].includes("}") && !codeArray[i + 1]?.includes("{")) {
            block.blockText = codeArray[i];
            block.blockStartLine = i + 1;
            block.blockEndLine = i + 1;
            blocksArray.push(block);
            block = { blockText: "", blockStartLine: null, blockEndLine: null }
        }
    }
    return blocksArray;
}