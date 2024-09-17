from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import pickle
import json
import os
import test_content

class Text_chunk:
    def __init__(self, id, content, model):
        self.id = id
        self.content = content
        self.embedding = model.encode(content)

    def __str__(self):
        return f"S{self.id}: {self.content}"

def create_graph(content_chunks):
        
    if os.path.exists('d3_graph_data.json') and os.path.exists('sim.pkl'):
        print('Both graph and sim exist, loading them up')
        with open('graph.pkl', 'rb') as f:
            G = pickle.load(f)
        with open('sim.pkl', 'rb') as f:
            similarities = pickle.load(f)
        
        return G, similarities
    
    print('INITATING GRAPH BE PATIENT \n\n\n NEED TO DOWNLOAD BAAI')
    G = nx.Graph()

    model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    print('start making sentences and calculate embeddings')
    # Create chunks
    chunks = []

    for i, content in enumerate(content_chunks):
        text_chunk = Text_chunk(i, content, model)
        chunks.append(text_chunk)

    print('done making sentences and calculate embeddings')

    similarities = [] #for debugging purposes
    for chunk1 in chunks:
        this_chunk_similiarities = []
        G.add_node(chunk1.id, id=chunk1.id, content=chunk1.content)
        for chunk2 in chunks:
            if chunk1.id != chunk2.id:
                cos_sim = 1 - cosine(chunk1.embedding, chunk2.embedding)
                G.add_edge(chunk1.id, chunk2.id, weight=round(cos_sim, 4))
                this_chunk_similiarities.append({"id": chunk2.id, "content": chunk2.content, "cos_sim":cos_sim})

        this_chunk_similiarities.sort(key=lambda x: x["cos_sim"], reverse=True)
        similarities.append({"id":chunk1.id,"content":chunk1.content,"comp_chunks": this_chunk_similiarities})
    #need to save G to a json (or maybe need to pkl?) and need to save similarities to python (for debugging debugger UI)

    #parser (turn the graph into nodes and elements (maybe print to debug))
    nodes = [{"id": node, "content": G.nodes[node]["content"]} for node in G.nodes()]
    links = [{"source": u, "target": v, "weight": d["weight"]} for u, v, d in G.edges(data=True)]

    d3_compatible_data = {
        "nodes": nodes,
        "links": links
    }

    print(d3_compatible_data)

    # Save this data to a JSON file
    with open('d3_graph_data.json', 'w') as f:
        json.dump(d3_compatible_data, f)
    
    with open('sim.pkl', 'wb') as f:
        pickle.dump(similarities, f)
            
    return d3_compatible_data, similarities

graph, similar = create_graph(test_content.combined_notes)