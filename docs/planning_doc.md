1. try doing 30 summaries [done]

2. try doing 30 book paragraphs from marx [done]

Ugh I hate this

1. Rewrite the python code to create a neworkx embedding and have some way of doing manual embedding checks to see if the embeddings look good. Code should (1) do a manual embedding check (2) pkl things

> get a print version working [done]

> save the similarities and the G so we don't have to run BAII every time [done]

> create some kind of visual debugger maybe streamlit? [done]

> NOTE: these embeddings are fucking dope. Man the NLP people are amazing.

2. Seperate file we are going to do D3. Fuck cytoscape. I hate cytoscape Fuck cytoscape. and Cola and cose and fcose and all this bs.

Get D3 working and stuff [done]

Do some D3 weights and see if we can get lengths in a way that makes sense [done]

Setup main.py to rank links in order by number. That's probably just a link attribute. Then on the script.js side we can serve only a subset. Probably top 5 or you could say top 5 & above threshold of .6 or something like that. [done]

then we can weight them equally or set link length + repel and go from there, maybe that's prettier. I wonder how obsidian does it. Optimize for PRETTY not informational [done]

Ok so now what? I am imagining two use cases. First is to show a graph of a book. The second is to add in notes handful by handful as some kind of progress or growth.

> labels on nodes [done] this does indeed make things look very cool. LLM could do this well.

> get labels that are actually relevant [done]

> setup main.py so that we pass in the richer data to the d3 grapher [done]

> rewrite main.py completely [done]

> get streamlit inspector for embeds rewritten [done]

> get the new stuff hooked up to d3 [done]

> let's try just straight up using chapters from marx and see what happens. [done]

FEATURE IDEAS

> clean up the file structure a bit [done]

> node and node text zoom [done]

> link zooming kinda sucks - better to be beyond a certain threshold [done]

Ok so our general approach is we are going to use as our data input a list of nodes from the book. At some point we'll rewrite the backend so that it delivers a lists of lists of ndodes (one list for each chapter).

Anyway either way, what we do is we're going to take the book list and we are going to create a div for each paragraph in JS. How do we create that div? content is going to be paragraph content and then we also add index as a data attrribute of the div.

So we have generated on the right the entire book, overflow y scroll etc.

then it's simple enough - when you click on a node, take what is in the current right side div and select element with the data object book_title-index_9 or something like that and scroll such that that is centered center on the screen

> in script.js, go through list of nodes and create divs for each one and insert into the right side div. so we get scroll

> try some text that is more skimmable (not marx) maybe like that book on god or something. Maybe the Jappe book.

> different colors for different chapters

> count links to node and size/color based on backlinks

> let's try doing a shit ton of nodes.

> page rank size of node by how many links go to it - and then color red yellow green blue based on size.

> what is the done state? do all of capital (or a bunch of chapters) and get it as pretty as possible.

> Move the styling outside of d3 so that we have more seperation of concerns css

https://cambridge-intelligence.com/automatic-graph-layouts/

> layout suggestions

- perhaps a custom force to suggest against 180 degree links. Learn about custom forces more broadly
- experiment with a manually defined attraction force (0-5 is repulsion, 5-7 is attraction 7-10 is super attraction)
