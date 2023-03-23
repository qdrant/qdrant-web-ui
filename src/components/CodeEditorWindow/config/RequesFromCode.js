import axios from 'axios';

export function RequestFromCode(text) {
  const data= codeParse(text);
  if (data.error) 
  {
  return data
  }
  else {
    //Sending request 
    return axios({
      method: data.method,
      url: "/" + data.endpoint,
      data: data.reqBody
    })
      .then((response) => response.data)
      .catch((err) => err.response?.data?.status ? err.response?.data?.status : err)
  }
}

export function codeParse(codeText){
  const codeArray = codeText.split("\n");
  const headerLine = codeArray[0];
  const body = codeArray[1];
  //Extract the header  
  const method = headerLine.split(" ")[0]
  const endpoint = headerLine.split(" ")[1]

  var reqBody = {};
  if (body) {
    try {
      reqBody = body === "\n" ? {} : JSON.parse(body);
    } catch (e) {
      return { method:null,endpoint:null,reqBody:null,error : "Fix the Position brackets to run & check the json" }
    }
  }
  if(method===""){
    return { method:null,endpoint:null,reqBody:null,error : "Add headline or remove the line gap between json and headline (if any)" } 
  }
  return {method:method,endpoint:endpoint,reqBody:reqBody,error:null}
}