/* eslint-disable no-restricted-globals */
import * as druid from "@saehrimnir/druidjs";

const MESSAGE_INTERVAL = 200;

self.onmessage = function (e) {
    let now = new Date().getTime();
    let data1 = JSON.parse(e.data);
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
                self.postMessage(i);
            }
        }
        self.postMessage(i);
    }
    return;
}