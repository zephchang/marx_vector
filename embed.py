from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import pickle
import json
import os

with open('prepped_for_embedding.json', 'r') as file:
    nodes = json.load(file) #this is a dict with keys: source, local_id, content, label


#look big picture what i want to do is just return nodes and links

#nodes is just a dictionary of every piece of content . it's almost ready from prepped content it just needs embeddings. Really I shoudl just iterate over the prepped content and add embeddings and output that (or mutate that's fine too)

#links is a different but honeslty not that hard either. Just loop through and do cosine similarity and output into a links list. I don't think I need networkx at all. 

def add_embeds(nodes):

    print('INITATING GRAPH BE PATIENT \n\n\n NEED TO DOWNLOAD BAAI')
    model = SentenceTransformer('BAAI/bge-large-en-v1.5')    

    for i, node in enumerate(nodes):
        embedding = model.encode(node["content"])
        node["embedding"] = np.round(embedding, 4).tolist()
        node["global_id"] = i
        print("EMBED PROGRESS: ", i, "/", len(nodes))
    #nodes all have embeddings now. nexgt step is to generate links

    #links output is just for each item - calculate cos similarity of all other items. append to the edges list. Also append to the inspect_embeds list

    #edges list looks like {"source": u, "target": v, "weight": d["weight"], "rank":d["rank"]}
    #inspect_embeds list looks like {"global_id":chunk1.id,"content":chunk1.content,"comp_chunks": this_chunk_similiarities}

    edges =[]
    inspect_embeds = []

    for node1 in nodes:
        ranked_edges = []
        for node2 in nodes:
            if node1 != node2:
                cos_sim = 1 - cosine(node1["embedding"], node2["embedding"])
                ranked_edges.append({"source": node1["global_id"], "target": node2["global_id"], "cos_sim": cos_sim})
        ranked_edges.sort(key=lambda d: d["cos_sim"], reverse=True)
        ranked_edges = [{"rank":i, **edge} for i, edge in enumerate(ranked_edges)]
        edges += ranked_edges

    for node in nodes:
        node.pop("embedding",None)
    #ok now I want to write the nodes and embeds to a json. how do I write to a json?   
    output_data = {
        "nodes": nodes,
        "links": edges
    }

    with open('d3_graph_data.json', 'w') as f:
        json.dump(output_data, f, indent=2)

add_embeds(nodes)