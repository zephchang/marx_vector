'use strict';

cytoscape.use(cytoscapeCola);

document.addEventListener('DOMContentLoaded', function () {
  fetch('/api/graph')
    .then((response) => response.json())
    .then((graphData) => {
      console.log('Raw graph data:', graphData);

      // Transform the data for Cytoscape
      const elements = [];

      // Add nodes
      graphData.nodes.forEach((node) => {
        elements.push({
          group: 'nodes',
          data: { id: node.id, sentence: node.sentence },
        });
      });

      // Add edges
      graphData.links.forEach((link) => {
        elements.push({
          group: 'edges',
          data: {
            id: `${link.source}-${link.target}`,
            source: link.source,
            target: link.target,
            weight: link.weight,
          },
        });
      });

      console.log('Transformed elements:', elements);

      // // Debug: Log all edge weights
      // console.log('Debugging edge weights:');
      // data.forEach((element) => {
      //   if (element.group === 'edges') {
      //     console.log(
      //       `Edge ${element.data.source} -> ${element.data.target}: weight = ${element.data.weight}`
      //     );
      //   }
      // });

      // // Calculate weight statistics
      // let weights = data
      //   .filter((element) => element.group === 'edges')
      //   .map((edge) => edge.data.weight);
      // let minWeight = Math.min(...weights);
      // let maxWeight = Math.max(...weights);
      // let avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
      // console.log(
      //   `Weight stats - Min: ${minWeight}, Max: ${maxWeight}, Avg: ${avgWeight}`
      // );

      const cy = cytoscape({
        container: document.getElementById('cy'), //tells cytoscape where to put the canvas.
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              label: 'data(id)',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#ccc',
              'curve-style': 'bezier',
              opacity: 'data(weight)', // Use cosine similarity as edge opacity
            },
          },
        ],
        layout: {
          name: 'cola',
          nodeSpacing: 100,
          edgeLength: function (edge) {
            return 200 / (edge.data('weight') + 1);
          },
          animate: true,
          randomize: true,
          maxSimulationTime: 3000,
          infinite: true,
          fit: true,
          padding: 30,
          convergenceThreshold: 0.01,
        },
      });

      cy.on('cxttap', function (event) {
        // Prevent Cytoscape from capturing right-clicks
        if (event.target === cy) {
          event.preventDefault();
          return false;
        }
      });

      cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        console.log('Tapped node: ' + node.id());
        // You can add more interactivity here, like showing node details
      });
    })
    .catch((error) => console.error('Error fetching graph data:', error));
});
