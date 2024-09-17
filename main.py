from flask import Flask, jsonify, render_template
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import json
import os
import test_content

app = Flask(__name__)

class Text_chunk:
    def __init__(self, id, content, model):
        self.id = id
        self.content = content
        self.embedding = model.encode(content)

    def __str__(self):
        return f"S{self.id}: {self.content}"

def create_graph():
    G = nx.Graph()

    model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    print('start making sentences and calculate embeddings')

    content_chunks = test_content.combined_notes
    # Create chunks
    chunks = []

    for i, content in enumerate(content_chunks):
        text_chunk = Text_chunk(i, content, model)
        chunks.append(text_chunk)

    print('done making sentences and calculate embeddings')

    for chunk1 in chunks:
        G.add_node(chunk1.id, id=chunk1.id, content=chunk1.content)
        for chunk2 in chunks:
            if chunk1.id < chunk2.id:  # Avoid duplicate calculations
                similarity = 1 - cosine(chunk1.embedding, chunk2.embedding)
                G.add_edge(chunk1.id, chunk2.id, weight=round(similarity, 4))
    return G

@app.route('/api/graph')
def get_graph():
    print('python BE api called')

    graph_file = 'sentence_graph.json'
    if os.path.exists(graph_file):
        with open(graph_file, 'r') as f:
            graph_data = json.load(f)
        print('Loaded existing graph data from json file')
        return graph_data
    
    else:
        print('create graph triggered')
        G = create_graph()
        graph_data = nx.cytoscape_data(G, name='name', ident='id' )

        with open(graph_file, 'w') as f:
            json.dump(graph_data, f)
        print(f'Created and saved new graph data to {graph_file}')
        
        return graph_data


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
