import re

def fix_remaining(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # AdminPanel: Cancel buttons
    content = content.replace('variant="outline" className=" hover:bg-[#4c4c4e] h-9 px-3 rounded-lg text-xs text-white"', 'className="neo-button h-9 px-3 rounded-lg text-xs text-white"')
    content = content.replace('variant="outline" className=" hover:bg-[#4c4c4e] h-9 px-3 rounded-lg text-xs"', 'className="neo-button h-9 px-3 rounded-lg text-xs text-white"')
    
    # AdminPanel: Add Set button
    content = content.replace('variant="outline" className="border-dashed border-2  neo-bg hover:neo-inset"', 'className="neo-button border-dashed text-white border-2 hover:neo-inset"')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_remaining('frontend/src/components/AdminPanel.tsx')

def fix_app_remaining(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # App.tsx: remove text-blue-100 and text-emerald-100
    content = content.replace('text-blue-100', 'text-gray-300')
    content = content.replace('text-emerald-100', 'text-gray-300')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_app_remaining('frontend/src/App.tsx')

print("Done")
