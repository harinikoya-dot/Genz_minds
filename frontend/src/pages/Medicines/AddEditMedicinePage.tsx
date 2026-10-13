import React, { useState } from 'react';
import {
  Pill,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  User,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

export const AddEditMedicinePage: React.FC<{
  onBack: () => void;
  onSaved: () => void;
}> = ({ onBack, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    strength: '500mg',
    dosage_form: 'Tablet',
    prescribed_dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    time_slots: '09:00',
    food_instructions: 'after_food',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    prescriber: 'Dr. Ramesh Varma, MD',
    purpose: '',
    precautions: 'Take with full glass of water.',
    side_effects: 'Mild stomach upset.',
    warnings: 'Do not exceed prescribed dose.',
    refill_count: '30',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide the medicine name.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const slots = formData.time_slots
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await healthApi.createMedicine({
        name: formData.name,
        generic_name: formData.generic_name || formData.name,
        strength: formData.strength,
        dosage_form: formData.dosage_form,
        prescribed_dose: formData.prescribed_dose,
        route: formData.route,
        frequency: formData.frequency,
        time_slots: slots.length > 0 ? slots : ['09:00'],
        food_instructions: formData.food_instructions,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        prescriber: formData.prescriber,
        purpose: formData.purpose,
        precautions: formData.precautions.split(',').map(s => s.trim()).filter(Boolean),
        side_effects: formData.side_effects.split(',').map(s => s.trim()).filter(Boolean),
        warnings: formData.warnings.split(',').map(s => s.trim()).filter(Boolean),
      });

      setSuccess(true);
      setTimeout(() => {
        onSaved();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save medication');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-secondary-dark text-xs !py-2 !px-3 flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Medicines</span>
        </button>

        <span className="text-[10px] uppercase font-bold text-[#00D084] bg-[#00D084]/15 px-2.5 py-1 rounded-full border border-[#00D084]/30">
          Clinical Regimen Form
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <Pill className="w-6 h-6 text-[#00D084]" />
          Add Medication Regimen
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Specify exact prescribed dosing, food timing, physician details, and schedule reminder times.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#FF5C68]/15 border border-[#FF5C68]/30 text-[#FF5C68] text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Medication saved and added to active schedules! Redirecting...</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Section 1: Identification */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            1. Medication Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Medicine Brand Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Metformin, Atorvastatin, Lisinopril"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Generic / Active Ingredient</label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                placeholder="e.g. Metformin Hydrochloride"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Strength</label>
              <input
                type="text"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                placeholder="e.g. 500mg, 20mg, 5ml"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Dosage Form</label>
              <select
                value={formData.dosage_form}
                onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Drops">Eye/Ear Drops</option>
                <option value="Topical Cream">Topical Cream</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Dosing & Timing */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            2. Dosing & Food Instructions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Prescribed Dose Amount</label>
              <input
                type="text"
                value={formData.prescribed_dose}
                onChange={(e) => setFormData({ ...formData, prescribed_dose: e.target.value })}
                placeholder="e.g. 1 tablet, 5ml"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              >
                <option value="Once daily">Once daily (QD)</option>
                <option value="Twice daily">Twice daily (BID)</option>
                <option value="Three times daily">Three times daily (TID)</option>
                <option value="Four times daily">Four times daily (QID)</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="As needed">As needed (PRN)</option>
              </select>
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Food Timing Relation</label>
              <select
                value={formData.food_instructions}
                onChange={(e) => setFormData({ ...formData, food_instructions: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              >
                <option value="after_food">After Food (Post-prandial)</option>
                <option value="before_food">Before Food (Empty stomach)</option>
                <option value="with_food">With Food / During Meal</option>
                <option value="anytime">Anytime / No restriction</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="text-[#9BAAB6] block mb-1 font-semibold">
              Daily Reminder Slots (24-hour HH:MM, comma-separated) *
            </label>
            <input
              type="text"
              required
              value={formData.time_slots}
              onChange={(e) => setFormData({ ...formData, time_slots: e.target.value })}
              placeholder="e.g. 09:00, 21:00"
              className="w-full glass-input-dark rounded-xl px-3 py-2 font-mono text-[#00D084] outline-none"
            />
            <span className="text-[10px] text-[#9BAAB6] mt-1 block">
              Alarms will ring and send in-app and browser notifications at these exact hours.
            </span>
          </div>
        </div>

        {/* Section 3: Clinical Notes & Prescriber */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            3. Clinical Context & Safety
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Prescribing Doctor</label>
              <input
                type="text"
                value={formData.prescriber}
                onChange={(e) => setFormData({ ...formData, prescriber: e.target.value })}
                placeholder="Dr. Ramesh Varma, MD"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Clinical Indication / Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g. Type 2 diabetes glucose regulation"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Precautions</label>
              <textarea
                rows={2}
                value={formData.precautions}
                onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1 font-semibold">Known Side Effects</label>
              <textarea
                rows={2}
                value={formData.side_effects}
                onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#203039]">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#9BAAB6] hover:text-[#F4F7FA] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-emerald text-xs !py-3 !px-6 font-bold flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Medication Regimen</span>
          </button>
        </div>
      </form>
    </div>
  );
};
