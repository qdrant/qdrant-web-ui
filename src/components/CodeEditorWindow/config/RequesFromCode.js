import axios from 'axios';

export function RequestFromCode(text) {
  const codeArray = text.split("\n");
  const headerLine = codeArray[0];
  
  //Extract the header  
  const method = headerLine.split(" ")[0]
  const endpoint = headerLine.split(" ")[1]
  var body = "";
  
  //Makeing body and remove single line comments
  for (var i = 1; i < codeArray.length; ++i) {
    body = body + codeArray[i].replace(/(\/\/[^*]*)/g, '');  // single line comment 
  }

  var reqBody = {};

  //removeing multiline comments and parsing body to json 
  if (body) {
    try {
      var bodyWithoutMultiLineComments = body.replace(/(\/\*[^*]*\*\/)/g, '');
      reqBody = body == "\n" ? {} : JSON.parse(bodyWithoutMultiLineComments);
    } catch (e) {
      return { "error": "Fix the Position brackets to run & check the json" } // error in the above string (in this case, yes)!
    }
  }

  if(method != ""){
  //Sending request 
  return axios({
    method: method,
    url: "/" + endpoint,
    data: reqBody
  })
    .then((response) => response.data)
    .catch((err) => err.response?.data?.status ? err.response?.data?.status : err)
  }
  else{
    return { "error": "Please add method and route or remove is the any gaps between the json and head" } // error in the above string (in this case, yes)!
  }
}