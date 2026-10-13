import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  Pill,
  Check,
  X,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Utensils,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';
import { playMedicalAlarmSound } from '../../utils/audioAlert';

export const MedicineSchedulePage: React.FC<{ onTriggerTestAlarm?: () => void }> = ({ onTriggerTestAlarm }) => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getMedicines();
      setMedicines(data || []);
    } catch (e) {
      console.warn('Error fetching medicines schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRecordDose = async (medId: string, time: string, status: 'taken' | 'skipped') => {
    const todayStr = currentTime.toISOString().split('T')[0];
    try {
      await healthApi.recordDose({
        medicine_id: medId,
        scheduled_date: todayStr,
        scheduled_time: time,
        status,
      });
      setSuccessToast(`Dose marked as ${status} successfully!`);
      setTimeout(() => setSuccessToast(null), 2500);
      fetchSchedule();
    } catch (e: any) {
      alert(e.message || 'Error updating dose event');
    }
  };

  const handleSoundTest = () => {
    playMedicalAlarmSound();
    if (onTriggerTestAlarm) onTriggerTestAlarm();
  };

  // Build scheduled items list from all active medicines and time slots
  const scheduledItems: any[] = [];
  medicines.forEach((med) => {
    (med.time_slots || ['09:00']).forEach((slot: string) => {
      const hour = parseInt(slot.split(':')[0], 10);
      let period: 'morning' | 'afternoon' | 'evening' = 'morning';
      if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17) period = 'evening';

      scheduledItems.push({
        medicineId: med.id,
        name: med.name,
        dose: med.prescribed_dose,
        strength: med.strength,
        time: slot,
        food: med.food_instructions || 'after_food',
        period,
        purpose: med.purpose,
      });
    });
  });

  scheduledItems.sort((a, b) => a.time.localeCompare(b.time));

  const filteredItems = scheduledItems.filter(
    (item) => timeFilter === 'all' || item.period === timeFilter
  );

  // Next upcoming dose calculation
  const nowStr = currentTime.toTimeString().slice(0, 5);
  const nextItem = scheduledItems.find((item) => item.time >= nowStr) || scheduledItems[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
            <CalendarClock className="w-6 h-6 text-[#00D084]" />
            Daily Medication Schedule
          </h1>
          <p className="text-xs text-[#9BAAB6] mt-1">
            Time-synchronized medication timeline with dietary food alignment, audible alarms, and real-time adherence logging.
          </p>
        </div>

        <button
          onClick={handleSoundTest}
          className="btn-emerald text-xs !py-2.5 !px-4 flex items-center gap-2 self-start sm:self-auto"
        >
          <Volume2 className="w-4 h-4" />
          <span>Test Reminder Alarm</span>
        </button>
      </div>

      {/* Clock & Next Reminder Card */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] uppercase font-bold text-[#00D084] tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Current Local Time
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#F4F7FA] font-mono tracking-tight">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <span className="text-xs text-[#9BAAB6]">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {nextItem && (
          <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] max-w-sm w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#21E6C1]">
                Next Scheduled Dose
              </span>
              <span className="text-xs font-mono font-bold text-[#00D084]">
                {nextItem.time}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center justify-center text-[#00D084]">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F4F7FA]">{nextItem.name}</h4>
                <p className="text-[10px] text-[#9BAAB6] capitalize">
                  {nextItem.dose} • {nextItem.food.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Period Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Doses', icon: Clock },
          { id: 'morning', label: 'Morning (06:00 - 12:00)', icon: Sun },
          { id: 'afternoon', label: 'Afternoon (12:00 - 17:00)', icon: Sunset },
          { id: 'evening', label: 'Evening (17:00+)', icon: Moon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                timeFilter === tab.id
                  ? 'bg-[#00D084] text-[#05090D] shadow-md shadow-[#00D084]/20'
                  : 'bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toast message */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Schedule Timeline */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Loading today's schedule...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel-dark rounded-3xl p-12 text-center text-xs text-[#9BAAB6] space-y-2">
          <Pill className="w-8 h-8 text-[#203039] mx-auto" />
          <p className="text-sm font-bold text-[#F4F7FA]">No Scheduled Doses for this Period</p>
          <p>Add a new medication regimen in My Medicines to populate your schedule.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl glass-card-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px] p-2 rounded-2xl bg-[#111F28] border border-[#203039]">
                  <span className="text-sm font-black font-mono text-[#00D084] block">{item.time}</span>
                  <span className="text-[9px] uppercase font-bold text-[#9BAAB6] block">{item.period}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F4F7FA]">{item.name}</span>
                    {item.strength && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D171F] text-[#9BAAB6] border border-[#203039]">
                        {item.strength}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9BAAB6]">
                    Take <strong className="text-[#F4F7FA]">{item.dose}</strong> •{' '}
                    <span className="capitalize text-[#00D084] font-semibold">
                      {item.food.replace('_', ' ')}
                    </span>
                  </p>
                  {item.purpose && (
                    <p className="text-[10px] text-[#9BAAB6] italic">{item.purpose}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <button
                  onClick={() => handleRecordDose(item.medicineId, item.time, 'taken')}
                  className="px-3.5 py-2 rounded-xl bg-[#00D084]/15 hover:bg-[#00D084] text-[#00D084] hover:text-[#05090D] border border-[#00D084]/40 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark as Taken</span>
                </button>
                <button
                  onClick={() => handleRecordDose(item.medicineId, item.time, 'skipped')}
                  className="px-3 py-2 rounded-xl bg-[#111F28] hover:bg-[#FF5C68]/20 text-[#9BAAB6] hover:text-[#FF5C68] border border-[#203039] text-xs font-bold transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
