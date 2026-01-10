export const parseTime = (t) => new Date(t).getTime();

export const getTreeTimeRange = (nodes) => {
  let min = Infinity;
  let max = -Infinity;

  const traverse = (node) => {
    if (node.started_at) {
      const start = parseTime(node.started_at);
      if (start < min) min = start;
      if (start > max) max = start;

      if (node.finished_at) {
        const end = parseTime(node.finished_at);
        if (end > max) max = end;
      }
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return { min, max };
};

export const enrichWithDuration = (nodes, maxTime) => {
  return nodes.map((node) => {
    const newNode = { ...node };
    let duration = 0;
    let isExplicitDuration = false;

    // todo: check if this is correct
    // Logic for leaf/task progress based duration estimation
    // If not finished, and we have done/total, we can estimate "progress duration"
    // However, the prompt asks to "show done/total".
    // It also says "account for this in the summarized parents nodes".
    // This implies we need to sum up "done" and "total" for parents too if they don't have it.

    // First pass: calculate duration if explicit
    if (newNode.duration_sec) {
      duration = newNode.duration_sec * 1000;
      isExplicitDuration = true;
    } else if (newNode.started_at) {
      const start = parseTime(newNode.started_at);
      const end = newNode.finished_at ? parseTime(newNode.finished_at) : maxTime;
      duration = end - start;
      isExplicitDuration = true;
    }

    let childrenSumDone = 0;
    let childrenSumTotal = 0;
    let hasChildrenWithProgress = false;

    if (newNode.children && newNode.children.length > 0) {
      newNode.children = enrichWithDuration(newNode.children, maxTime);

      // Sum children stats
      newNode.children.forEach((child) => {
        if (child.total > 0) {
          childrenSumDone += child.done || 0;
          childrenSumTotal += child.total;
          hasChildrenWithProgress = true;
        }
        if (!isExplicitDuration) {
          duration += child.duration || 0;
        }
      });
    }

    // If node doesn't have own done/total, but children do, inherit the sum
    if (newNode.total === undefined && hasChildrenWithProgress) {
      newNode.done = childrenSumDone;
      newNode.total = childrenSumTotal;
    }

    newNode.duration = duration;
    return newNode;
  });
};
