import streamlit as st
import pandas as pd
import json

with open('d3_graph_data.json', "r") as file:
    graph_data = json.load(file)

nodes = graph_data["nodes"]
links = graph_data["links"]

#ok so our basic idea is that we are going to go through nodes and for each node we are going to grab the glboal id. Then look through links for all links which have source = that global_id (should be sorted already) just append to list


processed_nodes = []
for node in nodes:
    node_id = node["global_id"]
    node_links = []
    for link in links:
        if link["source"] ==node_id:
            node_links.append(link)
    node_links.sort(key=lambda x: x["cos_sim"], reverse=True)

    processed_nodes.append({
        "id":node_id,
        "content": node["content"],
        "links":node_links
})

#ok now somehow display this in streamlit and streamlit should display the content of the anchor node (that would be node["content"] and then all the other nodes below, their node["content"] and node[cos_sim] ranked (butthe list should be sorted by rank anyway))


st.title("Embedding Similarity Debugger")

# Create tabs for each processed node
tabs = st.tabs([f"Chunk {node['id']}" for node in processed_nodes])

for i, tab in enumerate(tabs):
    with tab:
        st.header(f"Chunk {processed_nodes[i]['id']}")
        st.text_area("Content", processed_nodes[i]['content'], height=200, key=f"content_{i}")
        
        st.subheader("Similar Chunks")
        
        # Create a DataFrame from the links
        df = pd.DataFrame(processed_nodes[i]['links'])
        df = df[['target', 'cos_sim']]
        
        # Add content to the DataFrame
        df['content'] = df['target'].apply(lambda x: next((node['content'] for node in nodes if node['global_id'] == x), None))
        
        # Display the DataFrame
        st.dataframe(df, height=400, key=f"dataframe_{i}")
