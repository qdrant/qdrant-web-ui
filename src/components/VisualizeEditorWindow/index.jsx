/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Button } from "@mui/material";


const VisualizeEditorWindow = ({ scrollResult }) => {
  const { enqueueSnackbar ,closeSnackbar} = useSnackbar();
  const action = snackbarId => (
      <Button variant="contained" color="warning" onClick={() => { closeSnackbar(snackbarId) }}>
        Dismiss
      </Button>
  );
  useEffect(() => {
    
    if( !scrollResult.data && !scrollResult.error )
    {return;} 
    
    
    if (scrollResult.error) {
      enqueueSnackbar(`Visualization Unsuccessful, error: ${JSON.stringify(
        scrollResult.error
      )}` , { variant:"error",action});

      return;
    }
    else if (!scrollResult.data?.result?.points.length) {
      enqueueSnackbar(`Visualization Unsuccessful, error: No data returned`, { variant:"error" ,action});
      return;
    }
    let labelID = scrollResult.data.result?.points?.map((point) => point.id);
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    let labelby = scrollResult.data.color_by;
    scrollResult.data.labelByArrayUnique = [
      ...new Set(
        scrollResult.data.result?.points?.map(
          (point) => point.payload[labelby] || point.id
        )
      ),
    ];
    let dataset = [];
    scrollResult.data.labelByArrayUnique.forEach((label) => {
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
                let label = `ID: ${context.dataset.data[context.dataIndex].id}` || "";
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

    if (scrollResult.data.result?.points?.length > 0) {
      worker.postMessage(scrollResult.data);
    }

    return () => {
      myChart.destroy();
      worker.terminate();
    };
  }, [scrollResult]);

  return (
    <SnackbarProvider maxSnack={3}>
      <canvas id="myChart"></canvas>
    </SnackbarProvider>
  );
};
export default VisualizeEditorWindow;
