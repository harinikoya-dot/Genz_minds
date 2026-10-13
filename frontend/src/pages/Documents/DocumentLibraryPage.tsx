import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  FileBarChart2,
  Receipt,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { healthApi, MedicalDoc, Prescription, ReportAnalysis } from '../../services/healthApi';

export const DocumentLibraryPage: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [documents, setDocuments] = useState<MedicalDoc[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<ReportAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const [docsData, prescsData, repsData] = await Promise.all([
        healthApi.getDocuments().catch(() => []),
        healthApi.getPrescriptions().catch(() => []),
        healthApi.getReports().catch(() => []),
      ]);
      setDocuments(docsData);
      setPrescriptions(prescsData);
      setReports(repsData);
    } catch (e) {
      console.warn('Error loading library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this document and associated vector chunks?')) return;
    try {
      await healthApi.deleteDocument(id);
      fetchLibrary();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleExportSummary = (doc: MedicalDoc) => {
    const analysis = reports.find(r => r.document_id === doc.id);
    const content = `MEDINOVA-AI CLINICAL DOCUMENT EXPORT
===========================================
Document: ${doc.original_filename}
Type: ${doc.document_type}
Date: ${new Date(doc.upload_timestamp).toLocaleDateString()}
Security: HIPAA Patient Isolated Record

${analysis ? `CLINICAL SUMMARY:\n${analysis.overall_summary}\n\nPLAIN EXPLANATION:\n${analysis.plain_language_explanation || ''}` : 'Document processed and indexed into personal health vector store.'}
===========================================
Generated on: ${new Date().toISOString()}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medinova-${doc.original_filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.document_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
            <FolderLock className="w-6 h-6 text-[#00D084]" />
            Medical Document Library
          </h1>
          <p className="text-xs text-[#9BAAB6] mt-1">
            Encrypted personal vault for laboratory reports, prescriptions, discharge summaries, and diagnostic scans.
          </p>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('documents')}
            className="btn-emerald text-xs !py-2.5 !px-4 self-start sm:self-auto"
          >
            <span>Upload New Document</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel-dark rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#9BAAB6] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document names or types..."
            className="w-full bg-[#111F28] border border-[#203039] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F7FA] outline-none focus:border-[#00D084]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'lab_report', label: 'Lab Reports' },
            { id: 'prescription', label: 'Prescriptions' },
            { id: 'diagnostic', label: 'Diagnostic Scans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                typeFilter === tab.id
                  ? 'bg-[#00D084] text-[#05090D] shadow-md shadow-[#00D084]/20'
                  : 'bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Decrypting document vault...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="glass-panel-dark rounded-3xl p-12 text-center text-xs text-[#9BAAB6] space-y-3">
          <FolderLock className="w-10 h-10 text-[#203039] mx-auto" />
          <p className="text-sm font-bold text-[#F4F7FA]">No Medical Documents Found</p>
          <p>Upload a lab report or prescription to start your personal health archive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const relatedAnalysis = reports.find((r) => r.document_id === doc.id);
            const relatedPresc = prescriptions.find((p) => p.document_id === doc.id || p.id === doc.id);

            return (
              <div
                key={doc.id}
                className="glass-card-interactive p-6 rounded-3xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] flex-shrink-0">
                      {doc.document_type === 'prescription' ? (
                        <Receipt className="w-5 h-5" />
                      ) : (
                        <FileBarChart2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-[#F4F7FA] truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </h3>
                      <p className="text-[10px] text-[#00D084] font-semibold capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D084]/15 text-[#00D084] font-bold border border-[#00D084]/30">
                      {doc.processing_status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#9BAAB6] pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Upload Date:</span>
                      <span className="text-[#F4F7FA]">
                        {new Date(doc.upload_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>File Size:</span>
                      <span className="text-[#F4F7FA]">{(doc.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  {/* Associated Analysis or Medicine Link */}
                  {relatedAnalysis && (
                    <div className="p-3 rounded-xl bg-[#111F28] border border-[#203039] space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-[#00D084] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Analysis Summary:
                      </span>
                      <p className="text-[11px] text-[#9BAAB6] line-clamp-2">
                        {relatedAnalysis.overall_summary}
                      </p>
                    </div>
                  )}

                  {relatedPresc && (
                    <div className="p-3 rounded-xl bg-[#111F28] border border-[#203039] space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-[#21E6C1] flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Prescribed Medicines ({relatedPresc.medicines?.length || 0}):
                      </span>
                      <p className="text-[11px] text-[#9BAAB6] truncate">
                        {relatedPresc.medicines?.map(m => m.medicine_name).join(', ') || 'Confirmed'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#203039] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-xl bg-[#111F28] text-[#9BAAB6] hover:text-[#00D084] transition"
                      title="Preview Document Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportSummary(doc)}
                      className="p-1.5 rounded-xl bg-[#111F28] text-[#9BAAB6] hover:text-[#21E6C1] transition"
                      title="Export Text Summary"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 rounded-xl text-[#9BAAB6] hover:text-[#FF5C68] hover:bg-[#FF5C68]/10 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#203039]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#00D084]" />
                <h3 className="text-base font-bold text-[#F4F7FA]">{previewDoc.original_filename}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-xs text-[#9BAAB6] hover:text-[#F4F7FA] font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#9BAAB6]">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#111F28] border border-[#203039]">
                <div>
                  <span className="block text-[10px] text-[#9BAAB6]">Document Category</span>
                  <span className="font-bold text-[#F4F7FA] capitalize">{previewDoc.document_type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#9BAAB6]">Indexing State</span>
                  <span className="font-bold text-[#00D084]">{previewDoc.processing_status}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#080E13] border border-[#203039] space-y-2">
                <span className="text-[10px] font-bold text-[#00D084] uppercase">RAG Vector Status:</span>
                <p className="text-xs leading-relaxed text-[#F4F7FA]">
                  This document has been normalized, chunked into overlap passages, and embedded into pgvector. It is ready for grounded semantic retrieval in the AI Health Chat and Voice Assistant.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => handleExportSummary(previewDoc)}
                className="btn-emerald text-xs !py-2 !px-4 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
