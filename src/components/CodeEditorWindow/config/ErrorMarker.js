import { getCodeBlocks } from '../../EditorCommon/config/Rules';
const keywords = ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'];

export let ErrorMarker = [];

// example format to generate error
// let err = {
//     message: 'unknow type',
//     line: 4,
//     column: 5,
//     length: 5
//     };

const err = null;
if (err) {
  ErrorMarker.push({
    startLineNumber: err.line,
    endLineNumber: err.line,
    startColumn: err.column,
    endColumn: err.column + err.length,
    message: err.message,
    severity: 'monaco.MarkerSeverity.Error',
  });
}
export function errChecker(code) {
  const blocksArray = getCodeBlocks(code);
  ErrorMarker = [];
  for (let i = 0; i < blocksArray.length; ++i) {
    const headLineArray = blocksArray[i].blockText.split(/\r?\n/)[0].split(' ');
    if (keywords.indexOf(headLineArray[0]) < 0) {
      ErrorMarker.push({
        startLineNumber: blocksArray[i].blockStartLine,
        endLineNumber: blocksArray[i].blockStartLine,
        startColumn: 0,
        endColumn: headLineArray[0].length,
        message: 'Expected one of GET/POST/PUT/DELETE/HEAD',
        severity: 'monaco.MarkerSeverity.Error',
      });
    }
  }
  return;
}
