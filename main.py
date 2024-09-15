from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import pickle
import os
import textwrap

import content

class Sentence:
    def __init__(self, id, content, model):
        self.id = id
        self.content = content
        self.embedding = model.encode(content)

    def __str__(self):
        return f"S{self.id}: {self.content}"

# Calculate cosine similarity for all pairs of sentences
G = nx.Graph()
alpha = 15

graph_file = 'sentence_graph.pkl'

redo_pkl = False

if not redo_pkl and os.path.exists(graph_file):
    # Load the existing graph if the file exists
    with open(graph_file, 'rb') as f:
        G = pickle.load(f)
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
    # Create the graph if the file doesn't exist
    for s1 in sentences:
        G.add_node(s1.id, sentence=s1.content)
        for s2 in sentences:
            if s1.id < s2.id:  # Avoid duplicate calculations
                similarity = 1 - cosine(s1.embedding, s2.embedding)
                similarity_adjusted = np.exp(similarity * alpha) - 1
                G.add_edge(s1.id, s2.id, weight=round(similarity_adjusted, 4))
    
    # Save the graph to a file
    with open(graph_file, 'wb') as f:
        pickle.dump(G, f)
    print("Created and saved new graph to file.")

# Calculate layout
pos = nx.spring_layout(G, k=0.5, iterations=50)

# Draw the graph
fig, ax = plt.subplots(figsize=(12, 8))
nx.draw_networkx_nodes(G, pos, node_size=1000, alpha=0.8, ax=ax)
nx.draw_networkx_edges(G, pos, width=0.5, alpha=0.5, edge_color='lightgrey', ax=ax)
nx.draw_networkx_labels(G, pos, {i: f"S{i}" for i in G.nodes()}, font_size=8, ax=ax)

# Add a title
ax.set_title("Sentence Similarity Network", fontsize=16)

# Remove axis
ax.axis('off')
# Create annotation object
annot = ax.annotate("", xy=(0,0), xytext=(20,20), textcoords="offset points",
                    bbox=dict(boxstyle="round", fc="w"),
                    arrowprops=dict(arrowstyle="->"))

annot.set_visible(False)

def update_annot(pos, node):
    annot.xy = pos[node]
    text = G.nodes[node]['sentence']
    # Wrap the text to a fixed width
    wrapped_text = textwrap.fill(text, width=40)
    annot.set_text(wrapped_text)
    annot.get_bbox_patch().set_alpha(0.4)
    # Adjust the bbox to fit the wrapped text
    bbox = annot.get_bbox_patch()
    bbox.set_width(250)
    bbox.set_height(len(wrapped_text.split('\n')) * 20 + 10)

    annot.set_zorder(1000)

def hover(event):
    vis = annot.get_visible()
    if event.inaxes == ax:
        # Get the current axis limits
        xlim = ax.get_xlim()
        ylim = ax.get_ylim()
        
        # Calculate a threshold based on the current view
        threshold = 0.05 * min(xlim[1]-xlim[0], ylim[1]-ylim[0])
        
        for node, (x, y) in pos.items():
            if abs(event.xdata - x) < threshold and abs(event.ydata - y) < threshold:
                update_annot(pos, node)
                annot.set_visible(True)
                fig.canvas.draw_idle()
                return
    if vis:
        annot.set_visible(False)
        fig.canvas.draw_idle()

fig.canvas.mpl_connect("motion_notify_event", hover)

plt.tight_layout()
plt.show()

# Print sentence details
for sentence in sentences:
    print(sentence)