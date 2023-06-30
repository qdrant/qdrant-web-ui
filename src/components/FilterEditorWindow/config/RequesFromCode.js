import axios from "axios";


export function RequestFromCode(text, collectionName) {
  const data = codeParse(text);
  if (data.error) {
    return data;
  } else {
    //Sending request

    return axios({
      method: "POST",
      url: `collections/${collectionName}/points/scroll`,
      data: data.reqBody,
    })
      .then((response) => {
        const history = localStorage.getItem("history")
          ? JSON.parse(localStorage.getItem("history"))
          : [];
        history.push({
          idx: data.method + data.endpoint + Date.now(),
          code: data,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
        });
        localStorage.setItem("history", JSON.stringify(history));
        return response.data;
      })
      .catch((err) => {
        return err.response?.data?.status ? err.response?.data?.status : err;
      });
  }
}

export function codeParse(codeText) {
  var reqBody = {};
  if (codeText) {
    try {
      reqBody = JSON.parse(codeText);
    } catch (e) {
      return {
        reqBody: codeText,
        error: "Fix the Position brackets to run & check the json",
      };
    }
  }
    return {
      reqBody: reqBody,
      error: null,
    };
}
