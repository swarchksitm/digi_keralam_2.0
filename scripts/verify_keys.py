
import re

FILE_PATH = 'frontend/src/data/lsgi_master.ts'

def check_keys():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to find keys in the object
    # The structure is export const LSGI_MASTER_LIST ... = {
    #     "Key": { ...
    
    # Let's just look for lines starting with 4 spaces and a quoted string followed by colon and brace
    matches = re.findall(r'^\s{4}"([^"]+)": {', content, re.MULTILINE)
    
    print(f"Found {len(matches)} keys:")
    for m in sorted(matches):
        print(f"- {m}")

if __name__ == '__main__':
    check_keys()
