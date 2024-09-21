function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export function custom_drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  const throttledDrag = throttle((event, d) => {
    d.fx = event.x;
    d.fy = event.y;
    simulation.alpha(0.3).restart();
  }, 400);

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', (event, d) => throttledDrag(event, d))
    .on('end', dragended);
}

export async function load_nodes_edges(dataUrl) {
  try {
    const response = await fetch(dataUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading the JSON file:', error);
    throw error;
  }
}
