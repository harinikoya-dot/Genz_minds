import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  Lock,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const HelpDisclaimerPage: React.FC = () => {
  const emergencyContacts = [
    { name: 'National Emergency Number (India)', number: '112', desc: 'All-in-one police, fire, and ambulance service' },
    { name: 'Ambulance Emergency Helpline', number: '108', desc: 'Medical emergency ambulance dispatch' },
    { name: 'National Health Helpline (MoHFW)', number: '1075', desc: 'Official healthcare guidance helpline' },
    { name: 'Tele-MANAS Mental Health Helpline', number: '14416', desc: 'Toll-free 24/7 mental health counseling' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-[#FF5C68]" />
          Help, Emergency Protocol & Medical Disclaimer
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Essential safety guidelines, emergency contacts, and clinical boundaries for MEDINOVA-AI.
        </p>
      </div>

      {/* 1. URGENT CARE EMERGENCY NOTICE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FF5C68]/10 border-2 border-[#FF5C68]/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5C68]/20 border border-[#FF5C68]/40 flex items-center justify-center text-[#FF5C68] flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#FF5C68]">
              Emergency Warning: Urgent Medical Symptoms
            </h2>
            <p className="text-xs text-[#F4F7FA]/90">
              Never delay seeking urgent emergency medical care by continuing an AI chatbot consultation.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#9BAAB6] leading-relaxed">
          If you or someone in your care is experiencing crushing chest pain, difficulty breathing, sudden numbness or weakness in the face or limbs, severe allergic reactions (swelling of throat or tongue), uncontrolled bleeding, or sudden severe confusion, call emergency services immediately or proceed to the nearest emergency room.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#080E13] border border-[#203039] flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#F4F7FA] block">{contact.name}</span>
                <span className="text-[10px] text-[#9BAAB6]">{contact.desc}</span>
              </div>
              <a
                href={`tel:${contact.number}`}
                className="px-3 py-1.5 rounded-xl bg-[#FF5C68]/20 hover:bg-[#FF5C68] text-[#FF5C68] hover:text-white border border-[#FF5C68]/40 font-mono text-sm font-black transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PERSISTENT MEDICAL DISCLAIMER */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#203039] pb-3">
          <ShieldCheck className="w-6 h-6 text-[#00D084]" />
          <div>
            <h2 className="text-base font-bold text-[#F4F7FA]">Clinical AI Boundaries & Medical Disclaimer</h2>
            <p className="text-xs text-[#9BAAB6]">Governing rules across all MEDINOVA-AI features</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#9BAAB6] leading-relaxed">
          <p>
            <strong className="text-[#F4F7FA]">1. Not a Licensed Clinician:</strong> MEDINOVA-AI is an intelligent personal educational assistant developed to facilitate healthcare document organization, medication adherence tracking, and general terminology explanations. The system does not possess medical licensing and does not provide formal clinical diagnoses.
          </p>

          <p>
            <strong className="text-[#F4F7FA]">2. Prescriptions Require Physician Confirmation:</strong> MEDINOVA-AI will never independently invent, alter, or cancel a medication dosage or schedule. Extracted prescription details are presented in an editable review form and require human confirmation before adding to active schedules.
          </p>

          <p>
            <strong className="text-[#F4F7FA]">3. Clinical Context for Laboratory Reports:</strong> Numerical values reported outside reference ranges on diagnostic reports do not automatically establish a diagnosis. Biological tests must be interpreted by your primary care doctor in conjunction with physical examination and personal clinical history.
          </p>

          <p>
            <strong className="text-[#F4F7FA]">4. Untrusted Input Isolation:</strong> Text extracted from uploaded prescriptions and PDFs is treated as untrusted input and cannot override or prompt-inject the system's clinical safety boundaries.
          </p>
        </div>
      </div>

      {/* 3. PRIVACY & DATA PROTECTION */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#203039] pb-3">
          <Lock className="w-6 h-6 text-[#21E6C1]" />
          <div>
            <h2 className="text-base font-bold text-[#F4F7FA]">Security, Privacy & DPDP Compliance</h2>
            <p className="text-xs text-[#9BAAB6]">Strict tenant isolation for sensitive health data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#9BAAB6]">
          <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2">
            <span className="font-bold text-[#F4F7FA] block">Zero Cross-Tenant Leakage</span>
            Every RAG chunk and document query is strictly filtered by the authenticated user's ID at the database query level.
          </div>

          <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2">
            <span className="font-bold text-[#F4F7FA] block">Data Minimization</span>
            No personal identifiers (names, phone numbers) are shared with external language models when analyzing isolated test rows.
          </div>

          <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2">
            <span className="font-bold text-[#F4F7FA] block">Right to Erasure</span>
            Users retain full control to export their entire medical archive or delete uploaded documents and vector chunks at any time.
          </div>
        </div>
      </div>
    </div>
  );
};
