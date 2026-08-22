import re

def add_confirms(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. handleDeleteTodaySet in App.tsx
    content = content.replace(
        '  const handleDeleteTodaySet = async (id: string) => {\n    await db.sets.delete(id);',
        '  const handleDeleteTodaySet = async (id: string) => {\n    if (!window.confirm("Are you sure you want to delete this set?")) return;\n    await db.sets.delete(id);'
    )
    
    # 2. Local plan exercise delete in App.tsx
    content = content.replace(
        'ev.stopPropagation();\n                    if (localPlan) {',
        'ev.stopPropagation();\n                    if (!window.confirm("Are you sure you want to delete this exercise from today\'s plan?")) return;\n                    if (localPlan) {'
    )
    
    # 3. AdminPanel deleteExercise
    content = content.replace(
        '  const deleteExercise = async (id: string) => {\n    await db.exercises.delete(id);',
        '  const deleteExercise = async (id: string) => {\n    if (!window.confirm("Are you sure you want to delete this exercise?")) return;\n    await db.exercises.delete(id);'
    )
    
    # 4. AdminPanel deleteTemplate
    content = content.replace(
        '  const deleteTemplate = async (id: string) => {\n    await db.workoutTemplates.delete(id);',
        '  const deleteTemplate = async (id: string) => {\n    if (!window.confirm("Are you sure you want to delete this template?")) return;\n    await db.workoutTemplates.delete(id);'
    )
    
    # 5. AdminPanel delete set in past performance
    content = content.replace(
        '                      <button onClick={async () => {\n                        await db.sets.delete(s.id);',
        '                      <button onClick={async () => {\n                        if (!window.confirm("Are you sure you want to delete this set?")) return;\n                        await db.sets.delete(s.id);'
    )
    
    # Revert Hamster Blend
    content = content.replace('opacity-90 mix-blend-luminosity', '')

    with open(filepath, 'w') as f:
        f.write(content)

add_confirms('frontend/src/App.tsx')
add_confirms('frontend/src/components/AdminPanel.tsx')
print("Done")
