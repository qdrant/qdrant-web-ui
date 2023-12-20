import { toFont } from 'chart.js/helpers';

export function imageTooltip(context) {
  // Tooltip Element
  let tooltipEl = document.getElementById('chartjs-tooltip');

  // Create element on first render
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip';
    tooltipEl.innerHTML = '<table></table>';
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

  function getBody(bodyItem) {
    return bodyItem.lines;
  }

  // Set Text
  if (tooltipModel.body) {
    // const titleLines = tooltipModel.title || [];
    const bodyLines = tooltipModel.body.map(getBody);

    let innerHtml = '<thead>';
    const imageSrc = tooltipModel.dataPoints[0].dataset.data[tooltipModel.dataPoints[0].dataIndex].point.payload?.image;

    // check if we should use image
    if (imageSrc) {
      innerHtml += '<tr><img src="' + imageSrc + '" width=177 height=100 /></tr>';
    }


    innerHtml += '<div>';
    bodyLines.forEach(function (line) {
      // innerHtml += '<p>' + line + '<br /></p>';
      console.log(line)
    });
    innerHtml += '</div>';
    innerHtml += '</thead><tbody>';

    // bodyLines.forEach(function (body, i) {
    //   const colors = tooltipModel.labelColors[i];
    //   let style = 'background:' + colors.backgroundColor;
    //   style += '; border-color:' + colors.borderColor;
    //   style += '; border-width: 2px';
    //   const span = '<span style="' + style + '">' + body + '</span>';
    //   innerHtml += '<tr><td>' + span + '</td></tr>';
    // });
    innerHtml += '</tbody>';

    const tableRoot = tooltipEl.querySelector('table');
    tableRoot.innerHTML = innerHtml;
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
