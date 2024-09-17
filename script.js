const width = 1000;
height = 1000;
const nodes = [{}, {}, {}, {}, {}];

const svg = d3
  .select('#chart-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const simulation = d3
  .forceSimulation(nodes)
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2))
  .on('tick', ticked);

// ... existing code ...

// Add this drag function
const drag = d3
  .drag()
  .on('start', dragstarted)
  .on('drag', dragged)
  .on('end', dragended);

function ticked() {
  svg
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 5)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .call(drag); // Apply drag behavior to circles
}

// Add these drag event handler functions
function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// Start the simulation
simulation.restart();
