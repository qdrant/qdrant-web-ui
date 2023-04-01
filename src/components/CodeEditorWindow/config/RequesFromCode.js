import axios from 'axios';

// For todays date;
Date.prototype.today = function () { 
  return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
   return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

export function RequestFromCode(text) {
  const data = codeParse(text);
  if (data.error) {
    return data
  }
  else {
    //Sending request 
    return axios({
      method: data.method,
      url: "/" + data.endpoint,
      data: data.reqBody
    })
      .then((response) => {
        const currentSavedCodes = localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []
        currentSavedCodes.push({code: data, time: new Date().timeNow(), date:  new Date().today()})
        localStorage.setItem("currentSavedCodes", JSON.stringify(currentSavedCodes));
        return response.data;
      })
      .catch((err) => {
        return err.response?.data?.status ? err.response?.data?.status : err
      })

  }
}

export function codeParse(codeText) {
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
      return { method: null, endpoint: null, reqBody: body, error: "Fix the Position brackets to run & check the json" }
    }
  }
  if (method === "" && endpoint === "") {
    return { method: null, endpoint: null, reqBody: reqBody, error: "Add Headline or remove the line gap between json and headline (if any)" }
  }
  else if (method === "") {
    return { method: null, endpoint: endpoint, reqBody: reqBody, error: "Add method" }
  }
  else if (endpoint === "") {
    return { method: method, endpoint: null, reqBody: reqBody, error: "Add endpoint" }
  }
  else{
  return { method: method, endpoint: endpoint, reqBody: reqBody, error: null }
  }
}