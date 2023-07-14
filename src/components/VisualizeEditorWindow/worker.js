

import * as druid from "@saehrimnir/druidjs";

function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

self.onmessage = async function (e) {
    let data1 = JSON.parse(e.data);
    let data = [];
    if(    data1?.result?.points){
        data1?.result?.points?.map((point) => {
            data.push(point.vector);
        });
    }else{
        self.postMessage(e.data);
        return;
    }
    if (data.length) {
        const D = new druid["TSNE"](data, {}); // ex  params = { perplexity : 50,epsilon :5}
        let next = D.generator();//default = 500 iterations 
        for (const i of next) {
            self.postMessage(i);
            await wait(50);
        }
    }
    return;
}