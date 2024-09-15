from flask import Flask, jsonify, render_template
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import pickle
import os
import content

app = Flask(__name__)


class Sentence:
    def __init__(self, id, content, model):
        self.id = id
        self.content = content
        self.embedding = model.encode(content)

    def __str__(self):
        return f"S{self.id}: {self.content}"

def create_graph():
    G = nx.Graph()
    alpha = 15
    graph_file = 'sentence_graph.pkl'
    redo_pkl = False

    if not redo_pkl and os.path.exists(graph_file):
        # Load the existing graph if the file exists
        with open(graph_file, 'rb') as f:
            G = pickle.load(f) #this unpickles the data
        print("Loaded existing graph from file.")
    else:
        model = SentenceTransformer('BAAI/bge-large-en-v1.5')
        print('start making sentences and calculate embeddings')

        content_chunks = content.combined_notes
        # Create Sentence objects
        sentences = []

        for i, content in enumerate(content_chunks):
            sentence = Sentence(i, content, model)
            sentences.append(sentence)

        print('done making sentences and calculate embeddings')

        for s1 in sentences:
            G.add_node(s1.id, sentence=s1.content)
            for s2 in sentences:
                if s1.id < s2.id:  # Avoid duplicate calculations
                    similarity = 1 - cosine(s1.embedding, s2.embedding)
                    G.add_edge(s1.id, s2.id, weight=round(similarity, 4))

        # Save the graph to a file
        with open(graph_file, 'wb') as f:
            pickle.dump(G, f)
        print("Created and saved new graph to file.")
    
    return G

@app.route('/api/graph')
def get_graph():
    print('python BE api called')
    G = create_graph()
    # Convert graph to JSON-serializable format
    graph_data = nx.node_link_data(G)
    return jsonify(graph_data)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
