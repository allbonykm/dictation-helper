import re
import os

def parse_dictation(file_path):
    print(f"Parsing {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    data = {}
    current_id = 0
    current_title = ""
    current_sentences = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        match = re.match(r'^(\d+)급(?:\s*\((.*)\))?', line)
        if match:
            if current_id > 0:
                print(f"Set {current_id} parsed with {len(current_sentences)} sentences.")
                data[current_id] = {
                    "id": current_id,
                    "title": current_title,
                    "sentences": current_sentences
                }
            
            current_id = int(match.group(1))
            title_text = match.group(2) if match.group(2) else ""
            if not title_text:
                current_title = f"{current_id}급"
            else:
                current_title = f"{current_id}급: {title_text}"
            current_sentences = []
        else:
            if current_id > 0:
                current_sentences.append(line)
                
    if current_id > 0:
        print(f"Last set {current_id} parsed with {len(current_sentences)} sentences.")
        data[current_id] = {
            "id": current_id,
            "title": current_title,
            "sentences": current_sentences
        }
        
    return data

def generate_ts_content(data):
    ts_content = "export interface DictationSet {\n"
    ts_content += "  id: number;\n"
    ts_content += "  title: string;\n"
    ts_content += "  sentences: string[];\n"
    ts_content += "}\n\n"
    ts_content += "export const DICTATION_DATA: Record<number, DictationSet> = {\n"
    
    for id in sorted(data.keys()):
        item = data[id]
        ts_content += f"  {id}: {{\n"
        ts_content += f"    id: {id},\n"
        ts_content += f'    title: "{item["title"]}",\n'
        ts_content += "    sentences: [\n"
        for s in item["sentences"]:
            # Escape double quotes in sentences
            s_escaped = s.replace('"', '\\"')
            ts_content += f'      "{s_escaped}",\n'
        ts_content += "    ]\n"
        ts_content += "  },\n"
        
    ts_content += "};\n"
    return ts_content

if __name__ == "__main__":
    file_path = r'c:\Users\user\.gemini\antigravity\scratch\dictation-helper\dictation_sentence.txt'
    output_path = r'c:\Users\user\.gemini\antigravity\scratch\dictation-helper\src\data\sentences.ts'
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
    else:
        data = parse_dictation(file_path)
        ts_content = generate_ts_content(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        print(f"Successfully updated {output_path}")
