import re

def fix_mono_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Lanjut Sesi Utama button (Blue -> White)
    content = content.replace('bg-blue-600 hover:bg-blue-500 text-white', 'bg-white hover:bg-gray-200 text-black')
    
    # Last Time (Past Performance) box
    content = content.replace('bg-blue-950/40 border border-blue-900/50', 'bg-[#1c1c1e] border border-white/5')
    content = content.replace('bg-blue-900/20', 'bg-white/5')
    content = content.replace('bg-blue-600 hover:bg-blue-700', 'bg-[#2c2c2e] hover:bg-[#3c3c3e]')
    
    # Rest timer button (Orange -> Dark grey)
    content = content.replace('bg-orange-500 hover:bg-orange-400 text-white flex-shrink-0 shadow-lg shadow-orange-900/20', 'bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white flex-shrink-0 border border-white/10')
    
    # Check if there are other bg-blue or bg-emerald
    content = content.replace('text-blue-400', 'text-gray-400')
    content = content.replace('text-emerald-400', 'text-gray-400')
    
    # Admin Panel might still have some purple/orange/blue bg buttons
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_mono_theme('frontend/src/App.tsx')

def fix_admin_mono_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = content.replace('bg-blue-600 hover:bg-blue-500', 'bg-white hover:bg-gray-200')
    content = content.replace('bg-purple-600 hover:bg-purple-500', 'bg-white hover:bg-gray-200')
    content = content.replace('bg-orange-600 hover:bg-orange-500', 'bg-white hover:bg-gray-200')
    
    # Make sure text on white buttons is black
    content = content.replace('bg-white hover:bg-gray-200 h-12 md:h-auto text-white', 'bg-white hover:bg-gray-200 h-12 md:h-auto text-black')
    content = content.replace('bg-white hover:bg-gray-200 text-white', 'bg-white hover:bg-gray-200 text-black')
    
    with open(filepath, 'w') as f:
        f.write(content)

fix_admin_mono_theme('frontend/src/components/AdminPanel.tsx')
print("Done")
