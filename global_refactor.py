import os, re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Text colors
    content = re.sub(r'style=\{\{\s*color:\s*COLORS\.text\.primary\s*\}\}', 'className="text-text-primary"', content)
    content = re.sub(r'style=\{\{\s*color:\s*COLORS\.text\.secondary\s*\}\}', 'className="text-text-secondary"', content)
    content = re.sub(r'style=\{\{\s*color:\s*COLORS\.text\.muted\s*\}\}', 'className="text-text-muted"', content)
    content = re.sub(r'style=\{\{\s*color:\s*COLORS\.text\.dimmed\s*\}\}', 'className="text-text-dimmed"', content)
    
    # Generic background colors
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.bg\s*\}\}', 'className="bg-bg"', content)
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.dark\.DEFAULT\s*\}\}', 'className="bg-dark"', content)
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.dark\[100\]\s*\}\}', 'className="bg-dark-100"', content)
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.dark\[200\]\s*\}\}', 'className="bg-dark-200"', content)
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.dark\[300\]\s*\}\}', 'className="bg-dark-300"', content)
    
    # Primary/Danger
    content = re.sub(r'style=\{\{\s*color:\s*COLORS\.primary\.DEFAULT\s*\}\}', 'className="text-primary"', content)
    content = re.sub(r'style=\{\{\s*color:\s*COLORS\.danger\.text\s*\}\}', 'className="text-danger-text"', content)
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.primary\.ghost\s*\}\}', 'className="bg-primary-ghost"', content)
    content = re.sub(r'style=\{\{\s*backgroundColor:\s*COLORS\.danger\.ghost\s*\}\}', 'className="bg-danger-ghost"', content)
    
    # Merge classNames if there are two (Tailwind doesn't support multiple className props)
    content = re.sub(r'className="([^"]+)"\s+className="([^"]+)"', r'className="\1 \2"', content)
    content = re.sub(r'className="([^"]+)"\s+className="([^"]+)"', r'className="\1 \2"', content) # run again just in case

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

changed = 0
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.expo' in root:
        continue
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            if process_file(path):
                changed += 1

print(f'Refactored {changed} files')
