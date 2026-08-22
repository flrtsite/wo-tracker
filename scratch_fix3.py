import re

def fix_admin_colors(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix buttons
    content = content.replace('text-white hover:bg-gray-800 text-white h-12 md:h-auto text-black', 'text-white hover:bg-gray-800 h-12 md:h-auto')
    content = content.replace('text-white hover:bg-gray-800 text-white h-9 px-3 rounded-lg text-xs text-black', 'text-white hover:bg-gray-800 h-9 px-3 rounded-lg text-xs')
    content = content.replace('bg-blue-600 hover:bg-blue-500 h-12 md:h-auto text-black', 'bg-blue-600 hover:bg-blue-500 h-12 md:h-auto text-white')
    content = content.replace('bg-purple-600 hover:bg-purple-500 text-black', 'bg-purple-600 hover:bg-purple-500 text-white')
    content = content.replace('bg-orange-600 hover:bg-orange-500 text-black', 'bg-orange-600 hover:bg-orange-500 text-white')
    content = content.replace('bg-black text-white hover:bg-gray-800 text-white h-9 px-3', 'bg-black text-white hover:bg-gray-800 h-9 px-3')
    
    # Let's clean up any lingering text-black on bg-black
    content = content.replace('bg-black text-black', 'bg-black text-white')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_admin_colors('frontend/src/components/AdminPanel.tsx')
print("Done")
