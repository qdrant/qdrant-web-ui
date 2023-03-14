const keywords=["POST", "GET", "PUT","DELETE" ,"HEAD" ,"collections"];

export var ErrorMarker = [];
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
        //JSON Body must NOT  present in First Line
        // console.log(codeArray[codeStartIndex[i]-1].indexOf("{"),codeStartIndex[i])
        // if(codeArray[codeStartIndex[i]-1].indexOf("{")>0){
        //     console.log(ErrorMarker)
        //     ErrorMarker.push({
        //         startLineNumber: codeStartIndex[i], endLineNumber: codeStartIndex[i], startColumn: codeArray[codeStartIndex[i]-1].indexOf("{"), endColumn: codeArray[codeStartIndex[i]-1].indexOf("{")+1, message: "JSON Body must NOT  present in First Line",
        //         severity: "monaco.MarkerSeverity.Error",
        //     });
        // }
    }
    return;
}

function getfirstline(codeArray) {
    var backetcount = 0;
    var codeStarLine = 0;
    var codeEndline = 0;
    const codeStartIndex = [];
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
        if (codeArray[i].replace(/\s/g, '').length  &&backetcount==0&& !codeArray[i].includes("}") ) {
            //checking does that only contains spaece or tabes
            codeStartIndex.push(i+1);
        }
    }
    return(codeStartIndex);
}