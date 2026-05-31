import re

files = ['app/(drawer)/users.tsx', 'app/(drawer)/settings.tsx']

for file in files:
    with open(file, 'r', encoding='utf8') as f:
        content = f.read()

    # Tailwind refactor using regex replacements
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'700',\s*fontSize:\s*14\s*\}\}", 'className="text-text-primary font-bold text-sm"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'700',\s*fontSize:\s*16\s*\}\}", 'className="text-text-primary font-bold text-base"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'700',\s*fontSize:\s*18\s*\}\}", 'className="text-text-primary font-bold text-lg"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'700',\s*fontSize:\s*20\s*\}\}", 'className="text-text-primary font-bold text-xl"', content)
    
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.muted,\s*fontSize:\s*12\s*\}\}", 'className="text-text-muted text-xs"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.muted,\s*fontSize:\s*13\s*\}\}", 'className="text-text-muted text-sm"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.secondary,\s*fontSize:\s*15\s*\}\}", 'className="text-text-secondary text-[15px]"', content)
    
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.primary\.DEFAULT,\s*fontWeight:\s*'700',\s*fontSize:\s*14\s*\}\}", 'className="text-primary font-bold text-sm"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.danger\.text,\s*fontWeight:\s*'700',\s*fontSize:\s*14\s*\}\}", 'className="text-danger-text font-bold text-sm"', content)
    
    content = re.sub(r"style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*COLORS\.bg\s*\}\}", 'className="flex-1 bg-bg"', content)

    # Some of them might have marginBottom or marginTop appended to the color object
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'700',\s*fontSize:\s*18,\s*marginBottom:\s*(\d+)\s*\}\}", r'className="text-text-primary font-bold text-lg mb-\1"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'700',\s*fontSize:\s*16,\s*marginBottom:\s*(\d+)\s*\}\}", r'className="text-text-primary font-bold text-base mb-\1"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.muted,\s*fontSize:\s*13,\s*marginBottom:\s*(\d+)\s*\}\}", r'className="text-text-muted text-sm mb-\1"', content)
    
    # Generic replacement for color+fontWeight+fontSize
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*fontWeight:\s*'600',\s*fontSize:\s*13\s*\}\}", 'className="text-text-primary font-semibold text-sm"', content)
    content = re.sub(r"style=\{\{\s*color:\s*COLORS\.text\.primary,\s*textAlign:\s*'center',\s*fontWeight:\s*'600',\s*fontSize:\s*13\s*\}\}", 'className="text-text-primary text-center font-semibold text-sm"', content)
    
    # Update base modal logic roughly, though we will replace them correctly later.
    
    with open(file, 'w', encoding='utf8') as f:
        f.write(content)

print("Refactor finished.")
