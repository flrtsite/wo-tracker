import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="neo-card p-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm">
        <p className="font-bold text-white mb-2">{label}</p>
        {payload.map((p: any) => (
           <p key={p.dataKey} style={{ color: p.color }}>
              {p.name}: {p.value}
           </p>
        ))}
        {data.sessionOrder && (
           <p className="text-zinc-400 mt-2 border-t border-zinc-700 pt-1">
             Urutan Main: Ke-{data.sessionOrder}
           </p>
        )}
      </div>
    );
  }
  return null;
};

export function ProgressChart({ sets, trackingType }: { sets: any[], trackingType?: string }) {
  const data = useMemo(() => {
    if (!sets || sets.length === 0) return [];
    
    const grouped: Record<string, { date: string; maxWeight: number; maxDuration: number, totalVolume: number, sessionOrder?: number }> = {};
    
    for (const s of sets) {
      if (!s.createdAt) continue;
      const d = new Date(s.createdAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, maxWeight: 0, maxDuration: 0, totalVolume: 0 };
      }
      
      if (s.weightKg) {
        grouped[dateStr].maxWeight = Math.max(grouped[dateStr].maxWeight, s.weightKg);
        if (s.reps) {
          grouped[dateStr].totalVolume += (s.weightKg * s.reps);
        }
      }
      
      if (s.durationSec) {
        grouped[dateStr].maxDuration = Math.max(grouped[dateStr].maxDuration, s.durationSec);
      }

      if (s.sessionOrder && !grouped[dateStr].sessionOrder) {
        grouped[dateStr].sessionOrder = s.sessionOrder;
      }
    }
    
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).map(item => {
      const d = new Date(item.date);
      const displayDate = `${d.getDate()}/${d.getMonth()+1}`;
      return { ...item, displayDate };
    });
  }, [sets]);

  if (data.length === 0) return null;

  const isDuration = trackingType === 'duration';

  return (
    <div className="neo-card p-4 rounded-2xl mb-8">
      <h3 className="text-white font-bold mb-4">Progress Chart</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="displayDate" stroke="#a1a1aa" fontSize={12} tickMargin={10} />
            <YAxis yAxisId="left" stroke="#a1a1aa" fontSize={12} width={35} />
            {!isDuration && <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" fontSize={12} width={35} />}
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {isDuration ? (
              <Line yAxisId="left" type="monotone" dataKey="maxDuration" name="Max Duration (s)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            ) : (
              <>
                <Line yAxisId="left" type="monotone" dataKey="maxWeight" name="Max Weight (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="totalVolume" name="Total Volume (kg)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
