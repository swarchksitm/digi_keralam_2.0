import re

def parse_django_models(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    models = []
    current_model = None
    
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        
        # Match model class definition
        class_match = re.match(r'class\s+(\w+)\(.*?:', line)
        if class_match:
            if current_model:
                models.append(current_model)
            current_model = {
                'name': class_match.group(1),
                'fields': [],
                'meta': {}
            }
            continue
            
        if not current_model:
            continue

        # Match fields
        # field_name = models.Type(args)
        field_match = re.search(r'^(\w+)\s*=\s*models\.(\w+)\((.*)\)', line)
        if field_match:
            field_name = field_match.group(1)
            field_type = field_match.group(2)
            field_args = field_match.group(3)
            current_model['fields'].append({
                'name': field_name,
                'type': field_type,
                'args': field_args
            })
            continue

        # Match Meta db_table
        if 'db_table =' in line:
            db_table_match = re.search(r"db_table\s*=\s*['\"](.*?)['\"]", line)
            if db_table_match:
                current_model['meta']['table_name'] = db_table_match.group(1)

    if current_model:
        models.append(current_model)
        
    return models

def generate_markdown(models):
    md_output = "# Database Schema Documentation\n\n"
    md_output += "Generated from current database structure.\n\n"
    
    # Sort models by name
    models.sort(key=lambda x: x['name'])
    
    for model in models:
        table_name = model['meta'].get('table_name', 'N/A')
        md_output += f"## Table: {model['name']}\n"
        md_output += f"**DB Table Name**: `{table_name}`\n\n"
        
        md_output += "| Field Name | Data Type | Attributes |\n"
        md_output += "|---|---|---|\n"
        
        for field in model['fields']:
            # Clean up args for better readability
            args = field['args']
            # specific fix for foreign keys to look nicer
            if field['type'] == 'ForeignKey':
                # extraction logic could be better but basic cleanup helps
                pass
            
            md_output += f"| **{field['name']}** | {field['type']} | `{args}` |\n"
        
        md_output += "\n---\n\n"
        
    return md_output

def main():
    input_file = 'db_structure.txt'
    output_file = 'DATABASE_SCHEMA.md'
    
    print(f"Reading from {input_file}...")
    models = parse_django_models(input_file)
    print(f"Found {len(models)} models.")
    
    print(f"Generating markdown...")
    md_content = generate_markdown(models)
    
    with open(output_file, 'w') as f:
        f.write(md_content)
    
    print(f"Done! Written to {output_file}")

if __name__ == '__main__':
    main()
