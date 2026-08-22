with open('/home/pflrtq/workout-tracker/frontend/src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('          </div>\n               {todaysSets.length > 0 && (', '          </div>\n        )}\n\n        {todaysSets.length > 0 && (')

with open('/home/pflrtq/workout-tracker/frontend/src/App.tsx', 'w') as f:
    f.write(text)
