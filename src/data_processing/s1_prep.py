import json
from typing import List
import os
from dotenv import load_dotenv
from openai import OpenAI
import src.data_processing.s0_raw_content as raw_content
from tenacity import retry, stop_after_attempt, wait_exponential

# Load environment variables from keys.env
load_dotenv('keys.env')

# Access the OpenAI API key from the environment variables
openai_api_key = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)


def prep_strip (content):
    split_text = [line.strip() for line in content.split("\n") if line.strip()]
    
    combined_text = []
    i = 0
    while i < len(split_text):
        current_line = split_text[i]
        while len(current_line.split()) < 20 and i + 1 < len(split_text):
            i += 1
            current_line += " " + split_text[i]
        combined_text.append(current_line)
        i += 1

    return combined_text

def prep_dicts(combined_text,content_source):
    finish = len(combined_text)
    k = 0
    ready_for_embedding = []
    for i, chunk in enumerate(combined_text):
        ready_for_embedding.append({"content_source": content_source, "local_id": i, "content": chunk, "label": gpt_label(chunk,content_source)})
        print('PROGRESS:', k, '/', finish)
        k+=1
    return ready_for_embedding


@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=10))
def gpt_label(chunk, content_source):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": f"{chunk}\n\nThis is a passage from {content_source}. Write a note that summarizes this passage in very very few words (3-5). Give your response in brackets [note_here]"}]
    )
    return completion.choices[0].message.content[1:-1]

def full_prep(content, content_source):
    stripped: List[str] = prep_strip(content)
    dicts = prep_dicts(stripped, content_source)
    
    # Save the dicts to a JSON file
    with open('prepped_for_embedding.json', 'w') as f:
        json.dump(dicts, f)
    
    return dicts

full_prep(raw_content.chap_3_marx, "Capital: Chapter 3 (Karl Marx)")


