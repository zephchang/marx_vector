'use strict';

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
              width: 'data(weight)',
              'line-color': '#ccc',
              'curve-style': 'bezier',
            },
          },
        ],
        layout: {
          name: 'cose',
          idealEdgeLength: 100,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        },
      });

      cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        console.log('Tapped node: ' + node.id());
        // You can add more interactivity here, like showing node details
      });
    })
    .catch((error) => console.error('Error fetching graph data:', error));
});
