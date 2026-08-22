import re

def apply_neumorph_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Main Backgrounds
    content = content.replace('bg-black', 'neo-bg')
    content = content.replace('bg-transparent', 'neo-bg') # some places used bg-transparent on top of body
    
    # 2. Cards
    content = content.replace('bg-[#1c1c1e] border border-white/5', 'neo-card')
    content = content.replace('bg-[#1c1c1e]', 'neo-card')
    
    # 3. Secondary backgrounds (inputs, small buttons)
    # Replaces flat grey with neumorphic soft buttons
    content = content.replace('bg-[#2c2c2e] hover:bg-[#3c3c3e]', 'neo-button')
    content = content.replace('bg-[#2c2c2e]', 'neo-inset') 
    
    # Let's fix small buttons that we might have missed
    content = content.replace('bg-white/5', 'neo-inset')
    content = content.replace('bg-white/10', 'neo-inset')
    
    # 4. Primary Accents
    content = content.replace('bg-white hover:bg-gray-200 text-black', 'neo-button-primary')
    content = content.replace('bg-white hover:bg-gray-200', 'neo-button-primary')
    
    # 5. Clean up redundant borders and shadows
    content = content.replace('border border-white/10', '')
    content = content.replace('border-white/10', '')
    content = content.replace('shadow-lg shadow-black/20', '')
    
    # Add rounded corners to neo-button and neo-card if they don't have it
    # They usually have rounded-2xl or rounded-3xl already in the code, so it's fine.
    
    with open(filepath, 'w') as f:
        f.write(content)

apply_neumorph_theme('frontend/src/App.tsx')
apply_neumorph_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
