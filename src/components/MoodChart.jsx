import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts';
import { getLastNDays, toDateKey, WEEKDAYS_ID } from '../lib/date';
import { MOOD_SCORE } from '../lib/moods';

function buildChartData(entries) {
  const byDate = Object.fromEntries(entries.map((e) => [e.date, e]));
  return getLastNDays(7).map((date) => {
    const key = toDateKey(date);
    const entry = byDate[key];
    return {
      date: key,
      label: WEEKDAYS_ID[date.getDay()],
      score: entry ? MOOD_SCORE[entry.mood_emoji] : null,
      emoji: entry?.mood_emoji || null,
    };
  });
}

function ChartDot(props) {
  const { cx, cy, payload } = props;
  if (payload.score == null) return null;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16}>
      {payload.emoji}
    </text>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="text-xs rounded-lg px-2 py-1 shadow bg-white text-black">
      {d.label}: {d.emoji || 'Belum ada data'}
    </div>
  );
}

export default function MoodChart({ entries }) {
  const data = buildChartData(entries);

  return (
    <section
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'var(--tg-secondary-bg-color)' }}
    >
      <h2 className="text-sm font-medium mb-3 opacity-70">Tren mood 7 hari terakhir</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--tg-hint-color)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 6]} hide />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#A7C4E5"
            strokeWidth={2}
            connectNulls
            dot={<ChartDot />}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
