import re

def fix_mono_theme_final(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Emerald duration box
    content = content.replace('bg-emerald-950/40 border border-emerald-900/50', 'bg-[#1c1c1e] border border-white/5')
    content = content.replace('bg-emerald-900/20', 'bg-white/5')
    
    # "Sets Done" badge
    content = content.replace('bg-emerald-900/50', 'bg-[#2c2c2e]')
    
    # Clean up duplicate borders
    content = content.replace('border border-white/5 border border-white/10', 'border border-white/5')
    content = content.replace('border border-white/5 border border-white/10/50', 'border border-white/5')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_mono_theme_final('frontend/src/App.tsx')
print("Done")
