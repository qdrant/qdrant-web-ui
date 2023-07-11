

import * as druid from "@saehrimnir/druidjs";

self.onmessage = function (e) {
    let data1 = JSON.parse(e.data);
    let data = [];
    data1?.result?.points?.map((point) => {
        data.push(point.vector);
    });
    if (data.length) {
        const D = new druid["TSNE"](data, {}); // ex  params = { perplexity : 50,epsilon :5}
        let next = D.generator();//default = 500 iterations 
        for (const i of next) {
            console.log(typeof i);
            self.postMessage(i);
        }
    }
}