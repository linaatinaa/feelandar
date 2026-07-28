import MoodPicker from './MoodPicker';
import StatsCard from './StatsCard';

export default function TodayPage({ todayEntry, onSubmit, submitting, onMoodPreview, stats }) {
  return (
    <div>
      <MoodPicker
        todayEntry={todayEntry}
        onSubmit={onSubmit}
        submitting={submitting}
        onMoodPreview={onMoodPreview}
      />
      <StatsCard stats={stats} />
    </div>
  );
}
