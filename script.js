import * as utils from './utils.js';

const d3_graph_data = await utils.load_nodes_edges(
  '/src/data/d3_graph_data.json'
); //this is loading up the data correctly as a json object

createGraph(d3_graph_data);

function createGraph(data) {
  const nodes = data.nodes;
  const links = data.links.filter(
    (link) => (link.rank <= 3 && link.cos_sim >= 0.85) || link.rank == 0
  );

  const width = window.innerWidth, //used in multiple places
    height = window.innerHeight;

  const svg = d3
    .select('#chart-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background-color', '#0a1a2f');
  const g = svg.append('g');
  g.append('g').attr('class', 'links_g');
  g.append('g').attr('class', 'nodes_g');

  // Add zoom behavior
  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
      zoomNodesLabelsLinks(event.transform.k);
    });
  svg.call(zoom);

  function zoomNodesLabelsLinks(scale) {
    const baseNodeRadius = 5;
    const baseFontSize = 15;
    const baseLink = 1;

    const node = d3.select('.nodes_g').selectAll('circle');
    const labels = d3.select('.nodes_g').selectAll('text');
    const all_links = d3.select('.links_g').selectAll('line');

    const threshold_scale = Math.max(scale, 1.4); //let's think through what's going on here so transform is going to give a transform event where it tells you the zoom constant. so a

    node
      .attr('r', baseNodeRadius / threshold_scale)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    labels
      .style('font-size', `${baseFontSize / threshold_scale}px`)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - 20 / threshold_scale);

    all_links
      .attr('stroke-width', baseLink / threshold_scale)
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  }

  // Hide tooltip
  svg.on('click', () => {
    tooltip.transition().duration(200).style('opacity', 0);
  });

  //Construct force simulation
  const simulation = d3
    .forceSimulation(nodes)

    // ELECTROSTATIC CHARGE - (nodes push away from each other)
    .force(
      'charge',
      d3.forceManyBody().strength(-800).distanceMax(20000).distanceMin(20)
    )
    // CENTERING FORCE (no relative effect)
    .force('center', d3.forceCenter(width / 2, height / 2))

    // LINK FORCE (distance and strength are the main ones)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.global_id)

        //LINK DISTANCE (this causes packed nodes to spread out a bit)
        .distance(20)
        .strength((d) => {
          if (d.cos_sim < 0.3) {
            return -0.5; // Super repulsion
          } else if (d.cos_sim < 0.5) {
            return -0.5; // Mild repulsion
          } else if (d.cos_sim < 0.7) {
            return 0; // Decent attraction
          } else if (d.cos_sim < 0.9) {
            return 0.5; // Decent attraction
          } else {
            return 1; // Super attraction
          }
        })
    )
    .on('tick', ticked); //on tick run the ticked function (which is going to update the UI)

  //building tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip') //note tooltip is styled somwhere else
    .html('Test Tooltip'); // Add some initial content

  tooltip //styling for tooltip
    .style('position', 'absolute')
    .style('text-align', 'center')
    .style('width', '300px')
    .style('padding', '10px')
    .style('font-family', 'Arial, sans-serif')
    .style('font-size', '14px')
    .style('background-color', '#ffffe9')
    .style('border', '0')
    .style('border-radius', '3px')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('z-index', '9999');

  function updateNodes() {
    //hm a note on what's going on here. So with vanilla vanilla JS, what happens is. (1) html creates the initial state of the C++ memory which represents the DOM. (2) We load JS. When JS selects an object, the browser translates that request into C++ and grabs the oject, translates that object to JS, and then returns that object to JS (which has element traits like .textContent) that we can modify. (3) When we take an action on that object, JS modifies the JS object, then tells browser to update the C++ to match the new object. (4) so selection is actualy translates to C++ find the object, translate to JS objects and present the script with the JS objects. From the JS programmer's point of view, it is as if there is a fully JS object DOM that lives above the C++ DOM but that's not actually the case.

    //now, this notion of .data. So when a JS object gets created and sent to the DOM, the browser caches it (to use in future for performance). This cache actually in some sense is a partial parallel DOM represented in JS. Important note: D3 takes advantage of this JS cache to put data in the cache that never hit C++. Clever trick. So the cache holds these element-data centaurs

    //So in this example we seelctAll(circles). If the circles were not JS created, they are not cached, not centaurs, so they get pulled from DOM. If the circles were JS created, they get pulled from JS cache (and they may have data on them, may be centaurs). So after selectAll we will get JS objects that may or may not be centaurs (have data attached)

    //.data(data) is very interesting. We have all the JS object circles with or without data, and we have a list of data. And we look through each data and compare it to our circle-data centaurs, and we sort the data into 3 piles: ENTER (no corresponding circle), UPDATE (there's a corresponding circle). Then we go look at circles and see who didn't get used and they are EXIT()

    //.join now join happens. For ENTER, create a new circle object in JS, cache it, put data on it, and shoot the obj part off to C++ for creation.

    //.UPDATE does nothing. .EXIT tells dom to kill the object.

    //The key point the last step of join is fetching the ENTER and UPDATE objects, and creating a list kind of thing - and that is what we are going to modify when we apply attributes

    //it's called Enter, Update, Exit. But I prefer Instantiate, Fetch, Remove. That's more precise.

    //We basically create something like an object literal with 3 lists in it - UPDATE:  Now we do data() If no circles, then we try to line them up with nodes, but we can't line them up. So we deliver

    //IF the circles were JS-created, then they are cached so we pull them from cache.

    const node = d3
      .select('.nodes_g') //selects the group nodes. Then within that group we select all circles.
      .selectAll('circle') //selects the SVG (either JS cached or from DOM, either cenaturs or not or none)
      .data(nodes) //sorts circles/data into enter, update, exit.
      .join('circle'); //removes all exit, instantiates all enter, does nothing to update (misnomer), and then fetches enter and update as a list — which we can then apply attributes to.

    node //styling
      .attr('fill', 'white')
      .attr('r', 5)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    node.call(utils.custom_drag(simulation));

    node.on('click', (event, d) => {
      event.stopPropagation();
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip
        .html(d.content)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`);
    });

    const labels = d3
      .select('.nodes_g') //note our text is really a seperate set of DOM elements they look nice with circles because both rely on absolute positioning from the d.x and d.y data.
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('x', (d) => d.x + 0)
      .attr('y', (d) => d.y - 20);

    labels // STYLING
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', "'Helvetica Neue', Arial, sans-serif")
      .attr('font-weight', '300')
      .attr('font-size', '10px')
      .style('text-transform', 'capitalize')
      .style('fill', '#f0f0f0');
  }

  function updateLinks() {
    const link_svgs = d3
      .select('.links_g') //same story here, select all the links and join them with the 'line' elements (or create them if they don't yet exist) then add all kinds of attributes to them. Links have an x1 y1 and x2y2 you can understand how that works
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    link_svgs // STYLING
      .attr('stroke', 'white') //note all of these attr have this implicit forEach functionality. This is relevant because when we refer to d d refers to a single link object
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 0.4)
      .attr('x1', (d) => d.source.x); //note that our joined object has both the svg line element and the data object. They are joined at the hip. So here we are updating the svg line element attribute x1 to match the d.sorce x. Note that attr has an implicit forEach functionalty so d refers to a single link object.
  }

  function ticked() {
    updateLinks();
    updateNodes();
    zoomNodesLabelsLinks(d3.zoomTransform(svg.node()).k); // Add this line
  }

  simulation.restart();
}

console.log(window.innerWidth), //used in multiple places
  console.log(window.innerHeight);
