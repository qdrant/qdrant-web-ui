const keywords=["POST", "GET", "PUT","DELETE" ,"HEAD" ,"collections"];

export var ErrorMarker = [];

// example format to generate error
// let err = {
//     message: 'unknow type',
//     line: 4,
//     column: 5,
//     length: 5
//     };

let err = null;
if (err) {
    ErrorMarker.push({
        startLineNumber: err.line, endLineNumber: err.line, startColumn: err.column, endColumn: err.column + err.length, message: err.message,
        severity: "monaco.MarkerSeverity.Error",
    });
}
export function errChecker(code) {
    const codeArray = code.split("\n");
    ErrorMarker=[]
    const codeStartIndex= getfirstline(codeArray);
    for (var i = 0; i < codeStartIndex.length; ++i) {
        const codeWordArray=codeArray[codeStartIndex[i]-1].split(" ");
        if(keywords.indexOf(codeWordArray[0])<0){
            ErrorMarker.push({
                startLineNumber: codeStartIndex[i], endLineNumber: codeStartIndex[i], startColumn: 0, endColumn: codeWordArray[0].length, message: "Expected one of GET/POST/PUT/DELETE/HEAD",
                severity: "monaco.MarkerSeverity.Error",
            });
        }
    }
    return;
}

function getfirstline(codeArray) {
    var backetcount = 0;
    const codeStartIndex = [];
    for (var i = 0; i < codeArray.length; ++i) {
        if (codeArray[i].includes("{")) {
            backetcount = backetcount + codeArray[i].match(/{/gi).length;
        }
        if (codeArray[i].includes("}")) {
            backetcount = backetcount - codeArray[i].match(/}/gi).length;
        }
        if (codeArray[i].replace(/\s/g, '').length  &&backetcount===0&& !codeArray[i].includes("}") ) {
            //checking does that only contains spaece or tabes
            codeStartIndex.push(i+1);
        }
    }
    return(codeStartIndex);
}