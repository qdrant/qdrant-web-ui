import axios from 'axios';
import { parse as jsoncParse } from 'jsonc-parser';

export function requestFromCode(text) {
  const data = codeParse(text);
  if (data.error) {
    return data;
  } else {
    // Sending request

    return axios({
      method: data.method,
      url: data.endpoint,
      data: data.reqBody,
    })
      .then((response) => {
        const history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
        history.push({
          idx: data.method + data.endpoint + Date.now(),
          code: data,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
        });
        localStorage.setItem('history', JSON.stringify(history));
        return response.data;
      })
      .catch((err) => {
        return err.response?.data?.status ? err.response?.data?.status : err;
      });
  }
}

export function codeParse(codeText) {
  const codeArray = codeText.split(/\r?\n/);
  let headerLine = codeArray.shift();
  // Remove possible comments
  headerLine = headerLine.replace(/\/\/.*$/gm, '');
  const body = codeArray.join('\n');
  // Extract the header
  const method = headerLine.split(' ')[0];
  const endpoint = headerLine.split(' ')[1];

  const parserConfig = {
    allowTrailingComma: false,
    disallowComments: false,
    allowEmptyContent: false,
  };

  let reqBody = {};
  if (body) {
    try {
      reqBody = body === '\n' ? {} : jsoncParse(body, null, parserConfig);
    } catch (e) {
      return {
        method: null,
        endpoint: null,
        reqBody: null,
        error: 'Fix the Position brackets to run & check the json',
      };
    }
  }
  if (method === '' && endpoint === '') {
    return {
      method: null,
      endpoint: null,
      reqBody: reqBody,
      error: 'Add Headline or remove the line gap between json and headline (if any)',
    };
  } else if (method === '') {
    return {
      method: null,
      endpoint: endpoint,
      reqBody: reqBody,
      error: 'Add method',
    };
  } else if (endpoint === '') {
    return {
      method: method,
      endpoint: null,
      reqBody: reqBody,
      error: 'Add endpoint',
    };
  } else {
    return {
      method: method,
      endpoint: endpoint,
      reqBody: reqBody,
      error: null,
    };
  }
}
