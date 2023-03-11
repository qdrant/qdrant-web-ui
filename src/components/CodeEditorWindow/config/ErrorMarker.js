export const ErrorMarker = [];
// let err = {
//     message: 'unknow type',
//     line: 4,
//     column: 5,
//     length: 5
//     };
let err=null;
if (err) {
    ErrorMarker.push({
        startLineNumber: err.line, endLineNumber: err.line, startColumn: err.column, endColumn: err.column + err.length, message: err.message,
        severity: "monaco.MarkerSeverity.Error",
    });
}
