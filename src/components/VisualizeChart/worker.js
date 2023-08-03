/* eslint-disable no-restricted-globals */
import * as druid from '@saehrimnir/druidjs';

const MESSAGE_INTERVAL = 200;

self.onmessage = function (e) {
  let now = new Date().getTime();
  const data1 = e.data;
  const data = [];

  if (data1?.result?.points?.length === 0) {
    self.postMessage({
      data: [],
      error: 'No data found',
    });
    return;
  } else if (data1?.result?.points?.length === 1) {
    self.postMessage({
      data: [],
      error: 'cannot perform tsne on single point',
    });
    return;
  } else if (typeof data1?.result?.points[0].vector.length === 'number') {
    data1?.result?.points?.forEach((point) => {
      data.push(point.vector);
    });
  } else if (typeof data1?.result?.points[0].vector === 'object') {
    if (data1.vector_name === undefined) {
      self.postMessage({
        data: [],
        error: 'No vector name found, select a vaild vector_name',
      });
      return;
    } else if (data1?.result?.points[0].vector[data1?.vector_name] === undefined) {
      self.postMessage({
        data: [],
        error: 'No vector found with name ' + data1?.vector_name,
      });
      return;
    } else if (data1?.result?.points[0].vector[data1?.vector_name]) {
      data1?.result?.points?.forEach((point) => {
        data.push(point.vector[data1?.vector_name]);
      });
    } else {
      self.postMessage({
        data: [],
        error: 'Unexpected Error Occured',
      });
      return;
    }
  } else {
    self.postMessage({
      data: [],
      error: 'Unexpected Error Occured',
    });
    return;
  }
  if (data.length) {
    const D = new druid['TSNE'](data, {}); // ex  params = { perplexity : 50,epsilon :5}
    const next = D.generator(); // default = 500 iterations
    let i = {};
    for (i of next) {
      if (Date.now() - now > MESSAGE_INTERVAL) {
        now = Date.now();
        self.postMessage({ result: getDataset(data1, i), error: null });
      }
    }
    self.postMessage({ result: getDataset(data1, i), error: null });
  }
  return;
};

function getDataset(data, reducedPoint) {
  const dataset = [];
  const labelby = data.color_by;
  if (labelby) {
    data.labelByArrayUnique.forEach((label) => {
      dataset.push({
        label: label,
        data: [],
      });
    });

    data.result?.points?.forEach((point, index) => {
      const label = point.payload[labelby];
      dataset[data.labelByArrayUnique.indexOf(label)].data.push({
        x: reducedPoint[index][0],
        y: reducedPoint[index][1],
        point: point,
      });
    });
  } else {
    dataset.push({
      label: 'data',
      data: [],
    });
    data.result?.points?.forEach((point, index) => {
      dataset[0].data.push({
        x: reducedPoint[index][0],
        y: reducedPoint[index][1],
        point: point,
      });
    });
  }
  return dataset;
}
