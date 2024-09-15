from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt

class Sentence:
    def __init__(self, id, content, model):
        self.id = id
        self.content = content
        self.embedding = model.encode(content)

    def __str__(self):
        return f"S{self.id}: {self.content}"

model = SentenceTransformer('BAAI/bge-large-en-v1.5')

# Create Sentence objects
sentences = [
    Sentence(0, "The sun is shining brightly in the clear blue sky.", model),
    Sentence(1, "The sun is gleaming intensely in the cloudless azure sky.", model),
    Sentence(2, "Sunlight radiates brilliantly from the pristine cerulean heavens.", model),
    Sentence(3, "The feline is resting quietly on the window ledge.", model),
    Sentence(4, "A cat is napping peacefully on the windowsill.", model),
    Sentence(5, "Quantum mechanics describes the behavior of subatomic particles.", model),
    Sentence(6, "The Eiffel Tower is an iconic landmark in Paris, France.", model),
    Sentence(7, "Photosynthesis is the process by which plants convert light into energy.", model),
    Sentence(8, "The stock market is experiencing a significant uptrend.", model),
    Sentence(9, "Financial indicators point to a substantial bull market.", model)
]

# Calculate cosine similarity for all pairs of sentences
G = nx.Graph()
alpha = 15


for s1 in sentences:
    G.add_node(s1.id, sentence=s1.content)
    for s2 in sentences:
        if s1.id < s2.id:  # Avoid duplicate calculations
            similarity = 1 - cosine(s1.embedding, s2.embedding)
            similarity_adjusted = np.exp(similarity * alpha) - 1
            G.add_edge(s1.id, s2.id, weight=round(similarity_adjusted, 4))

# Calculate layoutp
pos = nx.spring_layout(G, k=0.5, iterations=50)

# Draw the graph
plt.figure(figsize=(12, 8))
nx.draw_networkx_nodes(G, pos, node_size=1000, alpha=0.8)
nx.draw_networkx_edges(G, pos, width=[G[u][v]['weight'] * 5 for u, v in G.edges()], alpha=0.5)
nx.draw_networkx_labels(G, pos, {i: f"S{i}" for i in G.nodes()}, font_size=8)

# Add a title
plt.title("Sentence Similarity Network", fontsize=16)

# Remove axis
plt.axis('off')

# Show the plot
plt.tight_layout()
plt.show()

# Print sentence details
for sentence in sentences:
    print(sentence)