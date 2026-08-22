import re

def apply_monochrome_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Main Backgrounds
    content = content.replace('bg-zinc-950', 'bg-black')
    
    # 2. Cards (from bg-zinc-900 border-zinc-800)
    content = content.replace('bg-zinc-900', 'bg-[#1c1c1e] border border-white/5')
    content = content.replace('border-zinc-800', 'border-white/10')
    
    # 3. Secondary backgrounds (inputs, small buttons)
    content = content.replace('bg-zinc-800', 'bg-[#2c2c2e]')
    content = content.replace('border-zinc-700', 'border-white/10')
    
    # 4. Primary Accents (was Emerald, now White)
    content = content.replace('bg-emerald-600', 'bg-white')
    content = content.replace('hover:bg-emerald-500', 'hover:bg-gray-200')
    content = content.replace('text-emerald-500', 'text-white')
    content = content.replace('text-emerald-400', 'text-white')
    content = content.replace('decoration-emerald-500/30', 'decoration-white/30')
    
    # Fix button text (primary buttons)
    content = content.replace('bg-white text-white', 'bg-white text-black')
    
    # 5. Specific adjustments
    content = content.replace('shadow-emerald-900/20', 'shadow-white/5')
    
    # 6. Hover states
    content = content.replace('hover:bg-zinc-800', 'hover:bg-[#3c3c3e]')
    content = content.replace('hover:bg-zinc-700', 'hover:bg-[#4c4c4e]')
    
    # 7. Typography (font-black -> font-bold to match sleekness)
    content = content.replace('font-black', 'font-bold')
    
    # 8. Active card states
    content = content.replace('hover:bg-zinc-800/50', 'hover:bg-white/5')
    content = content.replace('bg-zinc-800/50', 'bg-[#2c2c2e]/50')
    
    # Fix the hamster border
    content = content.replace('border-4 border-zinc-800', 'border-2 border-white/10')
    
    with open(filepath, 'w') as f:
        f.write(content)

apply_monochrome_theme('frontend/src/App.tsx')
apply_monochrome_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
