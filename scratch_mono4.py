import re

def fix_final_colors(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix Set text
    content = content.replace('text-blue-300', 'text-gray-400')
    content = content.replace('text-emerald-300', 'text-gray-400')
    
    # Fix Save button missing text-black
    content = content.replace('bg-white hover:bg-gray-200 font-bold', 'bg-white hover:bg-gray-200 text-black font-bold')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_final_colors('frontend/src/App.tsx')
print("Done")
