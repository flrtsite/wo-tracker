import re

def replace_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Text colors
    content = content.replace('text-white', 'text-black')
    content = content.replace('text-zinc-100', 'text-black')
    content = content.replace('text-zinc-300', 'text-gray-700')
    content = content.replace('text-zinc-400', 'text-gray-600')
    content = content.replace('text-zinc-500', 'text-gray-500')
    content = content.replace('text-emerald-500', 'text-black')
    content = content.replace('text-emerald-400', 'text-black')
    
    # Backgrounds
    content = content.replace('bg-zinc-950', 'bg-transparent')
    content = content.replace('bg-zinc-900', 'bg-white shadow-xl shadow-black/5')
    content = content.replace('bg-zinc-800', 'bg-[#f3f0e6]')
    content = content.replace('bg-emerald-600', 'bg-black text-white')
    content = content.replace('bg-emerald-500', 'bg-gray-800 text-white')
    content = content.replace('bg-emerald-900', 'bg-gray-300')
    content = content.replace('bg-emerald-950', 'bg-gray-200')
    
    # Borders
    content = content.replace('border-zinc-800', 'border-[#e0dcd0]')
    content = content.replace('border-zinc-700', 'border-[#d0ccc0]')
    content = content.replace('border-emerald-500', 'border-black')
    
    # Hover states
    content = content.replace('hover:bg-zinc-800', 'hover:bg-[#e8e4d9]')
    content = content.replace('hover:bg-zinc-700', 'hover:bg-[#dcd8cc]')
    content = content.replace('hover:text-white', 'hover:text-black')
    content = content.replace('hover:text-red-400', 'hover:text-red-600')
    
    with open(filepath, 'w') as f:
        f.write(content)

replace_theme('frontend/src/App.tsx')
replace_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
