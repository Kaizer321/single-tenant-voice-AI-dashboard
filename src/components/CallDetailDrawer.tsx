import React from 'react';
import type { CallRecord, AppointmentRecord } from '../types/database';
import { 
  X, 
  Phone, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Smile, 
  Frown, 
  Meh, 
  CheckCircle2, 
  FileText,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface CallDetailDrawerProps {
  call: CallRecord | null;
  linkedAppointment?: AppointmentRecord | null;
  onClose: () => void;
}

export const CallDetailDrawer: React.FC<CallDetailDrawerProps> = ({
  call,
  linkedAppointment,
  onClose,
}) => {
  if (!call) return null;

  const renderSentiment = (sentiment?: string | null) => {
    const s = (sentiment || '').toLowerCase();
    if (s === 'positive') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Smile className="w-3.5 h-3.5" />
          <span>Positive</span>
        </span>
      );
    }
    if (s === 'negative') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <Frown className="w-3.5 h-3.5" />
          <span>Negative</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        <Meh className="w-3.5 h-3.5" />
        <span>Neutral</span>
      </span>
    );
  };

  const renderOutcomeBadge = (outcome?: string | null) => {
    switch (outcome) {
      case 'qualified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Qualified Lead</span>;
      case 'callback_requested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Callback Requested</span>;
      case 'spam':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Spam / Robocall</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Not Qualified</span>;
    }
  };

  const renderBookingBadge = (status?: string | null) => {
    switch (status) {
      case 'booked':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Appointment Booked</span>;
      case 'not_booked':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Not Booked</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      {/* Backdrop overlay close click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Call Details</h2>
              {renderOutcomeBadge(call.outcome)}
            </div>
            <p className="text-xs text-slate-400 font-mono">ID: {call.retell_call_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Caller Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Caller Name</span>
              <div className="flex items-center space-x-1.5 text-sm font-semibold text-slate-100">
                <User className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{call.caller_name || 'Unknown'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Phone</span>
              <div className="flex items-center space-x-1.5 text-sm font-medium text-slate-200">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${call.caller_phone}`} className="hover:underline font-mono text-xs">
                  {call.caller_phone || 'N/A'}
                </a>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Duration</span>
              <div className="flex items-center space-x-1.5 text-sm font-medium text-slate-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{call.duration_seconds ? `${call.duration_seconds} seconds` : 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sentiment</span>
              <div>{renderSentiment(call.sentiment)}</div>
            </div>
          </div>

          {/* Status & Service Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Booking:</span>
            {renderBookingBadge(call.booking_status)}

            {call.service && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Service: {call.service}
              </span>
            )}

            {call.call_type === 'spam' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                Flagged Spam
              </span>
            )}
          </div>

          {/* Linked Appointment Details Card (if booked) */}
          {linkedAppointment && (
            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Linked Calendar Appointment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Scheduled Time</span>
                  <span className="font-semibold text-slate-200 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{new Date(linkedAppointment.start_time).toLocaleString()}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Service Requested</span>
                  <span className="font-medium text-slate-200">{linkedAppointment.service || 'Service'}</span>
                </div>
                {linkedAppointment.address && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Location Address</span>
                    <span className="font-medium text-slate-200 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{linkedAppointment.address}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call Summary Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Executive Summary</span>
            </h3>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-sm text-slate-300 leading-relaxed">
              {call.summary || 'No AI summary available for this call.'}
            </div>
          </div>

          {/* Full Transcript Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Full Call Transcript</span>
            </h3>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {call.transcript || 'No transcript available for this call.'}
            </div>
          </div>

          {/* Raw Payload Debug Drawer */}
          {call.raw_payload && Object.keys(call.raw_payload).length > 0 && (
            <details className="group border border-slate-800/80 rounded-xl bg-slate-950/40 p-3">
              <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-300 transition-colors flex items-center justify-between">
                <span>View Raw Webhook Payload (JSON)</span>
                <FileText className="w-3.5 h-3.5 text-slate-500" />
              </summary>
              <pre className="mt-3 text-[10px] text-slate-400 font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-900">
                {JSON.stringify(call.raw_payload, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
