'use strict';

async function initializeGraph() {
  try {
    const response = await fetch('/api/graph');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const graphData = await response.json();

    // graphData.elements.edges = graphData.elements.edges.filter(
    //   (edge) => edge.data.weight >= 0.5
    // );

    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: graphData.elements,
      directed: false,
      multigraph: false,
      style: [
        {
          selector: 'node',
          style: {
            shape: 'circle',
            'background-color': 'blue',
            label: 'data(id)',
            width: '20px', // Set a base width
            height: '20px', // Set a base height
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2, // Increased for better visibility
            'line-color': '#ccc',
            'curve-style': 'bezier',
            opacity: (ele) => {
              const weight = ele.data('weight');
              // Apply a more aggressive transformation to the weight
              return Math.pow(weight, 5);
            },
          },
        },
      ],
      layout: {
        name: 'fcose',
        // 'draft', 'default' or 'proof'
        // - "draft" only applies spectral layout
        // - "default" improves the quality with incremental layout (fast cooling rate)
        // - "proof" improves the quality with incremental layout (slow cooling rate)
        quality: 'default',
        // Use random node positions at beginning of layout
        // if this is set to false, then quality option must be "proof"
        randomize: true,
        // Whether or not to animate the layout
        animate: true,
        // Duration of animation in ms, if enabled
        animationDuration: 1000,
        // Easing of animation, if enabled
        animationEasing: undefined,
        // Fit the viewport to the repositioned nodes
        fit: true,
        // Padding around layout
        padding: 30,
        // Whether to include labels in node dimensions. Valid in "proof" quality
        nodeDimensionsIncludeLabels: false,
        // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
        uniformNodeDimensions: false,
        // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
        packComponents: true,
        // Layout step - all, transformed, enforced, cose - for debug purpose only
        step: 'all',

        /* spectral layout options */

        // False for random, true for greedy sampling
        samplingType: true,
        // Sample size to construct distance matrix
        sampleSize: 25,
        // Separation amount between nodes
        nodeSeparation: 75,
        // Power iteration tolerance
        piTol: 0.0000001,

        /* incremental layout options */

        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: (node) => 100,
        // Ideal edge (non nested) length
        idealEdgeLength: (edge) => {
          const weight = edge.data('weight');
          return 500 * (1 - Math.pow(weight, 4));
        },
        // Divisor to compute edge forces
        edgeElasticity: (edge) => Math.pow(edge.data('weight'), 3),
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 0.1,
        // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
        numIter: 2500,
        // For enabling tiling
        tile: true,
        // The comparison function to be used while sorting nodes during tiling operation.
        // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
        // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
        // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
        // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
        // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
        tilingCompareBy: undefined,
        // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingVertical: 10,
        // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingHorizontal: 10,
        // Gravity force (constant)
        gravity: 0,
        // Gravity range (constant) for compounds
        gravityRangeCompound: 1.5,
        // Gravity force (constant) for compounds
        gravityCompound: 1.0,
        // Gravity range (constant)
        gravityRange: 3.8,
        // Initial cooling factor for incremental layout
        initialEnergyOnIncremental: 0.3,

        /* constraint options */

        // Fix desired nodes to predefined positions
        // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
        fixedNodeConstraint: undefined,
        // Align desired nodes in vertical/horizontal direction
        // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
        alignmentConstraint: undefined,
        // Place two nodes relatively in vertical/horizontal direction
        // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
        relativePlacementConstraint: undefined,

        /* layout event callbacks */
        ready: () => {}, // on layoutready
        stop: () => {}, // on layoutstop
      },
    });

    // Adjust node size based on zoom level
    const adjustNodeSize = () => {
      const zoom = cy.zoom();
      cy.nodes().forEach((node) => {
        node.style({
          width: `${10 / zoom}px`,
          height: `${10 / zoom}px`,
          'font-size': `${12 / zoom}px`, // Adjust font size
        });
      });
      cy.edges().forEach((edge) => {
        edge.style({
          width: `${1 / zoom}px`, // Adjust edge width
        });
      });
    };

    // Initial adjustment
    adjustNodeSize();

    // Adjust on zoom
    cy.on('zoom', adjustNodeSize);

    return cy;
  } catch (error) {
    console.error('Error initializing graph:', error);
  }
}

// Call the function to initialize the graph
initializeGraph();
