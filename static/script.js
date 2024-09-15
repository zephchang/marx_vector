'use strict';

cytoscape.use(cytoscapeCola);

document.addEventListener('DOMContentLoaded', function () {
  fetch('/api/graph')
    .then((response) => response.json())
    .then((data) => {
      const cy = cytoscape({
        container: document.getElementById('cy'), //tells cytoscape where to put the canvas.
        elements: data,
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
          nodeSpacing: 30,
          edgeLength: function (edge) {
            return edge.data('weight'); // Inverse relationship: higher similarity = shorter edge
          },
          animate: true,
          randomize: false,
          maxSimulationTime: 1500,
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
