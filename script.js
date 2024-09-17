/*
 ok see let's see if I can describe what's going on here big picture we start by 

first important thing that happens is doing this svg thing where we create an svg thing and that's going to be our container. Then inside that svg we put our two groups with classes links and nodes. actually from this point on we only modify those groups

Now we construct our simulation which is a force simulation based on our nodes. The node data is really not important when force simulation first constructed - it just makes a ndoe for every object in nodes list

then we start to make that force simulation more interesting - we do force charge and center which apply to all nodes

Then we do link. Link is the first one where we are saying

hey do forceLInk and you're going to use this chart of link directions and connect allthe nodes accordingly. we add this d => d.name thing so that forceLink knows what attribute of the nodes that links chart is referencing

then we have tick to just update every tick

updates are interesing

first we select all of the nodes (so that's going to be a bunch of circle_element-node_data objects that are already iin svg

we take our node data and line them up with those objects (the data might have been changed or somethign) and basically we try to line it up such that if all the data stays the same bound to same nodes, that's great. But if there are changes we line them up here

then we join them and create a new set of element-object bindings (though it's pretty much the same)

then we do for each of those apply styling using attr and then also location> Location is particularly interesting you are going to adjust the element location (cx) by referencing it's data_object x

this is why it is so useful and important to have these objects bound to one another

Same thing for text

same thing for updateLInks but it's a bit more exciting because links have 2 sets of coordinagtes y1 y2 x1x2 and those come from source
*/

const width = 900, //for use in the svg creation later
  height = 900;

const nodes = [
  { name: 'A' },
  { name: 'B' },
  { name: 'C' },
  { name: 'D' },
  { name: 'E' },
  { name: 'F' },
  { name: 'G' },
  { name: 'H' },
];

const links = [
  { source: 'A', target: 'B', weight: 0.5 },
  { source: 'A', target: 'C', weight: 0.6 },
  { source: 'A', target: 'D', weight: 0.4 },
  { source: 'B', target: 'G', weight: 0.7 },
  { source: 'D', target: 'E', weight: 0.5 },
  { source: 'D', target: 'H', weight: 0.8 }, // random one with 0.8
  { source: 'E', target: 'F', weight: 0.6 },
  { source: 'E', target: 'H', weight: 0.7 },
];

const svg = d3
  .select('#chart-container') //this is bascially like vanilla JS element selector and then we element create svg and then set it's styling to width height etc
  .append('svg')
  .attr('width', width)
  .attr('height', height);

svg.append('g').attr('class', 'links'); //ok now we create two groupings of links and nodes (which are kinda like divs
svg.append('g').attr('class', 'nodes');

const simulation = d3 //ok time to intiative the simulation. we use the forceSimulation constructor which constructs a force simulation element using nodes as the input. Note - this does not go into SVG yet, it is just a loose object on the workbench (similar to createElement in vanilla)
  .forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength(-100))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force(
    'link',
    d3
      .forceLink(links)
      .id((d) => d.name) //so forceLink(links) basically says apply all the force links based on this link schema. Howevedr as a caveat forceLink wants to know hey for your link schema when you specify source and target, what attrribute of your nodes (d) are you referring to as your id for linking? in this case we are using name.
      .strength((d) => Math.pow(Math.E, 5 * (d.weight - 1)))
    //note: d = data
  )
  .on('tick', ticked); //tick is like some pseudo time thing. Every time you hear a tick run ticked (this is liek an event listener)

function updateNodes() {
  d3.select('.nodes') //selects group nodes (was defined as a class earlier) so note we are manipulating the groups inside the svg, though not the svg itself.
    .selectAll('circle') //creates a selection of all the circle elements (could be none)
    .data(nodes) //.data lines up the circle elements with nodes - if tehre are any comon keys, we match them, otherwise we just use array indices. We are literally joining together the circle DOM elements with the node data element - they are bound together. Somehow this is very useful later
    .join('circle') // now we take the selection and data which have been lined up, and modify the DOM accordingly, adding or removing any elements while keeping the bindings the same.
    .attr('r', 5) // radius of your circles set to 5
    .attr('fill', '#69b3a2') //color of circles declared
    .attr('cx', (d) => d.x) //set center of circle to the node's x value. Note x and y were not specified but actually forceSimulator added those attributes when it was created
    .attr('cy', (d) => d.y);

  //shoudl try styling circles using css rather than inline

  d3.select('.nodes') //note our text is really a seperate set f DOM elements they look nice with circles because both rely on absolute positioning from the d.x and d.y data.
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text((d) => d.name)
    .attr('x', (d) => d.x + 8)
    .attr('y', (d) => d.y + 5)
    .attr('font-size', '12px');
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
