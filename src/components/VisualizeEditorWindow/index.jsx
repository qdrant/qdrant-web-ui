/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import EditorCommon from "../EditorCommon";
import Chart from 'chart.js/auto';


const VisualizeEditorWindow = ({ scrollResult }) => {

  const [editorData, setEditorData] = React.useState("{}");

  useEffect(() => {
    
    let labelID =JSON.parse(scrollResult).result?.points?.map((point) => point.id);
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
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },  
            display: false,
          },
          y: {
            
            display: false,
          }
        }
      }
    });


    worker.onmessage = (m) => {
      setEditorData(m.data);
      myChart.data.datasets[0].data = m.data;
      myChart.options.plugins= {
            tooltip: {
                callbacks: {
                    label: function(context) {
                      console.log(context );
                      let label = `ID: ${labelID[context.dataIndex]}` || "";
                        return label
                    }
                }
        }
  }
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
    <canvas id="myChart"></canvas>
  );
};
export default VisualizeEditorWindow;