/* eslint-disable no-restricted-globals */
import * as druid from "@saehrimnir/druidjs";

const MESSAGE_INTERVAL = 200;

self.onmessage = function (e) {
    let now = new Date().getTime();
    let data1 = e.data;
    let data = [];
    if(data1?.result?.points){
        data1?.result?.points?.forEach((point) => {
            data.push(point.vector);
        });
    } else {
        self.postMessage(e.data);
        return;
    }
    if (data.length) {
        const D = new druid["TSNE"](data, {}); // ex  params = { perplexity : 50,epsilon :5}
        let next = D.generator();//default = 500 iterations
        let i = {};
        for (i of next) {
            if (Date.now() - now > MESSAGE_INTERVAL) {
                now = Date.now();
                self.postMessage(getDataset(data1,i));

            }
        }
        self.postMessage(getDataset(data1,i));
        
    }
    return;
}

function getDataset(data,reducedPoint){
    let dataset = [];
    let labelby = data.color_by;
    data.labelByArrayUnique.forEach((label) => {
        dataset.push({
            label: label,
            data: []
        });
    });

    data.result?.points?.forEach((point,index) => {
        let label = point.payload[labelby]||point.id;
        dataset[data.labelByArrayUnique.indexOf(label)].data.push({
            x: reducedPoint[index][0],
            y: reducedPoint[index][1],
            id: point.id,
        });
    });
    return dataset;
}

