import re

def fix_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix broken shadow
    content = content.replace('shadow-black/5/50', 'shadow-black/5')
    
    # Check Button components
    # bg-black text-white might have been replaced with bg-black text-black earlier
    content = content.replace('bg-black text-black', 'bg-black text-white')
    content = content.replace('bg-gray-800 text-black', 'bg-gray-800 text-white')
    
    # Make sure we don't have text-white where it should be text-black on light bg
    # Actually earlier I did:
    # content.replace('bg-emerald-600', 'bg-black text-white')
    # So now it's 'bg-black text-white'. Let's ensure text on this is white.
    # The previous python script replaced text-white -> text-black BEFORE bg-emerald-600 -> bg-black text-white. 
    # So `bg-emerald-600` became `bg-black text-white`, which is correct.
    
    # But wait, original App had text-white on emerald buttons.
    # If the button had `bg-emerald-600 text-white`, the first replace `text-white` -> `text-black`
    # turned it into `bg-emerald-600 text-black`.
    # Then `bg-emerald-600` became `bg-black text-white`.
    # So it became `bg-black text-white text-black` !!
    
    content = content.replace('bg-black text-white text-black', 'bg-black text-white')
    content = content.replace('text-black bg-black text-white', 'bg-black text-white')
    content = content.replace('bg-gray-800 text-white text-black', 'bg-gray-800 text-white')
    
    # Any other weird duplicates
    content = content.replace('text-black text-gray-700', 'text-gray-700')
    
    # Hover states
    content = content.replace('hover:bg-emerald-500', 'hover:bg-gray-900')
    content = content.replace('text-emerald-500', 'text-black')
    content = content.replace('text-emerald-400', 'text-black')
    
    # Fix the missing icon color
    content = content.replace('text-zinc-100', 'text-black')
    
    # Lists or links
    content = content.replace('bg-transparent hover:bg-[#f3f0e6] hover:text-black text-white', 'bg-transparent hover:bg-[#f3f0e6] text-black')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_theme('frontend/src/App.tsx')
fix_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
