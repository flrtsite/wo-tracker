import re

def fix_variants(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove variant="outline" from buttons that have neo-button
    content = content.replace('variant="outline" \n            className="neo-button', 'className="neo-button')
    # Or in one line
    content = content.replace('variant="outline" className="neo-button', 'className="neo-button')
    
    # "Tambah Exercise" Button
    content = content.replace('variant="outline" \n            className="neo-button w-full h-16 rounded-2xl mt-4 text-zinc-300 font-medium"', 'className="neo-button w-full h-16 rounded-2xl mt-4 text-zinc-300 font-medium"')

    # "Batal" Button
    content = content.replace('variant="outline" className="neo-button mt-4 w-full h-14 rounded-xl text-white"', 'className="neo-button mt-4 w-full h-14 rounded-xl text-white"')
    
    # "Copy" Button
    content = content.replace('<Button variant="secondary" onClick', '<Button onClick')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_variants('frontend/src/App.tsx')
print("Done")
