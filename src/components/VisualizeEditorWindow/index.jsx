/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const VisualizeEditorWindow = ({ scrollResult }) => {

  useEffect(() => {
    let parsedData = JSON.parse(scrollResult);
    let labelID = parsedData.result?.points?.map((point) => point.id);
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    let labelby = parsedData.color_by;
    parsedData.labelByArrayUnique = [
      ...new Set(
        parsedData.result?.points?.map(
          (point) => point.payload[labelby] || point.id
        )
      ),
    ];
    let dataset = [];
    parsedData.labelByArrayUnique.forEach((label) => {
      dataset.push({
        label: label,
        data: [],
      });
    });
    const ctx = document.getElementById("myChart");
    const myChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: dataset,
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
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = `ID: ${labelID[context.dataIndex]}` || "";
                return label;
              },
            },
          },
          legend: {
            display: labelby ? true : false,
          },
        },
      },
    });

    worker.onmessage = (m) => {
      m.data.forEach((dataset, index) => {
        myChart.data.datasets[index].data = [...dataset.data];
      });
      myChart.update();
    };

    if (parsedData.result?.points?.length > 0) {
      worker.postMessage(parsedData);
    }

    return () => {
      myChart.destroy();
      worker.terminate();
    };
  }, [scrollResult]);


  return <canvas id="myChart"></canvas>;
};
export default VisualizeEditorWindow;
