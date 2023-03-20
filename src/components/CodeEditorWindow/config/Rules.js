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

/**
*This function takes the current position of cursor as location and the entire code as code from the code editor 
*Then that track the json start and end by bracket count as the location of cursor lies between the json or one 
*line before the json that will return the range between the json start -1 (for header and route) to the  end of the json
* for empty line or request which don't have text it jut check the next line if the have json then just return from the 
* above rule if the json is not present in the next line it just return the curror  line number as location.
*/
export function HighlightText(location, code) {
    const codeArray = code.split("\n");
    var backetcount = 0;
    var codeStarLine = 0;
    var codeEndline = 0;

    for (var i = 0; i < codeArray.length; ++i) {

        if (codeArray[i].includes("{")) {
            if (backetcount === 0) {
                codeStarLine = i;
            }
            backetcount = backetcount + codeArray[i].match(/{/gi).length;
        }
        if (codeArray[i].includes("}")) {
            backetcount = backetcount - codeArray[i].match(/}/gi).length;
            if (backetcount === 0) {
                codeEndline = i + 1;
            }
        }
        if (codeStarLine <= (location.lineNumber) && codeEndline >= (location.lineNumber)) {
            return [codeStarLine, codeEndline];
        }


    }

    return [location.lineNumber, location.lineNumber]

}