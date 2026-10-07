import React, { useState, useMemo } from 'react';
import type { CallRecord, AppointmentRecord } from '../types/database';
import { CallDetailDrawer } from '../components/CallDetailDrawer';
import { 
  Search, 
  Filter, 
  Phone, 
  Clock, 
  Inbox, 
  Calendar,
  ChevronRight
} from 'lucide-react';

interface CallHistoryPageProps {
  calls: CallRecord[];
  appointments: AppointmentRecord[];
  loading: boolean;
}

export const CallHistoryPage: React.FC<CallHistoryPageProps> = ({
  calls,
  appointments,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  // Filter calls by search term, outcome, and booking status
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      // Search term matching
      const query = searchTerm.toLowerCase().trim();
      if (query) {
        const matchesName = (call.caller_name || '').toLowerCase().includes(query);
        const matchesPhone = (call.caller_phone || '').toLowerCase().includes(query);
        const matchesService = (call.service || '').toLowerCase().includes(query);
        const matchesSummary = (call.summary || '').toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesService && !matchesSummary) {
          return false;
        }
      }

      // Outcome filter matching
      if (outcomeFilter !== 'all' && call.outcome !== outcomeFilter) {
        return false;
      }

      // Booking status filter matching
      if (bookingFilter !== 'all' && call.booking_status !== bookingFilter) {
        return false;
      }

      return true;
    });
  }, [calls, searchTerm, outcomeFilter, bookingFilter]);

  // Find linked appointment for selected call
  const linkedAppointment = useMemo(() => {
    if (!selectedCall) return null;
    return appointments.find(a => a.call_id === selectedCall.id) || null;
  }, [selectedCall, appointments]);

  const renderOutcomeBadge = (outcome?: string | null) => {
    switch (outcome) {
      case 'qualified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Qualified</span>;
      case 'callback_requested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Callback Req</span>;
      case 'spam':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Spam</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Not Qualified</span>;
    }
  };

  const renderBookingBadge = (status?: string | null) => {
    switch (status) {
      case 'booked':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Booked</span>;
      case 'not_booked':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Not Booked</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Call History</h2>
        <p className="text-sm text-slate-400">Search and filter complete voice call logs.</p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, service..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter by:</span>
          </div>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Outcomes</option>
            <option value="qualified">Qualified</option>
            <option value="callback_requested">Callback Requested</option>
            <option value="not_qualified">Not Qualified</option>
            <option value="spam">Spam</option>
          </select>

          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Booking Statuses</option>
            <option value="booked">Booked</option>
            <option value="not_booked">Not Booked</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Calls Table Container */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-lg overflow-hidden">
        {filteredCalls.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <Inbox className="w-10 h-10 mx-auto stroke-1" />
            <h3 className="text-sm font-semibold text-slate-300">No calls found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or filter selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Caller</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Outcome</th>
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4">Summary</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCalls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Caller Name & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{call.caller_name || 'Unknown caller'}</div>
                      <div className="text-slate-400 font-mono text-[11px] flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{call.caller_phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {call.started_at
                            ? new Date(call.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                            : new Date(call.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {call.started_at ? new Date(call.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{call.duration_seconds ? `${call.duration_seconds}s` : '0s'}</span>
                      </div>
                    </td>

                    {/* Outcome Badge */}
                    <td className="py-3.5 px-4">{renderOutcomeBadge(call.outcome)}</td>

                    {/* Booking Status Badge */}
                    <td className="py-3.5 px-4">{renderBookingBadge(call.booking_status)}</td>

                    {/* Short Summary */}
                    <td className="py-3.5 px-4 max-w-xs text-slate-400 line-clamp-2">
                      {call.summary || 'No summary available.'}
                    </td>

                    {/* Arrow Action */}
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Call Detail Drawer Modal */}
      <CallDetailDrawer
        call={selectedCall}
        linkedAppointment={linkedAppointment}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
};
