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
            console.log(`Browser supports threads: ${navigator.hardwareConcurrency}`);
            initThreadPool(navigator.hardwareConcurrency);
        }
        else {
            console.log("Browser does not support threads");
        }

        try {
            const tsneEncoder = new DistbhtSNEf64(
                distances,
                indices,
                nsamples,
                tsneConfig
            );
            let resultPtr;

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

            sendVisual(self, sharedArray, resultPtr, memory, nsamples, outputDim);
        }
        catch (error) {
            self.postMessage({
                data: [],
                error: error,
            });
        }
    })();
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