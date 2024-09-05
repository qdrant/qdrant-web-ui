import init, { initThreadPool, DistbhtSNEf64 } from 'wasm-dist-bhtsne';
import { threads } from 'wasm-feature-detect';
// import exampleData from 'examples/data';
import { tsneConfig } from './tsneConfig';

const errorMessage = {
    data: [],
    error: 'No data found',
};

let port;
let RENDERING = false;
const sleep = ms => new Promise(r => setTimeout(r, ms));

self.onmessage = e => {
    if (e.data.command === "CONN") {
        port = e.ports[0];
        port.onmessage = event => {
            RENDERING = event.data;
        };
        return;
    }

    console.log(`Received data in: ${(Date.now() - e.data.time) / 1000}s`);
    const { distances, indices, nsamples, distanceType } = e.data.details;
    // const { distances: dist, indices, n_samples: nsamples } = exampleData;

    if (distanceType === "") {
        errorMessage.error = 'No distance type found';
        self.postMessage(errorMessage);
        return;
    }

    if (distanceType !== "Euclid") {
        distances.forEach((dist, idx, arr) => {
            arr[idx] = 1 - dist;
        });
    }
    const outputDim = 2;
    const sharedArray = new Float64Array(e.data.sharedArray);

    (async () => {
        const { memory } = await init();
        if (await threads()) {
            console.log("Browser supports threads");
            await initThreadPool(navigator.hardwareConcurrency);
        }
        else {
            console.log("Browser does not support threads");
        }

        try {
            console.time('Rust Bhtsne - t-SNE Total Time');
            console.time('Rust Bhtsne - t-SNE 1st step');
            const tsneEncoder = new DistbhtSNEf64(
                distances,
                indices,
                nsamples,
                3 * tsneConfig.perplexity,
                tsneConfig
            );
            console.timeEnd('Rust Bhtsne - t-SNE 1st step');
            let resultPtr;
            console.time('Rust Bhtsne - t-SNE 2nd step');
            for (let i = 0; i < 1000; i++) {
                tsneEncoder.step(1);

                // Give chance to other coroutines to run
                await sleep(0);

                // Check if rendering is in progress
                // If yes, then don't send the result
                if (RENDERING) continue;

                resultPtr = tsneEncoder.get_embedding();
                sendVisual(self, sharedArray, resultPtr, memory, nsamples, outputDim);
                RENDERING = true;
            }
            console.timeEnd('Rust Bhtsne - t-SNE 2nd step');
            sendVisual(self, sharedArray, resultPtr, memory, nsamples, outputDim);
            console.timeEnd('Rust Bhtsne - t-SNE Total Time');
        }
        catch (error) {
            self.postMessage({
                data: [],
                error: error,
            });
        }
    })();

    // These are steps that we used to perform on the old data
    // before performing t-SNE on it. We are not using the old data anymore
    // so we are commenting out these steps. 
    //
    // if (points?.length === 0) {
    //     self.postMessage(errorMessage);
    //     return;
    // }
    // else if (points?.length === 1) {
    //     errorMessage.error = 'cannot perform tsne on single point';
    //     self.postMessage(errorMessage);
    // }
    // else if (typeof (vector = points[0].vector).length === 'number') {
    //     cols = vector.length;
    //     points.forEach(point => data.push(...point.vector));
    // }
    // else if (typeof vector === 'object') {
    //     if (!(vecName = e.data.vector_name)) {
    //         errorMessage.error = 'No vector name found, select a valid vector_name';
    //         self.postMessage(errorMessage);
    //         return;
    //     }
    //     else if (vector[vecName] === undefined) {
    //         errorMessage.error = `No vector found with name ${vecName}`;
    //         self.postMessage(errorMessage);
    //         return;
    //     }
    //     else if (!vector[vecName]) {
    //         errorMessage.error = 'Unexpected Error Occurred';
    //         self.postMessage(errorMessage);
    //         return;
    //     }

    //     if (!Array.isArray(vector[vecName])) {
    //         errorMessage.error = 'Vector visualization is not supported for sparse vector';
    //         self.postMessage(errorMessage);
    //         return;
    //     }

    //     cols = vector[vecName].length;
    //     points.forEach(point => data.push(...point.vector[vecName]));
    // }
    // else {
    //     errorMessage.error = 'Unexpected Error Occurred';
    //     self.postMessage(errorMessage);
    //     return;
    // }

    // if (data.length) {
    //     // Perform t-SNE
    //     (async () => {
    //         const { memory } = await init();
    //         if (await threads()) {
    //             console.log("Browser supports threads");
    //             await initThreadPool(navigator.hardwareConcurrency);
    //         }
    //         else {
    //             console.log("Browser does not support threads");
    //         }

    //         // set hyperparameters
    //         const opt = {
    //             learning_rate: 150.0,
    //             perplexity: 30.0,
    //             theta: 0.5,
    //         };

    //         try {
    //             console.time('Rust Bhtsne - t-SNE Total Time');
    //             console.time('Rust Bhtsne - t-SNE 1st step');
    //             const tsneEncoder = new bhtSNEf64(data, cols, opt);
    //             console.timeEnd('Rust Bhtsne - t-SNE 1st step');
    //             let resultPtr;
    //             console.time('Rust Bhtsne - t-SNE 2nd step');
    //             for (let i = 0; i < 1000; i++) {
    //                 tsneEncoder.step(1);

    //                 // Give chance to other coroutines to run
    //                 await sleep(0);

    //                 // Check if rendering is in progress
    //                 // If yes, then don't send the result
    //                 if (RENDERING) continue;

    //                 resultPtr = tsneEncoder.get_embedding();
    //                 sendVisual(self, sharedArray, resultPtr, memory, points, outputDim);
    //                 RENDERING = true;
    //             }
    //             console.timeEnd('Rust Bhtsne - t-SNE 2nd step');
    //             sendVisual(self, sharedArray, resultPtr, memory, points, outputDim);
    //             console.timeEnd('Rust Bhtsne - t-SNE Total Time');
    //         }
    //         catch (error) {
    //             self.postMessage({
    //                 data: [],
    //                 error: error,
    //             });
    //         }
    //     })();
    // }
};

self.onerror = e => {
    console.error(e);
};

function sendVisual(worker, sharedArray, resultPtr, memory, nsamples, outputDim) {
    const result = new Float64Array(memory.buffer, resultPtr, nsamples * outputDim);
    result.forEach((val, idx) => {
        sharedArray[idx] = val;
    });

    worker.postMessage({
        error: null,
    });
}