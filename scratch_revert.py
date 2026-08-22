import re

def revert_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Backgrounds
    content = content.replace('bg-white shadow-xl shadow-black/5', 'bg-zinc-900')
    content = content.replace('bg-[#f3f0e6]', 'bg-zinc-800')
    content = content.replace('bg-[#f3f0e6]/50', 'bg-zinc-800/50')
    
    # We replaced 'bg-emerald-600' with 'bg-black text-white' originally, but then did some fixes.
    # Let's revert buttons back to emerald
    content = content.replace('bg-black text-white hover:bg-gray-800 text-white', 'bg-emerald-600 hover:bg-emerald-500')
    content = content.replace('bg-black text-white hover:bg-gray-800', 'bg-emerald-600 hover:bg-emerald-500')
    content = content.replace('bg-black text-white', 'bg-emerald-600')
    content = content.replace('hover:bg-gray-800', 'hover:bg-emerald-500')
    
    content = content.replace('bg-gray-300', 'bg-emerald-900')
    content = content.replace('bg-gray-200', 'bg-emerald-950')
    
    # Shadows
    content = content.replace('shadow-[0_0_20px_rgba(220,38,38,0.8)]', '')
    
    # Text colors
    content = content.replace('text-black', 'text-white')
    content = content.replace('text-gray-700', 'text-zinc-300')
    content = content.replace('text-gray-600', 'text-zinc-400')
    content = content.replace('text-gray-500', 'text-zinc-500')
    content = content.replace('text-white font-medium tracking-wide', 'text-emerald-500 font-medium tracking-wide') # Fix the header date text
    
    # Borders
    content = content.replace('border-[#e0dcd0]', 'border-zinc-800')
    content = content.replace('border-[#d0ccc0]', 'border-zinc-700')
    # Make sure hamster border stays reasonable, it was 'border-4 border-black'. Now 'border-white', let's make it border-zinc-800
    content = content.replace('border-4 border-white', 'border-4 border-zinc-800')
    
    # Hover states
    content = content.replace('hover:bg-[#e8e4d9]', 'hover:bg-zinc-800')
    content = content.replace('hover:bg-[#dcd8cc]', 'hover:bg-zinc-700')
    
    # Revert specific things that might have broken
    # "bg-transparent text-white p-6" should be "bg-transparent text-zinc-100 p-6"
    content = content.replace('text-white p-6 safe-area-pt', 'text-zinc-100 p-6 safe-area-pt')
    content = content.replace('text-white p-4 safe-area-pt', 'text-zinc-100 p-4 safe-area-pt')
    content = content.replace('text-white p-4 pb-24', 'text-zinc-100 p-4 pb-24')
    
    with open(filepath, 'w') as f:
        f.write(content)

revert_theme('frontend/src/App.tsx')
revert_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
