import axios from 'axios';

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
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
          + (currentdate.getMonth() + 1) + "/"
          + currentdate.getFullYear() + " @ "
          + currentdate.getHours() + ":"
          + currentdate.getMinutes() + ":"
          + currentdate.getSeconds();
        const currentSavedCodes = localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []
        currentSavedCodes.push({ name: `${data.method} ${data.endpoint}`, code: data, time: datetime })
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
      return { method: null, endpoint: null, reqBody: null, error: "Fix the Position brackets to run & check the json" }
    }
  }
  if (method === "") {
    return { method: null, endpoint: null, reqBody: null, error: "Add headline or remove the line gap between json and headline (if any)" }
  }
  return { method: method, endpoint: endpoint, reqBody: reqBody, error: null }
}