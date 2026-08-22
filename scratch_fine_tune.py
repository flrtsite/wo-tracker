import re

def fine_tune_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Bullet list in today plan
    content = content.replace('bg-gray-800 text-white', 'bg-white/20')

    # 2. Warm up phase checked state
    content = content.replace('bg-emerald-950/30 border-emerald-900/50', 'neo-inset')
    content = content.replace("isDone ? 'text-white line-through' : 'text-white'", "isDone ? 'text-zinc-600 line-through' : 'text-white'")
    content = content.replace('<CheckCircle2 className="w-8 h-8 text-white" />', '<CheckCircle2 className="w-8 h-8 text-zinc-600" />')

    # 3. Tambah Exercise
    content = content.replace('className="w-full h-16 border-dashed border-2  text-zinc-400 hover:text-white hover:border-zinc-600 neo-bg hover:neo-inset/50 rounded-2xl mt-4"', 'className="neo-button w-full h-16 rounded-2xl mt-4 text-zinc-300 font-medium"')

    # 4. Batal button
    content = content.replace('className="mt-4  w-full text-white neo-bg hover:neo-inset hover:text-white"', 'className="neo-button mt-4 w-full h-14 rounded-xl text-white"')

    # 5. Primary buttons -> make them neo-button so they have the outshadow
    content = content.replace('neo-button-primary font-bold', 'neo-button text-white font-bold')
    content = content.replace('neo-button-primary', 'neo-button text-white')
    
    # Let's fix button classes that might have conflicting colors
    content = content.replace('neo-button text-white text-black font-bold', 'neo-button text-white font-bold')
    
    with open(filepath, 'w') as f:
        f.write(content)

fine_tune_theme('frontend/src/App.tsx')
fine_tune_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
