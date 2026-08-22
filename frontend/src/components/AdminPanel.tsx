import { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, ArrowLeft, CloudUpload, CloudDownload, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { db } from '../lib/db';
import { generateUUID } from '../lib/utils';

export function AdminPanel({ onBack, onSyncUp, onSyncDown }: { onBack: () => void, onSyncUp?: () => Promise<void>, onSyncDown?: () => Promise<void> }) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateExercises, setTemplateExercises] = useState<any[]>([]);

  // Form states
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState('weight_reps');
  
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editExerciseType, setEditExerciseType] = useState('weight_reps');
  
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [groupType, setGroupType] = useState('main');
  const [targetReps, setTargetReps] = useState<number | ''>('');

  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editGroupType, setEditGroupType] = useState('main');
  const [editTargetReps, setEditTargetReps] = useState<number | ''>('');

  const [seedExercise, setSeedExercise] = useState('');
  const [seedSets, setSeedSets] = useState<{id?: string, weight: string, reps: string, durationStr: string}[]>([{ weight: '', reps: '', durationStr: '' }]);

  const [dayOffset, setDayOffset] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (seedExercise) {
      db.sets
        .where('exerciseId').equals(seedExercise)
        .sortBy('createdAt')
        .then(allSets => {
          if (allSets.length > 0) {
            const lastDateStr = new Date(allSets[allSets.length - 1].createdAt).toDateString();
            const lastSessionSets = allSets.filter(s => new Date(s.createdAt).toDateString() === lastDateStr);
            // Sort by setNumber to be safe
            lastSessionSets.sort((a, b) => a.setNumber - b.setNumber);
            setSeedSets(lastSessionSets.map(s => {
              const mm = Math.floor((s.durationSec || 0) / 60).toString().padStart(2, '0');
              const ss = ((s.durationSec || 0) % 60).toString().padStart(2, '0');
              return {
                id: s.id,
                weight: s.weightKg?.toString() || '',
                reps: s.reps?.toString() || '',
                durationStr: s.durationSec ? `${mm}:${ss}` : ''
              };
            }));
          } else {
            setSeedSets([{ weight: '', reps: '', durationStr: '' }]);
          }
        });
    } else {
      setSeedSets([{ weight: '', reps: '', durationStr: '' }]);
    }
  }, [seedExercise]);

  useEffect(() => {
    const saved = localStorage.getItem('startingDayOffset');
    if (saved) setDayOffset(parseInt(saved));
  }, []);

  const handleSaveOffset = (val: number) => {
    setDayOffset(val);
    localStorage.setItem('startingDayOffset', val.toString());
  };

  const fetchData = async () => {
    const [exRes, tmplRes, teRes] = await Promise.all([
      fetch(`/api/admin/exercises`),
      fetch(`/api/admin/templates`),
      fetch(`/api/admin/template-exercises`)
    ]);
    
    setExercises(await exRes.json());
    setTemplates(await tmplRes.json());
    setTemplateExercises(await teRes.json());
  };

  const addExercise = async () => {
    if (!newExerciseName) return;
    await fetch(`/api/admin/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newExerciseName, trackingType: newExerciseType })
    });
    setNewExerciseName('');
    setNewExerciseType('weight_reps');
    fetchData();
  };

  const startEditExercise = (ex: any) => {
    setEditingExercise(ex.id);
    setEditExerciseName(ex.name);
    setEditExerciseType(ex.trackingType);
  };

  const saveEditExercise = async (id: string) => {
    if (!editExerciseName) return;
    await fetch(`/api/admin/exercises/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editExerciseName, trackingType: editExerciseType })
    });
    setEditingExercise(null);
    fetchData();
  };

  const removeExercise = async (id: string) => {
    await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addTemplate = async () => {
    if (!newTemplateName) return;
    await fetch(`/api/admin/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTemplateName, description: newTemplateDesc })
    });
    setNewTemplateName('');
    setNewTemplateDesc('');
    fetchData();
  };

  const addTemplateExercise = async () => {
    if (!selectedTemplate || !selectedExercise) return;
    
    // Auto calculate order index
    const existingInTemplate = templateExercises.filter(te => te.templateId === selectedTemplate);
    const orderIndex = existingInTemplate.length + 1;

    await fetch(`/api/admin/template-exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: selectedTemplate,
        exerciseId: selectedExercise,
        groupType,
        orderIndex,
        targetReps: targetReps === '' ? null : targetReps
      })
    });
    setTargetReps('');
    fetchData();
  };

  const removeTemplateExercise = async (id: string) => {
    await fetch(`/api/admin/template-exercises/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const startEditLink = (link: any) => {
    setEditingLink(link.id);
    setEditGroupType(link.groupType);
    setEditTargetReps(link.targetReps ?? '');
  };

  const saveEditLink = async (id: string) => {
    await fetch(`/api/admin/template-exercises/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupType: editGroupType,
        targetReps: editTargetReps === '' ? null : editTargetReps
      })
    });
    setEditingLink(null);
    fetchData();
  };

  const saveSeedData = async () => {
    if (!seedExercise) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let targetDate = yesterday.toISOString();
    let targetSessionId = 'past-seed';
    
    const existing = seedSets.find(s => s.id);
    if (existing) {
      const exSet = await db.sets.get(existing.id);
      if (exSet) {
        targetDate = exSet.createdAt;
        targetSessionId = exSet.sessionGroupId;
      }
    }
    
    for (let i = 0; i < seedSets.length; i++) {
      const s = seedSets[i];
      let dSec = 0;
      if (s.durationStr) {
        const parts = s.durationStr.split(':');
        if (parts.length === 2) dSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        else dSec = parseInt(parts[0]);
      }
      
      if (s.weight === '' && s.reps === '' && dSec === 0) continue;
      
      if (s.id) {
        await db.sets.update(s.id, {
          weightKg: s.weight ? Number(s.weight) : undefined,
          reps: s.reps ? Number(s.reps) : undefined,
          durationSec: dSec > 0 ? dSec : undefined,
          setNumber: i + 1
        });
      } else {
        await db.sets.add({
          id: generateUUID(),
          sessionGroupId: targetSessionId,
          exerciseId: seedExercise,
          setNumber: i + 1,
          weightKg: s.weight ? Number(s.weight) : undefined,
          reps: s.reps ? Number(s.reps) : undefined,
          durationSec: dSec > 0 ? dSec : undefined,
          createdAt: targetDate
        });
      }
    }
    alert('Performance data saved!');
    
    // Refresh to show newly generated IDs
    const allSets = await db.sets.where('exerciseId').equals(seedExercise).sortBy('createdAt');
    if (allSets.length > 0) {
      const lastDateStr = new Date(allSets[allSets.length - 1].createdAt).toDateString();
      const lastSessionSets = allSets.filter(set => new Date(set.createdAt).toDateString() === lastDateStr);
      lastSessionSets.sort((a, b) => a.setNumber - b.setNumber);
      setSeedSets(lastSessionSets.map(set => {
        const mm = Math.floor((set.durationSec || 0) / 60).toString().padStart(2, '0');
        const ss = ((set.durationSec || 0) % 60).toString().padStart(2, '0');
        return {
          id: set.id,
          weight: set.weightKg?.toString() || '',
          reps: set.reps?.toString() || '',
          durationStr: set.durationSec ? `${mm}:${ss}` : ''
        };
      }));
    }
  };

  return (
    <div className="min-h-screen neo-bg text-zinc-100 p-6 safe-area-pt overflow-y-auto">
      <header className="mb-8 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-12 h-12 shrink-0 rounded-full neo-card flex items-center justify-center text-zinc-400 active:neo-inset"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-white" />
          Admin Manager
        </h1>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 pb-24">
      
        {/* General Settings */}
      <div className="neo-card rounded-2xl p-6  mt-8">
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
        <div className="space-y-6">
          <div>
            <input 
              type="number"
              value={dayOffset}
              onChange={e => handleSaveOffset(parseInt(e.target.value) || 0)}
              className="w-full neo-inset text-white p-3 rounded-xl  outline-none focus:border-black"
            />
            <p className="text-sm text-zinc-500 mt-2 mb-4">Offset your starting day count (e.g. 63).</p>
          </div>
          
          <div className="pt-4 border-t ">
            <h3 className="text-zinc-300 font-bold mb-4">Cloud Sync</h3>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to push (upload) your local data to the server? This will overwrite the server data with your current progress.')) {
                    if (onSyncUp) await onSyncUp();
                  }
                }}
                className="flex-1 bg-blue-900/30 text-blue-400 p-4 rounded-2xl hover:bg-blue-900/50 flex flex-col items-center justify-center gap-2 transition-colors border border-blue-900/50"
              >
                <CloudUpload className="w-8 h-8" />
                <span className="font-bold">Push Data</span>
              </button>
              
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to pull (download) data from the server? This will update your local app with the latest data from the cloud.')) {
                    if (onSyncDown) {
                      await onSyncDown();
                      alert('Pull from server successful!');
                    }
                  }
                }}
                className="flex-1 bg-emerald-900/30 text-white p-4 rounded-2xl hover:bg-emerald-900/50 flex flex-col items-center justify-center gap-2 transition-colors border border-emerald-900/50"
              >
                <CloudDownload className="w-8 h-8" />
                <span className="font-bold">Pull Data</span>
              </button>
            </div>
            <p className="text-sm text-zinc-500 mt-3 text-center">Use these to sync your data across devices.</p>
          </div>

          <div className="pt-4 border-t ">
            <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
            
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete ALL Seed Data (Past Performance)? Your real daily workout records will be kept safe!')) {
                  const allSets = await db.sets.toArray();
                  const idsToDelete = allSets.filter(s => s.sessionGroupId === 'past-seed' || s.sessionGroupId === 'seed-data').map(s => s.id);
                  await db.sets.bulkDelete(idsToDelete);
                  alert('All Past Performance / Seed data has been deleted! Your real workouts are safe.');
                  // Also clear local state if needed
                  setSeedSets([{ weight: '', reps: '', durationStr: '' }]);
                }
              }}
              className="w-full bg-orange-900/30 text-orange-400 p-3 rounded-2xl hover:bg-orange-900/50 mb-4"
            >
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Delete All Past Performance (Seed Data Only)
            </button>

            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete ALL recording sets (except your past seed data)? This cannot be undone!')) {
                  const allSets = await db.sets.toArray();
                  const idsToDelete = allSets.filter(s => s.sessionGroupId !== 'past-seed' && s.sessionGroupId !== 'seed-data').map(s => s.id);
                  await db.sets.bulkDelete(idsToDelete);
                  alert('All test/recording sets have been deleted (your past seed data is safe).');
                }
              }}
              className="w-full bg-red-900/30 text-red-400 p-3 rounded-2xl hover:bg-red-900/50 mb-4"
            >
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Reset All Workout Sets Data (Keep Seed Data)
            </button>
            
            <button 
              onClick={async () => {
                if (window.confirm('This will force the app to fetch the latest code update. Continue?')) {
                  if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                      await registration.unregister();
                    }
                  }
                  window.location.reload();
                }
              }}
              className="w-full bg-zinc-800 text-white p-3 rounded-2xl hover:bg-zinc-700"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Force Update App (Clear Cache)
            </button>
            <p className="text-sm text-zinc-500 mt-2">Use this to clear all test records and start completely fresh, without losing your seeded offsets.</p>
          </div>
        </div>
      </div>

        {/* Exercises Section */}
        <div className="neo-card p-6 rounded-3xl /50">
          <h2 className="text-xl font-bold mb-4 text-white">1. Master Exercises</h2>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input 
              placeholder="Exercise Name" 
              className="flex-1 neo-inset rounded-xl px-4 py-3 md:py-2 outline-none"
              value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)}
            />
            <select
              className="flex-1 neo-inset rounded-xl px-4 py-3 md:py-2 outline-none"
              value={newExerciseType} onChange={e => setNewExerciseType(e.target.value)}
            >
              <option value="weight_reps">Weight & Reps</option>
              <option value="duration">Duration (e.g. Plank)</option>
            </select>
            <Button onClick={addExercise} className="neo-button text-white h-12 md:h-auto rounded-xl">
              <Plus className="w-5 h-5 mx-auto" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {exercises.map(ex => (
              editingExercise === ex.id ? (
                <div key={ex.id} className="flex gap-2 items-center neo-inset/50 p-2 rounded-xl">
                  <input 
                    className="flex-1 neo-card rounded-lg px-3 py-2 outline-none"
                    value={editExerciseName} onChange={e => setEditExerciseName(e.target.value)}
                  />
                  <select
                    className="flex-1 neo-card rounded-lg px-3 py-2 outline-none"
                    value={editExerciseType} onChange={e => setEditExerciseType(e.target.value)}
                  >
                    <option value="weight_reps">Weight & Reps</option>
                    <option value="duration">Duration</option>
                  </select>
                  <Button onClick={() => saveEditExercise(ex.id)} className="neo-button text-white h-9 px-3 rounded-lg text-xs">Save</Button>
                  <Button onClick={() => setEditingExercise(null)} className="neo-button h-9 px-3 rounded-lg text-xs text-white">Cancel</Button>
                </div>
              ) : (
                <div key={ex.id} className="flex items-center justify-between neo-inset px-3 py-2 rounded-lg text-sm text-zinc-300">
                  <span className="font-medium">
                    {ex.name} <span className="text-zinc-500 font-mono text-xs ml-2">[{ex.trackingType === 'duration' ? 'Duration' : 'Weight/Reps'}]</span>
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => startEditExercise(ex)} className="text-blue-400 hover:text-blue-300 font-medium px-2">Edit</button>
                    <button onClick={() => removeExercise(ex.id)} className="text-zinc-500 hover:text-red-600 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* TEMPLATES */}
        <div className="neo-card p-6 rounded-3xl /50">
          <h2 className="text-xl font-bold mb-4 text-blue-400">2. Workout Templates</h2>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input 
              placeholder="Template Name (e.g. Push Day)" 
              className="flex-1 neo-inset rounded-xl px-4 py-3 md:py-2 outline-none"
              value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)}
            />
            <input 
              placeholder="Description (Optional)" 
              className="flex-1 neo-inset rounded-xl px-4 py-3 md:py-2 outline-none"
              value={newTemplateDesc} onChange={e => setNewTemplateDesc(e.target.value)}
            />
            <Button onClick={addTemplate} className="neo-button text-white h-12 md:h-auto text-black rounded-xl">
              <Plus className="w-5 h-5 mx-auto" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <span key={t.id} className="neo-inset px-3 py-1 rounded-full text-sm text-zinc-300">
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* LINK EXERCISES TO TEMPLATES */}
        <div className="neo-card p-6 rounded-3xl /50 mb-20">
          <h2 className="text-xl font-bold mb-4 text-purple-400">3. Link Exercises to Template</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select 
              className="flex-1 neo-inset rounded-xl px-4 py-3 outline-none"
              value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
            >
              <option value="">-- Select Template --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            
            <select 
              className="flex-1 neo-inset rounded-xl px-4 py-3 outline-none"
              value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}
            >
              <option value="">-- Select Exercise --</option>
              {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>

            <select 
              className="w-full md:w-32 neo-inset rounded-xl px-4 py-3 outline-none"
              value={groupType} onChange={e => setGroupType(e.target.value)}
            >
              <option value="main">Main</option>
              <option value="warmup">Warmup</option>
            </select>

            <input 
              type="number"
              placeholder="Reps (Optional)" 
              className="w-full md:w-32 neo-inset rounded-xl px-4 py-3 outline-none"
              value={targetReps} onChange={e => setTargetReps(e.target.value ? parseInt(e.target.value) : '')}
            />

            <Button onClick={addTemplateExercise} className="neo-button text-white rounded-xl h-12 md:h-auto px-6">
              Link
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="font-medium text-zinc-400">Current Links</h3>
            {templates.map(tmpl => {
              const links = templateExercises.filter(te => te.templateId === tmpl.id);
              if (links.length === 0) return null;
              
              return (
                <div key={tmpl.id} className="neo-inset/50 p-4 rounded-xl">
                  <h4 className="font-bold text-white mb-2">{tmpl.name}</h4>
                  <ul className="space-y-2">
                    {links.map(link => 
                      editingLink === link.id ? (
                        <div key={link.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 neo-inset p-3 rounded-lg text-sm w-full">
                          <select 
                            value={editGroupType} onChange={e => setEditGroupType(e.target.value)}
                            className="neo-card px-3 py-2 rounded-lg outline-none w-full sm:w-auto"
                          >
                            <option value="main">Main</option>
                            <option value="warmup">Warmup</option>
                          </select>
                          <span className="flex-1 font-medium">{link.exercise?.name || 'Unknown Exercise'}</span>
                          <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
                            <input
                              type="number"
                              value={editTargetReps}
                              onChange={e => setEditTargetReps(e.target.value ? parseInt(e.target.value) : '')}
                              className="w-20 neo-card px-3 py-2 rounded-lg outline-none"
                              placeholder="Reps"
                            />
                            <Button onClick={() => saveEditLink(link.id)} className="neo-button text-white h-9 px-3 rounded-lg text-xs">Save</Button>
                            <Button onClick={() => setEditingLink(null)} className="neo-button h-9 px-3 rounded-lg text-xs text-white">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <li key={link.id} className="flex items-center justify-between neo-inset p-2 px-3 rounded-lg text-sm">
                          <span>
                            <span className="text-white mr-2 font-mono">[{link.groupType}]</span>
                            {link.exercise?.name || 'Unknown Exercise'}
                            {link.targetReps ? ` (x${link.targetReps})` : ''}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => startEditLink(link)} className="text-blue-400 hover:text-blue-300 font-medium px-2">Edit</button>
                            <button onClick={() => removeTemplateExercise(link.id)} className="text-zinc-500 hover:text-red-600 p-2">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* INPUT PAST PERFORMANCE */}
        <div className="neo-card p-6 rounded-3xl /50 mb-20">
          <h2 className="text-xl font-bold mb-4 text-orange-400">4. Input Past Performance (Offset)</h2>
          <p className="text-zinc-400 text-sm mb-4">Set your previous records from another app so they appear as "Last Time" in your next workout.</p>
          
          <select 
            className="w-full neo-inset rounded-xl px-4 py-3 outline-none mb-4"
            value={seedExercise} onChange={e => setSeedExercise(e.target.value)}
          >
            <option value="">-- Select Exercise --</option>
            {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>

          {seedExercise && (
            <div className="space-y-4">
              {seedSets.map((s, idx) => {
                const ex = exercises.find(e => e.id === seedExercise);
                const isDuration = ex?.trackingType === 'duration';

                return (
                  <div key={idx} className="flex gap-4 items-center neo-inset/50 p-3 rounded-xl">
                    <span className="font-bold text-zinc-500 w-16">Set {idx + 1}</span>
                    
                    {!isDuration ? (
                      <>
                        <input 
                          type="number" placeholder="Weight (kg)" 
                          className="flex-1 neo-inset rounded-lg px-3 py-2 outline-none"
                          value={s.weight} onChange={e => {
                            const newSets = [...seedSets];
                            newSets[idx].weight = e.target.value;
                            setSeedSets(newSets);
                          }}
                        />
                        <input 
                          type="number" placeholder="Reps" 
                          className="flex-1 neo-inset rounded-lg px-3 py-2 outline-none"
                          value={s.reps} onChange={e => {
                            const newSets = [...seedSets];
                            newSets[idx].reps = e.target.value;
                            setSeedSets(newSets);
                          }}
                        />
                      </>
                    ) : (
                      <input 
                        type="text" placeholder="Duration (MM:SS)" 
                        className="flex-1 neo-inset rounded-lg px-3 py-2 outline-none text-center"
                        value={s.durationStr} onChange={e => {
                          const newSets = [...seedSets];
                          newSets[idx].durationStr = e.target.value;
                          setSeedSets(newSets);
                        }}
                      />
                    )}

                    <button onClick={async () => {
                      if (s.id) {
                        await db.sets.delete(s.id);
                      }
                      const newSets = seedSets.filter((_, i) => i !== idx);
                      setSeedSets(newSets.length > 0 ? newSets : [{ weight: '', reps: '', durationStr: '' }]);
                    }} className="text-zinc-500 hover:text-red-600 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
              
              <div className="flex gap-4 pt-2">
                <Button onClick={() => setSeedSets([...seedSets, { weight: '', reps: '', durationStr: '' }])} className="neo-button border-dashed text-white border-2 hover:neo-inset">
                  <Plus className="w-4 h-4 mr-2" /> Add Set
                </Button>
                <Button onClick={saveSeedData} className="neo-button text-white flex-1">
                  Save Performance
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
