import streamlit as st
import pandas as pd
from main import create_graph, test_content

# Create the graph and get similarities
graph, similarities = create_graph(test_content.combined_notes)

st.title("Embedding Similarity Debugger")

# Create tabs for each chunk
tabs = st.tabs([f"Chunk {sim['id']}" for sim in similarities])

for i, tab in enumerate(tabs):
    with tab:
        st.header(f"Chunk {similarities[i]['id']}")
        st.text_area("Content", similarities[i]['content'], height=200, key=f"content_{i}")
        
        st.subheader("Similar Chunks")
        df = pd.DataFrame(similarities[i]['comp_chunks'])
        df = df[['id', 'cos_sim', 'content']]
        # No truncation needed for content display
        st.dataframe(df, height=400, key=f"dataframe_{i}")
