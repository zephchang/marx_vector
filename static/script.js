'use strict';

console.log('test');

async function fetchGraphdata() {
  try {
    const response = await fetch('/api/graph');
    if (!response.ok) {
      throw new Error(`HTTP error! Stats: ${response.status}`);
    }
    const graphData = await response.json();
    console.log(graphData);
  } catch (error) {
    console.log('error fetching data:', error);
  }
}

console.log('Script loaded, calling fetchGraphdata');
fetchGraphdata();
// const cy = cytoscape({
//   container: document.getElementById('cy'),
//   elements: [
//     // nodes
//     { data: { id: 'a' } },
//     { data: { id: 'b' } },
//     { data: { id: 'c' } },
//     { data: { id: 'd' } },
//     { data: { id: 'e' } },
//     { data: { id: 'f' } },
//     // edges
//     {
//       data: {
//         id: 'ab',
//         source: 'a',
//         target: 'b',
//       },
//     },
//     {
//       data: {
//         id: 'cd',
//         source: 'c',
//         target: 'd',
//       },
//     },
//     {
//       data: {
//         id: 'ef',
//         source: 'e',
//         target: 'f',
//       },
//     },
//     {
//       data: {
//         id: 'ac',
//         source: 'a',
//         target: 'c',
//       },
//     },
//     {
//       data: {
//         id: 'be',
//         source: 'b',
//         target: 'e',
//       },
//     },
//   ],
//   style: [
//     {
//       selector: 'node',
//       style: {
//         shape: 'hexagon',
//         'background-color': 'red',
//         label: 'data(id)',
//       },
//     },
//   ],
//   layout: {
//     name: 'cose',
//   },
// });

// for (let i = 0; i < 10; i++) {
//   cy.add({
//     data: { id: 'node' + i },
//   });
//   let source = 'node' + i;
//   cy.add({
//     data: {
//       id: 'edge' + i,
//       source: source,
//       target: i % 2 == 0 ? 'a' : 'b',
//     },
//   });
// }

// cy.layout({
//   name: 'cose',
// }).run();
