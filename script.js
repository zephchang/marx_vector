//import d3 graph data json data

fetch('d3_graph_data.json')
  .then((response) => response.json())
  .then((data) => {
    const d3_graph_data = data;
    createGraph(d3_graph_data);
  })
  .catch((error) => console.error('Error loading the JSON file:', error));

function createGraph(data) {
  const nodes = data.nodes;
  const links = data.links.filter(
    (link) => link.rank <= 3 && link.weight >= 0.6
  );

  // ... rest of your existing code ...
  const width = 1500, //for use in the svg creation later
    height = 900;

  const svg = d3
    .select('#chart-container') //this is bascially like vanilla JS element selector and then we element create svg and then set it's styling to width height etc
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Add a group for zoom transformation
  const g = svg.append('g');

  g.append('g').attr('class', 'links'); //ok now we create two groupings of links and nodes (which are kinda like divs
  g.append('g').attr('class', 'nodes');

  // Add zoom behavior
  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  const simulation = d3 //ok time to intiative the simulation. we use the forceSimulation constructor which constructs a force simulation element using nodes as the input. Note - this does not go into SVG yet, it is just a loose object on the workbench (similar to createElement in vanilla)
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(1) //so forceLink(links) basically says apply all the force links based on this link schema. Howevedr as a caveat forceLink wants to know hey for your link schema when you specify source and target, what attrribute of your nodes (d) are you referring to as your id for linking? in this case we are using name.
        .strength((d) => Math.pow(Math.E, 10 * (d.weight - 1)))
      //note: d = data
    )
    .on('tick', ticked); //tick is like some pseudo time thing. Every time you hear a tick run ticked (this is liek an event listener)

  function drag(simulation) {
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

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0) // Make it fully opaque
    .style('font-size', '12px') // Make the text smaller
    .style('width', '200px') // Set the width
    .style('position', 'fixed') // Position it fixed
    .style('background-color', 'white') // Set background to white
    .style('font-family', 'Arial, sans-serif') // Set font to Arial
    .style('border', '1px solid #ccc') // Add a light border for elegance
    .style('border-radius', '8px') // Add rounded corners for elegance
    .style('padding', '10px'); // Add padding for elegance

  function updateNodes() {
    d3.select('.nodes') //selects group nodes (was defined as a class earlier) so note we are manipulating the groups inside the svg, though not the svg itself.
      .selectAll('circle') //creates a selection of all the circle elements (could be none)
      .data(nodes) //.data lines up the circle elements with nodes - if tehre are any comon keys, we match them, otherwise we just use array indices. We are literally joining together the circle DOM elements with the node data element - they are bound together. Somehow this is very useful later
      .join('circle') // now we take the selection and data which have been lined up, and modify the DOM accordingly, adding or removing any elements while keeping the bindings the same.
      .attr('r', 10) // radius of your circles set to 5
      .attr('fill', '#69b3a2') //color of circles declared
      .attr('cx', (d) => d.x) //set center of circle to the node's x value. Note x and y were not specified but actually forceSimulator added those attributes when it was created
      .attr('cy', (d) => d.y)
      .call(drag(simulation))

      .on('mouseover', (event, d) => {
        tooltip.transition().duration(500).style('opacity', 0.9);
        tooltip
          .html(d.content)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      });
    //shoudl try styling circles using css rather than inline

    d3.select('.nodes') //note our text is really a seperate set f DOM elements they look nice with circles because both rely on absolute positioning from the d.x and d.y data.
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.content.slice(0, 20))
      .attr('x', (d) => d.x + 0)
      .attr('y', (d) => d.y - 20)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '15px');
  }

  function updateLinks() {
    d3.select('.links') //same story here, select all the links and join them with the 'line' elements (or create them if they don't yet exist) then add all kinds of attributes to them. Links have an x1 y1 and x2y2 you can understand how that works
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999') //note all of these attr have this implicit forEach functionality. This is relevant because when we refer to d d refers to a single link object
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)
      .attr('x1', (d) => d.source.x) //note that our joined object has both the svg line element and the data object. They are joined at the hip. So here we are updating the svg line element attribute x1 to match the d.sorce x. Note that attr has an implicit forEach functionalty so d refers to a single link object.
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  }

  function ticked() {
    updateLinks();
    updateNodes();
  }

  simulation.restart();
}
