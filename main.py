from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import pickle
import json
import os
import test_content
import streamlit as st
import pandas as pd

class Text_chunk:
    def __init__(self, id, content, model):
        self.id = id
        self.content = content
        self.embedding = model.encode(content)

    def __str__(self):
        return f"S{self.id}: {self.content}"

def create_graph(content_chunks):
        
    if os.path.exists('graph.pkl') and os.path.exists('sim.pkl'):
        print('Both exist, loading them up')
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

    with open('graph.pkl', 'wb') as f:
        pickle.dump(G, f)
    
    with open('sim.pkl', 'wb') as f:
        pickle.dump(similarities, f)
            
    return G, similarities

def print_most_similar_pairs(similarities, top_n=5):

    for sim_data in similarities:
        print('CHUNK:', sim_data["id"], 'CONTENT', sim_data["content"][:50])
        for comp_chunk in sim_data["comp_chunks"][:top_n]:
            print("     cos_sim =",comp_chunk['cos_sim'],'content =', comp_chunk['content'][:50])

graph, similar = create_graph(test_content.combined_notes)

print_most_similar_pairs(similar)