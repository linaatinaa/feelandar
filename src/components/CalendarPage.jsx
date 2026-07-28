import { useState } from 'react';
import Calendar from './Calendar';
import DayModal from './DayModal';
import MoodChart from './MoodChart';

export default function CalendarPage({
  year,
  month,
  entriesByDate,
  todayKey,
  streak,
  onPrevMonth,
  onNextMonth,
  recentEntries,
}) {
  const [selectedEntry, setSelectedEntry] = useState(null);

  return (
    <div>
      <Calendar
        year={year}
        month={month}
        entriesByDate={entriesByDate}
        todayKey={todayKey}
        streak={streak}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onSelectEntry={setSelectedEntry}
      />
      <MoodChart entries={recentEntries} />
      <DayModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
