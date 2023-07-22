/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import EditorCommon from "../EditorCommon";
import Chart from 'chart.js/auto';


const VisualizeEditorWindow = ({ scrollResult }) => {

  const [editorData, setEditorData] = React.useState("{}");
// write a demo chart fuction in scatter plot
  useEffect(() => {

    return () => {
      
    }
  }, []);

  useEffect(() => {
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Scatter Dataset',
          data: []
        }]
      },
      options: {
        responsive: true,
        fullsize: true,

      }
    });

    worker.onmessage = (m) => {
      console.log("message from worker", m.data);
      setEditorData(m.data);
      myChart.data.datasets[0].data = m.data;
      myChart.update();
    };

    worker.postMessage(scrollResult);

    return () => {
      myChart.destroy();
      worker.terminate();
    };
  }, [scrollResult]);

  function formatJSON(res = {}) {
    try { 
      const val= JSON.stringify(res, null, 2);
      return val;
    } catch {
      const errorJson = {
        error: `HERE ${res}`,
      };
      return JSON.stringify(errorJson, null, 2);
    }
  }

  return (
    <canvas id="myChart" height={"100%"} width={"100%"}></canvas>
  );
};
export default VisualizeEditorWindow;