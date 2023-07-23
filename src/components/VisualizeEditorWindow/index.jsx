/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import EditorCommon from "../EditorCommon";
import Chart from 'chart.js/auto';


const VisualizeEditorWindow = ({ scrollResult }) => {

  const [editorData, setEditorData] = React.useState("{}");

  useEffect(() => {

    let parsedData = JSON.parse(scrollResult);
    let labelID =parsedData.result?.points?.map((point) => point.id);
    let colorByPaesedData =[]
    let colorByArrayUnique = [];
    if(parsedData.color_by){
      let colorBy = parsedData.color_by;
      colorByArrayUnique = [...new Set(parsedData.result?.points?.map((point) => point.payload[colorBy]))];
      let colorByArrayUniqueLength = colorByArrayUnique.length;
      let colorByArrayUniqueColors = [];
      for (let i = 0; i < colorByArrayUniqueLength; i++) {
        colorByArrayUniqueColors.push(`#${Math.floor(Math.random()*16777215).toString(16)}`);
      }
      let colorByArrayUniqueColorsObject = {};
      for (let i = 0; i < colorByArrayUniqueLength; i++) {
        colorByArrayUniqueColorsObject[colorByArrayUnique[i]] = colorByArrayUniqueColors[i];
      }
      colorByPaesedData = parsedData.result?.points?.map((point) => {
        let backgroundColor = colorByArrayUniqueColorsObject[point.payload[colorBy]];
        return backgroundColor;
      });
    }
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Scatter Dataset',
          data: [],
          backgroundColor: colorByPaesedData,
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
        },
        plugins:{
          tooltip: {
              callbacks: {
                  label: function(context) {
                    let label = `ID: ${labelID[context.dataIndex]}` || "";
                      return label
                  }
              }
      }
}
      }
    });


    worker.onmessage = (m) => {
      setEditorData(m.data);
      myChart.data.datasets[0].data = m.data;
      myChart.update();
    };

    worker.postMessage(parsedData);

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