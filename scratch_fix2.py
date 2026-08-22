import re

def fix_colors(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Blue button
    content = content.replace('bg-blue-600 hover:bg-blue-500 text-black', 'bg-blue-600 hover:bg-blue-500 text-white')
    content = content.replace('bg-blue-600 hover:bg-blue-700 text-black', 'bg-blue-600 hover:bg-blue-700 text-white')
    
    # Red button
    content = content.replace('bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)]', 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.8)]')
    
    # Shadow emerald
    content = content.replace('shadow-emerald-900/20', 'shadow-black/20')
    
    # text-white duplicate
    content = content.replace('text-white hover:bg-gray-800 text-white', 'text-white hover:bg-gray-800')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_colors('frontend/src/App.tsx')
print("Done")
