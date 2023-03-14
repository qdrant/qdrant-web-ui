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
    wordWrap: "on" ,
    minimap: { enabled: false },
    automaticLayout: true,
    readOnly: false,
    mouseWheelZoom:true,
    glyphMargin:true,
}

export function HighlightText(location, code) {
    const codeArray = code.split("\n");
    var backetcount = 0;
    var codeStarLine = 0;
    var codeEndline = 0;

    for (var i = 0; i < codeArray.length; ++i) {

        if (codeArray[i].includes("{")) {
            if (backetcount == 0) {
                codeStarLine = i;
            }
            backetcount = backetcount + codeArray[i].match(/{/gi).length;
        }
        if (codeArray[i].includes("}")) {
            backetcount = backetcount - codeArray[i].match(/}/gi).length;
            if (backetcount == 0) {
                codeEndline = i + 1;
            }
        }
        if (codeStarLine <= (location.lineNumber) && codeEndline >= (location.lineNumber)) {
            return [codeStarLine, codeEndline];
        }


    }

    return [location.lineNumber, location.lineNumber]

}