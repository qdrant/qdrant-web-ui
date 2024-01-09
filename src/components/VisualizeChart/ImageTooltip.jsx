import { toFont } from 'chart.js/helpers';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

const DEFAULT_BORDER_COLOR = '#333333'

export function imageTooltip(context) {
  // Tooltip Element
  let tooltipEl = document.getElementById('chartjs-tooltip');

  // Create element on first render
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip';
    tooltipEl.appendChild(document.createElement('table'));
    document.body.appendChild(tooltipEl);
  }

  // Hide if no tooltip
  const tooltipModel = context.tooltip;
  if (tooltipModel.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set caret Position
  tooltipEl.classList.remove('above', 'below', 'no-transform');
  if (tooltipModel.yAlign) {
    tooltipEl.classList.add(tooltipModel.yAlign);
  } else {
    tooltipEl.classList.add('no-transform');
  }

  // Set content
  if (tooltipModel.body) {
    const bodyLines = tooltipModel.body[0].lines;

    const imageSrc = tooltipModel.dataPoints[0].dataset.data[tooltipModel.dataPoints[0].dataIndex].point.payload?.image;

    const borderColor = tooltipModel.labelColors[0]?.borderColor || DEFAULT_BORDER_COLOR;

    const child = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'auto',
        }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            style={{
              width: '250px',
              height: 'auto',
              objectFit: 'cover',
              border: '3px solid ' + borderColor,
              borderRadius: '10px 10px 0px 0px',
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#333333',
            borderRadius: '0px 0px 10px 10px',
            padding: '5px',
          }}
        >
          {bodyLines.map((line, i) => (
            <span key={i} style={{ color: 'white' }}>
              {line}
            </span>
          ))}
        </div>
      </div>
    );

    // Render html to insert in tooltip
    const tableRoot = tooltipEl.querySelector('table');
    const root = createRoot(tableRoot);
    flushSync(() => {
      root.render(child);
    });
  }

  const position = context.chart.canvas.getBoundingClientRect();
  const bodyFont = toFont(tooltipModel.options.bodyFont);

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.position = 'absolute';
  tooltipEl.style.left = position.left + window.scrollX + tooltipModel.caretX + 'px';
  tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY + 'px';
  tooltipEl.style.font = bodyFont.string;
  tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
  tooltipEl.style.pointerEvents = 'none';
}
