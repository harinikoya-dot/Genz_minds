import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Star,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Building,
  Award,
  Loader2,
} from 'lucide-react';
import { healthApi, Doctor } from '../../services/healthApi';

export const DoctorProfilePage: React.FC<{
  doctorId?: string;
  onBack: () => void;
  onBookSuccess?: () => void;
}> = ({ doctorId, onBack, onBookSuccess }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointmentDate, setAppointmentDate] = useState('2026-10-22');
  const [selectedSlot, setSelectedSlot] = useState('10:00');
  const [consultType, setConsultType] = useState('video');
  const [symptomsNotes, setSymptomsNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const docs = await healthApi.getDoctors();
        const found = doctorId ? docs.find(d => d.id === doctorId) : docs[0];
        setDoctor(found || docs[0]);
      } catch (e) {
        console.warn('Error fetching doctor details:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [doctorId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    try {
      setBookingLoading(true);
      setBookingError(null);
      const res = await healthApi.bookAppointment({
        doctor_id: doctor.id,
        appointment_date: appointmentDate,
        start_time: selectedSlot,
        consultation_type: consultType,
        symptoms_notes: symptomsNotes,
      });
      setBookingSuccess(`Appointment booked successfully! Reference: ${res.booking_reference}`);
      setTimeout(() => {
        if (onBookSuccess) onBookSuccess();
        else onBack();
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Double booking conflict encountered. Please pick another slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  if (loading || !doctor) {
    return (
      <div className="py-20 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
        <span>Loading physician profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back button */}
      <div>
        <button
          onClick={onBack}
          className="btn-secondary-dark text-xs !py-2 !px-3.5 flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Doctor Directory</span>
        </button>
      </div>

      {/* Doctor Header Banner Card */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D084]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00D084] via-[#21E6C1] to-emerald-400 flex items-center justify-center text-[#05090D] font-black text-2xl shadow-xl shadow-[#00D084]/25 flex-shrink-0">
              {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-[#F4F7FA]">{doctor.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-[#00D084]/15 text-[#00D084] text-[10px] font-bold border border-[#00D084]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Clinician</span>
                </span>
              </div>

              <p className="text-sm font-bold text-[#00D084]">{doctor.specialty}</p>
              <p className="text-xs text-[#9BAAB6]">{doctor.qualification} • {doctor.experience_years} Years Experience</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-xs">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#FFB547]/15 text-[#FFB547] font-bold border border-[#FFB547]/30">
              <Star className="w-4 h-4 fill-[#FFB547]" />
              <span>{doctor.rating} / 5.0 Patient Rating</span>
            </div>
            <span className="text-base font-black text-[#F4F7FA] mt-1">
              Consultation Fee: {doctor.consultation_fee}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Bio & Hospital Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Biography */}
          <div className="glass-panel-dark rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-[#F4F7FA] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00D084]" />
              Physician Biography & Focus
            </h2>
            <p className="text-xs text-[#9BAAB6] leading-relaxed">
              {doctor.bio || 'Specialist clinician focusing on evidence-grounded treatment plans, metabolic evaluation, and preventive healthcare strategies.'}
            </p>
          </div>

          {/* Affiliation Details */}
          <div className="glass-panel-dark rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-[#F4F7FA] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#21E6C1]" />
              Clinic & Location
            </h2>
            <div className="space-y-2 text-xs text-[#9BAAB6]">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00D084]" />
                <span className="text-[#F4F7FA] font-medium">{doctor.hospital_clinic}, {doctor.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#21E6C1]" />
                <span>Languages Spoken: {doctor.languages.join(', ')}</span>
              </p>
              <p className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#00D084]" />
                <span>Available Channels: HD Video Telehealth & In-Person Clinic Visits</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-5 glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#F4F7FA]">Schedule an Appointment</h2>
            <p className="text-[11px] text-[#9BAAB6]">Server-validated slot reservation prevents double booking.</p>
          </div>

          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Appointment Date</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Available Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-xl text-center font-mono text-xs font-bold transition ${
                      selectedSlot === slot
                        ? 'bg-[#00D084] text-[#05090D] shadow-md shadow-[#00D084]/20'
                        : 'bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Consultation Medium</label>
              <select
                value={consultType}
                onChange={(e) => setConsultType(e.target.value)}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              >
                <option value="video">Secure HD Video Call (Recommended)</option>
                <option value="in_person">In-Person Clinic Visit</option>
                <option value="audio">Voice Telehealth Call</option>
              </select>
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Symptoms or Consultation Reason</label>
              <textarea
                rows={2}
                value={symptomsNotes}
                onChange={(e) => setSymptomsNotes(e.target.value)}
                placeholder="e.g. Discuss recent fasting glucose results and medication plan."
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none resize-none"
              />
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-[#FF5C68]/15 border border-[#FF5C68]/30 text-[#FF5C68] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full btn-emerald text-xs !py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#00D084]/20"
            >
              {bookingLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span>Confirm & Book Appointment</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
