import { useState, useEffect } from 'react'
import { db } from './lib/db'
import { Plus, PlusCircle, Save, Settings, ChevronRight, Play, ArrowLeft, Trash2, CheckCircle2, Circle, Minus, Copy, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './components/ui/button';
import { AdminPanel } from './components/AdminPanel';
import { ProgressChart } from './components/ProgressChart';
import { generateUUID } from './lib/utils';

type Screen = 'login' | 'dashboard' | 'warmup' | 'main_session' | 'exercise_detail' | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  
  const [sessionDateStr, setSessionDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [currentDayNumber, setCurrentDayNumber] = useState<number>(1);
  const [warmupsCompleted, setWarmupsCompleted] = useState<Record<string, boolean>>({});
  const [todaysSetsCounts, setTodaysSetsCounts] = useState<Record<string, number>>({});
  const [selectedExercise, setSelectedExercise] = useState<{id: string, name: string, trackingType?: string} | null>(null);
  const [localPlan, setLocalPlan] = useState<{id: string, name: string, exercises: {id: string, name: string, trackingType?: string}[], warmups: {id: string, name: string, targetReps?: number}[]} | null>(null);
  const [allTemplates, setAllTemplates] = useState<{id: string, name: string}[]>([]);
  const [loadedPlanDate, setLoadedPlanDate] = useState<string>('');
  
  // Exercise Detail State
  const [weight, setWeight] = useState<number>(60);
  const [reps, setReps] = useState<number>(10);
  const [durationStr, setDurationStr] = useState<string>('01:00');
  
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    window.location.href = window.location.pathname + '?refresh=' + new Date().getTime();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [pastSets, setPastSets] = useState<{setNumber: number, weight?: number, reps?: number, durationSec?: number}[]>([]);
  const [todaysSets, setTodaysSets] = useState<{id: string, setNumber: number, weight?: number, reps?: number, durationSec?: number}[]>([]);
  const [allExerciseSets, setAllExerciseSets] = useState<any[]>([]);

  const loadTemplate = async (templateId: string | null, dateStr?: string) => {
    if (!templateId) {
      setLocalPlan(null);
      return;
    }
    const template = await db.templates.get(templateId);
    if (!template) return;
    
    let validExDetails: any[] = [];
    let hasCustom = false;
    if (dateStr) {
      const customStr = localStorage.getItem(`custom_exercises_${dateStr}`);
      if (customStr) {
        try {
          validExDetails = JSON.parse(customStr);
          hasCustom = true;
        } catch(e){}
      }
    }
    
    const templateEx = await db.templateExercises.where({ templateId: template.id }).toArray();
    
    if (!hasCustom) {
      const mainEx = templateEx.filter(te => te.groupType === 'main').sort((a, b) => a.orderIndex - b.orderIndex);
      const exDetails = await Promise.all(mainEx.map(te => db.exercises.get(te.exerciseId)));
      validExDetails = exDetails.filter(e => e !== undefined) as {id: string, name: string, trackingType: string}[];
    }
    
    const warmupEx = templateEx.filter(te => te.groupType === 'warmup').sort((a, b) => a.orderIndex - b.orderIndex);
    const warmupDetails = await Promise.all(warmupEx.map(async te => {
      const e = await db.exercises.get(te.exerciseId);
      return e ? { id: e.id, name: e.name, targetReps: te.targetReps } : undefined;
    }));
    const validWarmupDetails = warmupDetails.filter(e => e !== undefined) as {id: string, name: string, targetReps?: number}[];
    
    setLocalPlan({ id: template.id, name: template.name, exercises: validExDetails, warmups: validWarmupDetails });
  };

  const loadDailyPlan = async () => {
    try {
      const templatesList = await db.templates.toArray();
      setAllTemplates(templatesList);

      const [yy, mm, dd] = sessionDateStr.split('-').map(Number);
      const sessionDate = new Date(yy, mm - 1, dd);
      const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday
      const schedule = await db.schedules.where({ dayOfWeek }).first();
      
      let assignedTemplateId = null;
      const override = localStorage.getItem(`plan_override_${sessionDateStr}`);
      if (override === 'rest') {
        assignedTemplateId = null;
      } else if (override) {
        assignedTemplateId = override;
      } else if (schedule) {
        assignedTemplateId = schedule.templateId;
      }

      if (!localPlan || loadedPlanDate !== sessionDateStr) {
        await loadTemplate(assignedTemplateId, sessionDateStr);
        setLoadedPlanDate(sessionDateStr);
      }

      // Calculate total workout days strictly up to this sessionDate
      const allSets = await db.sets.toArray();
      const uniqueDates = new Set();
      
      const targetTime = sessionDate.getTime();
      
      allSets.forEach(s => {
        if (s.sessionGroupId !== 'seed-data' && s.sessionGroupId !== 'past-seed') {
          const d = new Date(s.createdAt);
          const dStr = d.toDateString();
          // We only count days that are earlier or equal to this session date
          if (new Date(dStr).getTime() <= targetTime) {
             uniqueDates.add(dStr);
          }
        }
      });
      
      const todayStr = sessionDate.toDateString();
      let dayNumber = uniqueDates.size;
      
      // Eagerly add 1 only if today is a workout day AND they haven't recorded anything yet
      if (!uniqueDates.has(todayStr) && assignedTemplateId !== null) {
         dayNumber += 1;
      }
      
      const offset = parseInt(localStorage.getItem('startingDayOffset') || '0');
      setCurrentDayNumber(dayNumber + offset);

    } catch (err) {
      console.error("Failed to load local plan", err);
    }
  };

  const syncDown = async () => {
    try {
      const res = await fetch(`/api/data/sync-down`);
      if (res.ok) {
        const data = await res.json();
        await db.transaction('rw', db.templates, db.exercises, db.templateExercises, db.schedules, db.sets, async () => {
          await db.templates.clear();
          await db.exercises.clear();
          await db.templateExercises.clear();
          await db.schedules.clear();
          
          if (data.templates?.length) await db.templates.bulkAdd(data.templates);
          if (data.exercises?.length) await db.exercises.bulkAdd(data.exercises);
          if (data.templateExercises?.length) await db.templateExercises.bulkAdd(data.templateExercises);
          if (data.schedules?.length) await db.schedules.bulkAdd(data.schedules);
          if (data.sets?.length) {
            // Upsert sets (don't clear them in case there are offline sets not yet synced)
            for (const s of data.sets) {
              await db.sets.put(s);
            }
          }
        });
        await loadDailyPlan();
      }
    } catch (err) {
      console.error("Offline or sync failed, using local DB", err);
      await loadDailyPlan();
    }
  };

  const syncUp = async () => {
    try {
      const allSets = await db.sets.toArray();
      const res = await fetch(`/api/data/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sets: allSets })
      });
      if (res.ok) {
        alert("Push to server successful!");
      } else {
        alert("Failed to push to server.");
      }
    } catch (err) {
      console.error(err);
      alert("Error pushing to server.");
    }
  };

  // Sync down whenever we enter dashboard
  useEffect(() => {
    if (currentScreen === 'dashboard') {
      syncDown();
    }

    if (currentScreen === 'main_session' || currentScreen === 'dashboard') {
      const fetchCounts = async () => {
        const allSets = await db.sets.toArray();
        const [yy, mm, dd] = sessionDateStr.split('-').map(Number);
        const targetDateStr = new Date(yy, mm - 1, dd).toDateString();
        const counts: Record<string, number> = {};
        for (const s of allSets) {
          if (new Date(s.createdAt).toDateString() === targetDateStr) {
            counts[s.exerciseId] = (counts[s.exerciseId] || 0) + 1;
          }
        }
        setTodaysSetsCounts(counts);
      };
      fetchCounts();
    }
  }, [currentScreen, sessionDateStr]);

  const handleSaveSet = async () => {
    try {
      let dSec = 0;
      if (durationStr) {
        const parts = durationStr.split(':');
        if (parts.length === 2) dSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        else dSec = parseInt(parts[0]);
      }

      const newId = generateUUID();
      const [yy, mm, dd] = sessionDateStr.split('-').map(Number);
      const now = new Date();
      const saveDate = new Date(yy, mm - 1, dd, now.getHours(), now.getMinutes(), now.getSeconds());

      await db.sets.add({
        id: newId,
        sessionGroupId: 'today-session',
        exerciseId: selectedExercise?.id || 'unknown',
        setNumber: currentSetNumber,
        weightKg: selectedExercise?.trackingType !== 'duration' ? weight : undefined,
        reps: selectedExercise?.trackingType !== 'duration' ? reps : undefined,
        durationSec: selectedExercise?.trackingType === 'duration' ? dSec : undefined,
        createdAt: saveDate.toISOString()
      });
      
      setTodaysSets(prev => [...prev, {
         id: newId,
         setNumber: currentSetNumber,
         weight: selectedExercise?.trackingType !== 'duration' ? weight : undefined,
         reps: selectedExercise?.trackingType !== 'duration' ? reps : undefined,
         durationSec: selectedExercise?.trackingType === 'duration' ? dSec : undefined,
      }]);
      
      setAllExerciseSets(prev => [...prev, {
        id: newId,
        sessionGroupId: 'today-session',
        exerciseId: selectedExercise?.id || 'unknown',
        setNumber: currentSetNumber,
        weightKg: selectedExercise?.trackingType !== 'duration' ? weight : undefined,
        reps: selectedExercise?.trackingType !== 'duration' ? reps : undefined,
        durationSec: selectedExercise?.trackingType === 'duration' ? dSec : undefined,
        createdAt: saveDate.toISOString()
      }]);

      setCurrentSetNumber(currentSetNumber + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTodaySet = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this set?")) return;
    await db.sets.delete(id);
    const newSets = [...todaysSets.filter(s => s.id !== id)];
    for (let i = 0; i < newSets.length; i++) {
      if (newSets[i].setNumber !== i + 1) {
        newSets[i].setNumber = i + 1;
        await db.sets.update(newSets[i].id, { setNumber: i + 1 });
      }
    }
    setTodaysSets(newSets);
    setAllExerciseSets(prev => prev.filter(s => s.id !== id));
    setCurrentSetNumber(newSets.length + 1);
  };

  const openExercise = async (exercise: {id: string, name: string, trackingType?: string}) => {
    setSelectedExercise(exercise);
    
    try {
      const allExSets = await db.sets
        .where('exerciseId').equals(exercise.id)
        .sortBy('createdAt');
        
      if (allExSets.length > 0) {
        // Compute exercise order for the day
        const allDbSets = await db.sets.toArray();
        const setsByDate: Record<string, any[]> = {};
        for (const s of allDbSets) {
          if (!s.createdAt) continue;
          const dStr = new Date(s.createdAt).toDateString();
          if (!setsByDate[dStr]) setsByDate[dStr] = [];
          setsByDate[dStr].push(s);
        }
        
        const enrichedSets = allExSets.map(s => {
          const dStr = new Date(s.createdAt).toDateString();
          const daySets = setsByDate[dStr] || [];
          daySets.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const uniqueEx: string[] = [];
          for (const ds of daySets) {
             if (!uniqueEx.includes(ds.exerciseId)) uniqueEx.push(ds.exerciseId);
          }
          const orderIndex = uniqueEx.indexOf(exercise.id) + 1;
          return { ...s, sessionOrder: orderIndex };
        });
        
        setAllExerciseSets(enrichedSets);
        const [yy, mm, dd] = sessionDateStr.split('-').map(Number);
        const targetDateStr = new Date(yy, mm - 1, dd).toDateString();
        
        const todaysSetsRaw = allExSets.filter(s => new Date(s.createdAt).toDateString() === targetDateStr);
        todaysSetsRaw.sort((a, b) => a.setNumber - b.setNumber);
        setCurrentSetNumber(todaysSetsRaw.length + 1);
        setTodaysSets(todaysSetsRaw.map(s => ({
           id: s.id, setNumber: s.setNumber, weight: s.weightKg, reps: s.reps, durationSec: s.durationSec
        })));

        const pastOnly = allExSets.filter(s => new Date(s.createdAt).toDateString() !== targetDateStr);
        if (pastOnly.length > 0) {
          const lastDateStr = new Date(pastOnly[pastOnly.length - 1].createdAt).toDateString();
          const lastSessionSets = pastOnly.filter(s => new Date(s.createdAt).toDateString() === lastDateStr);
          lastSessionSets.sort((a, b) => a.setNumber - b.setNumber);
          setPastSets(lastSessionSets.map(s => ({ setNumber: s.setNumber, weight: s.weightKg, reps: s.reps, durationSec: s.durationSec })));
        } else {
          setPastSets([]);
        }
      } else {
        setPastSets([]);
        setTodaysSets([]);
        setCurrentSetNumber(1);
        setAllExerciseSets([]);
      }
    } catch (e) {
      setPastSets([]);
      setTodaysSets([]);
      setCurrentSetNumber(1);
      setAllExerciseSets([]);
    }
    
    setCurrentScreen('exercise_detail');
  };

  // ---------------------------------------------------------
  // RENDER SCREENS
  // ---------------------------------------------------------
  
  if (currentScreen === 'dashboard') {
    const [yy, mm, dd] = sessionDateStr.split('-').map(Number);
    const sessionDate = new Date(yy, mm - 1, dd);
    const formattedDate = new Intl.DateTimeFormat('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(sessionDate);

    return (
      <div className="min-h-screen neo-bg text-zinc-100 p-6 safe-area-pt flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
             <p className="text-white font-medium tracking-wide text-sm uppercase">{formattedDate} • DAY {currentDayNumber}</p>
             <input 
               type="date" 
               value={sessionDateStr} 
               onChange={e => setSessionDateStr(e.target.value)} 
               className="neo-inset text-zinc-300 px-3 py-1.5 rounded-lg text-sm outline-none font-medium  focus:border-black" 
             />
          </div>
          
          <div className="w-full rounded-3xl overflow-hidden mb-8 shadow-lg neo-card">
             <img src="/gymhamster.jpg" alt="We Go Gym" className="w-full h-auto block" />
          </div>

          <h1 className="text-4xl font-bold mb-8 text-white flex justify-between items-center gap-2">
            <select 
              className="neo-bg outline-none appearance-none cursor-pointer flex-1 truncate underline decoration-white/30 underline-offset-4"
              value={localPlan?.id || 'rest'}
              onChange={(e) => {
                const val = e.target.value;
                localStorage.setItem(`plan_override_${sessionDateStr}`, val);
                localStorage.removeItem(`custom_exercises_${sessionDateStr}`);
                if (val === 'rest') setLocalPlan(null);
                else loadTemplate(val, sessionDateStr);
              }}
            >
               <option value="rest" className="neo-card text-base">Rest Day</option>
               {allTemplates.map(t => (
                 <option key={t.id} value={t.id} className="neo-card text-base">{t.name}</option>
               ))}
            </select>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={handleManualRefresh}
                className="p-2 rounded-full neo-card text-zinc-400 hover:text-white disabled:opacity-50"
                disabled={isRefreshing}
              >
                {isRefreshing ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => setCurrentScreen('admin')}
                className="p-2 rounded-full neo-card text-zinc-400 hover:text-white"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </h1>
          
          <div 
            onClick={() => {
              if (localPlan) setCurrentScreen('warmup');
            }}
            className={`neo-card rounded-3xl p-6 /50 mb-8 ${localPlan ? 'cursor-pointer active:scale-[0.98] transition-transform hover:neo-inset/50' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Today's Plan</h2>
              {localPlan && <Play className="w-5 h-5 text-white" />}
            </div>
            {!localPlan ? (
              <p className="text-zinc-500 italic">No workout scheduled for today. Rest well!</p>
            ) : (
              <ul className="space-y-3">
                {localPlan.exercises.map(e => (
                  <li key={e.id} className="text-zinc-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                    {e.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'warmup') {
    return (
      <div className="min-h-screen neo-bg text-zinc-100 p-6 safe-area-pt flex flex-col">
        <header className="mb-8 flex items-start gap-4">
          <button 
            onClick={() => setCurrentScreen('dashboard')}
            className="p-2 mt-1 rounded-full neo-card text-zinc-400 hover:text-white shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Warm Up Phase</h1>
            <p className="text-zinc-400 mt-2">Get your blood flowing before lifting.</p>
          </div>
        </header>

        <div className="space-y-4">
          {localPlan?.warmups.map(w => {
            const isDone = warmupsCompleted[w.id];
            return (
              <div 
                key={w.id} 
                onClick={() => setWarmupsCompleted(prev => ({ ...prev, [w.id]: !isDone }))}
                className={`p-5 rounded-2xl border transition-colors flex items-center justify-between cursor-pointer ${
                  isDone ? 'neo-inset' : 'neo-card '
                }`}
              >
                <div>
                  <h3 className={`text-lg font-bold ${isDone ? 'text-zinc-600 line-through' : 'text-white'}`}>{w.name}</h3>
                  <p className="text-zinc-500 text-sm">{w.targetReps ? `x${w.targetReps} Reps • ` : ''}Tap to mark done</p>
                </div>
                {isDone ? <CheckCircle2 className="w-8 h-8 text-zinc-600" /> : <Circle className="w-8 h-8 text-zinc-600" />}
              </div>
            )
          })}
        </div>

        <div className="mt-8 pb-safe">
          <Button 
            size="lg" 
            className="w-full h-16 text-lg rounded-2xl neo-button text-white font-bold"
            onClick={() => setCurrentScreen('main_session')}
          >
            Lanjut Sesi Utama
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'main_session') {
    return (
      <div className="min-h-screen neo-bg text-zinc-100 p-4 safe-area-pt flex flex-col">
        <header className="mb-6 p-2 flex items-start gap-4">
          <button 
            onClick={() => setCurrentScreen('warmup')}
            className="p-2 mt-1 rounded-full neo-card text-zinc-400 hover:text-white shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Main Session</h1>
            <p className="text-zinc-400 mt-1">{localPlan?.name}</p>
          </div>
        </header>

        <div className="space-y-3">
          {localPlan?.exercises.map(e => {
            const doneCount = todaysSetsCounts[e.id] || 0;
            return (
            <div 
              key={e.id}
              className="neo-card rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div 
                className="flex-1 p-5 cursor-pointer"
                onClick={() => {
                  openExercise(e);
                  
                  
                }}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{e.name}</h3>
                  {doneCount > 0 && <span className="neo-inset text-white text-xs px-2 py-0.5 rounded-full font-bold">{doneCount} Sets Done</span>}
                </div>
                <p className="text-white text-sm font-medium mt-1">Tap to record sets</p>
              </div>
              <div className="px-5 shrink-0 flex items-center gap-3">
                <button 
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (!window.confirm("Are you sure you want to delete this exercise from today's plan?")) return;
                    if (localPlan) {
                      const newExercises = localPlan.exercises.filter(ex => ex.id !== e.id);
                      setLocalPlan({ ...localPlan, exercises: newExercises });
                      localStorage.setItem(`custom_exercises_${sessionDateStr}`, JSON.stringify(newExercises));
                    }
                  }}
                  className="p-2 text-zinc-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <ChevronRight className="w-5 h-5 text-zinc-600" />
              </div>
            </div>
            );
          })}
          
          <Button 
            className="neo-button w-full h-16 rounded-2xl mt-4 text-zinc-300 font-medium"
            onClick={async () => {
              const allEx = await db.exercises.toArray();
              setAvailableExercises(allEx);
              setIsAddingExercise(true);
            }}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Tambah Exercise
          </Button>
        </div>

        <div className="pb-safe mt-8">
          <Button 
            size="lg" 
            className="w-full h-16 text-lg rounded-2xl neo-button text-white font-bold"
            onClick={() => setCurrentScreen('dashboard')}
          >
            Selesaikan Workout
          </Button>
        </div>

        {isAddingExercise && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center neo-bg/90 p-4 pb-12 sm:p-6" onClick={() => setIsAddingExercise(false)}>
            <div className="neo-card rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Pilih Exercise</h2>
              <div className="overflow-y-auto flex-1 space-y-2">
                {availableExercises.map(ex => (
                  <div 
                    key={ex.id}
                    onClick={() => {
                      if (localPlan) {
                        const newExercises = [...localPlan.exercises, ex];
                        setLocalPlan({ ...localPlan, exercises: newExercises });
                        localStorage.setItem(`custom_exercises_${sessionDateStr}`, JSON.stringify(newExercises));
                      }
                      setIsAddingExercise(false);
                    }}
                    className="p-4 neo-inset/50 rounded-xl active:neo-inset cursor-pointer  hover:border-black/50"
                  >
                    <h3 className="text-white font-medium">{ex.name}</h3>
                  </div>
                ))}
              </div>
              <Button onClick={() => setIsAddingExercise(false)} className="neo-button mt-4 w-full h-14 rounded-xl text-white">
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentScreen === 'exercise_detail') {
    return (
      <div className="min-h-screen neo-bg text-zinc-100 p-4 pb-24 safe-area-pt">
        <header className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setCurrentScreen('main_session')}
            className="w-12 h-12 rounded-full neo-card flex items-center justify-center text-zinc-400 active:neo-inset"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-2xl font-bold tracking-tight text-white truncate">{selectedExercise?.name}</h1>
            <p className="text-white font-medium text-sm">Recording Set {currentSetNumber}</p>
          </div>
        </header>

        {allExerciseSets.length > 0 && (
          <ProgressChart sets={allExerciseSets} trackingType={selectedExercise?.trackingType} />
        )}

        {pastSets.length > 0 && (
          <div className="neo-card rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 font-bold">Last Session Performance</p>
            </div>
            <div className="space-y-2">
              {pastSets.map(ps => {
                const mm = Math.floor((ps.durationSec || 0) / 60).toString().padStart(2, '0');
                const ss = ((ps.durationSec || 0) % 60).toString().padStart(2, '0');
                
                return (
                <div key={ps.setNumber} className="flex justify-between items-center neo-inset p-2 rounded-lg">
                  <span className="text-gray-400 font-medium">Set {ps.setNumber}</span>
                  <div className="flex items-center gap-4">
                    {selectedExercise?.trackingType === 'duration' ? (
                      <span className="text-gray-300 font-bold">{mm}:{ss}</span>
                    ) : (
                      <span className="text-gray-300 font-bold">{ps.weight}kg × {ps.reps}</span>
                    )}
                    {currentSetNumber === ps.setNumber && (
                      <Button onClick={() => { 
                        if (selectedExercise?.trackingType === 'duration') {
                          setDurationStr(`${mm}:${ss}`);
                        } else {
                          setWeight(Number(ps.weight) || 0); setReps(Number(ps.reps) || 0); 
                        }
                      }} className="neo-button text-white border-0 h-8 text-xs px-3">
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {todaysSets.length > 0 && (
          <div className="neo-card rounded-2xl p-4 mb-8 border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex items-center justify-between mb-3 pl-2">
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Today's Sets
              </p>
            </div>
            <div className="space-y-2">
              {todaysSets.map(ts => {
                const mm = Math.floor((ts.durationSec || 0) / 60).toString().padStart(2, '0');
                const ss = ((ts.durationSec || 0) % 60).toString().padStart(2, '0');
                
                return (
                <div key={ts.id} className="flex justify-between items-center bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-xl">
                  <span className="text-emerald-400/90 font-medium">Set {ts.setNumber}</span>
                  <div className="flex items-center gap-4">
                    {selectedExercise?.trackingType === 'duration' ? (
                      <span className="text-white font-bold text-lg">{mm}:{ss}</span>
                    ) : (
                      <span className="text-white font-bold text-lg">{ts.weight}kg <span className="text-emerald-500/50">×</span> {ts.reps}</span>
                    )}
                    <button onClick={() => handleDeleteTodaySet(ts.id)} className="text-zinc-500 hover:text-red-500 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedExercise?.trackingType === 'duration' ? (
          <div className="space-y-6">
            <div className="neo-card rounded-3xl p-4 /50">
              <p className="text-center text-zinc-400 font-medium mb-4 uppercase tracking-wider text-sm">Duration (MM:SS)</p>
              <div className="flex justify-center">
                <input 
                  type="text" 
                  value={durationStr}
                  onChange={(e) => setDurationStr(e.target.value)}
                  className="neo-inset text-white text-5xl font-bold tracking-tighter w-48 text-center tabular-nums rounded-2xl py-4 outline-none border-2 border-transparent focus:border-black"
                  placeholder="01:00"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="neo-card rounded-3xl p-4 /50">
              <p className="text-center text-zinc-400 font-medium mb-4 uppercase tracking-wider text-sm">Weight (kg)</p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setWeight(w => Math.max(0, Number(w) - 1))}
                    className="w-12 h-16 sm:w-14 sm:h-16 rounded-2xl neo-inset flex items-center justify-center active:bg-zinc-700 transition-colors font-bold text-zinc-300 text-lg"
                  >
                    -1
                  </button>
                  <button 
                    onClick={() => setWeight(w => Math.max(0, Number(w) - 0.5))}
                    className="w-12 h-16 sm:w-14 sm:h-16 rounded-2xl neo-inset flex items-center justify-center active:bg-zinc-700 transition-colors font-bold text-zinc-300 text-lg"
                  >
                    -.5
                  </button>
                </div>
                <div className="text-4xl sm:text-5xl font-bold tracking-tighter w-20 sm:w-24 text-center tabular-nums">
                  {weight}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setWeight(w => Number(w) + 0.5)}
                    className="w-12 h-16 sm:w-14 sm:h-16 rounded-2xl neo-inset flex items-center justify-center active:bg-zinc-700 transition-colors font-bold text-zinc-300 text-lg"
                  >
                    +.5
                  </button>
                  <button 
                    onClick={() => setWeight(w => Number(w) + 1)}
                    className="w-12 h-16 sm:w-14 sm:h-16 rounded-2xl neo-inset flex items-center justify-center active:bg-zinc-700 transition-colors font-bold text-zinc-300 text-lg"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            <div className="neo-card rounded-3xl p-4 /50">
              <p className="text-center text-zinc-400 font-medium mb-4 uppercase tracking-wider text-sm">Reps</p>
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setReps(r => Math.max(0, Number(r) - 1))}
                  className="w-16 h-16 rounded-2xl neo-inset flex items-center justify-center active:bg-zinc-700 transition-colors"
                >
                  <Minus className="w-8 h-8 text-zinc-300" />
                </button>
                <div className="text-5xl font-bold tracking-tighter w-24 text-center tabular-nums">
                  {reps}
                </div>
                <button 
                  onClick={() => setReps(r => Number(r) + 1)}
                  className="w-16 h-16 rounded-2xl neo-inset flex items-center justify-center active:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-8 h-8 text-zinc-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 mb-8 pb-safe flex gap-4">
          <Button 
            size="lg" 
            className="flex-1 h-16 text-xl rounded-2xl neo-button text-white font-bold "
            onClick={handleSaveSet}
          >
            <Save className="w-6 h-6 mr-2" />
            Save Set {currentSetNumber}
          </Button>
          <Button 
            size="lg" 
            className="h-16 px-6 text-lg rounded-2xl neo-button text-white font-bold"
            onClick={() => setCurrentScreen('main_session')}
          >
            Done
          </Button>
        </div>

      </div>
    );
  }

  if (currentScreen === 'admin') {
    return <AdminPanel 
      onBack={() => setCurrentScreen('dashboard')} 
      onSyncUp={async () => {
        await syncUp();
      }}
      onSyncDown={async () => {
        await syncDown();
      }}
    />;
  }
  return null;
}

export default App
