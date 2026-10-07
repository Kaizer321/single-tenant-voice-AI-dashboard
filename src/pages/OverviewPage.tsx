import React, { useState, useMemo } from 'react';
import type { CallRecord, AppointmentRecord, FollowUpRecord } from '../types/database';
import { calculateKPIMetrics } from '../lib/kpi';
import { 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOff, 
  UserCheck, 
  CalendarCheck, 
  TrendingUp, 
  HelpCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  ArrowRight,
  AlertCircle,
  Inbox
} from 'lucide-react';

export type DateRange = 'today' | '7days' | '30days';

interface OverviewPageProps {
  calls: CallRecord[];
  appointments: AppointmentRecord[];
  followUps: FollowUpRecord[];
  loading: boolean;
  error?: string | null;
  onNavigateToCalls: () => void;
  onNavigateToFollowUps: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  calls,
  appointments,
  followUps,
  loading,
  error,
  onNavigateToCalls,
  onNavigateToFollowUps,
}) => {
  const [dateRange, setDateRange] = useState<DateRange>('7days');

  // Filter calls & appointments by date range
  const filteredCalls = useMemo(() => {
    const now = Date.now();
    let cutoffMs = now - 7 * 24 * 3600 * 1000;
    if (dateRange === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      cutoffMs = todayStart.getTime();
    } else if (dateRange === '30days') {
      cutoffMs = now - 30 * 24 * 3600 * 1000;
    }

    return calls.filter(c => {
      const time = c.started_at ? new Date(c.started_at).getTime() : new Date(c.created_at).getTime();
      return time >= cutoffMs;
    });
  }, [calls, dateRange]);

  const filteredAppointments = useMemo(() => {
    const now = Date.now();
    let cutoffMs = now - 7 * 24 * 3600 * 1000;
    if (dateRange === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      cutoffMs = todayStart.getTime();
    } else if (dateRange === '30days') {
      cutoffMs = now - 30 * 24 * 3600 * 1000;
    }

    return appointments.filter(a => new Date(a.created_at).getTime() >= cutoffMs);
  }, [appointments, dateRange]);

  // Compute KPIs using single KPI calculation module
  const kpis = useMemo(() => {
    return calculateKPIMetrics(filteredCalls, filteredAppointments);
  }, [filteredCalls, filteredAppointments]);

  // Recent calls (latest 5 non-spam)
  const recentCalls = useMemo(() => {
    return filteredCalls
      .filter(c => c.call_type !== 'spam' && c.call_type !== 'wrong_number')
      .slice(0, 5);
  }, [filteredCalls]);

  // Open follow-ups
  const openFollowUps = useMemo(() => {
    return followUps.filter(f => f.status === 'open').slice(0, 5);
  }, [followUps]);

  // Upcoming scheduled appointments
  const upcomingAppointments = useMemo(() => {
    const nowIso = new Date().toISOString();
    return appointments
      .filter(a => a.status === 'scheduled' && a.start_time >= nowIso)
      .slice(0, 5);
  }, [appointments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 my-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <h3 className="font-semibold text-lg">Unable to load dashboard data</h3>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Overview</h2>
          <p className="text-sm text-slate-400">Live call outcomes, qualified leads, and bookings.</p>
        </div>

        {/* Date Range Selector */}
        <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner self-start sm:self-auto">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRange === 'today'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRange === '7days'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRange === '30days'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards (TOP OF PAGE - NO HERO BANNER) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Calls */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Calls</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-100">{kpis.totalCalls}</div>
          <p className="text-[11px] text-slate-500">Excludes spam & wrong numbers</p>
        </div>

        {/* Answered */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Answered</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <PhoneIncoming className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{kpis.answeredCalls}</div>
          <p className="text-[11px] text-slate-500">Handled by voice AI agent</p>
        </div>

        {/* Failed / Missed */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed / Missed</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <PhoneOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-400">{kpis.failedOrMissedCalls}</div>
          <p className="text-[11px] text-slate-500">Dropped or unanswered</p>
        </div>

        {/* Qualified Leads */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qualified Leads</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-400">{kpis.qualifiedLeads}</div>
          <p className="text-[11px] text-slate-500">High intent prospects</p>
        </div>

        {/* Appointments Booked */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointments</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{kpis.appointmentsBooked}</div>
          <p className="text-[11px] text-slate-500">Calendar scheduled</p>
        </div>

        {/* Conversion Rate Card with Formula Tooltip */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700/80 transition-all relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversion</span>
              <div className="cursor-pointer text-slate-500 hover:text-slate-300" title="Conversion Rate = (Booked Appointments / Answered Calls) * 100%">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-400">{kpis.conversionRate}%</div>
          <p className="text-[11px] text-slate-500">Booked / Answered calls</p>

          {/* Formula Tooltip on Hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            <div className="font-semibold text-white mb-1">Conversion Formula</div>
            <div className="font-mono bg-slate-900 p-1.5 rounded border border-slate-800 text-[11px] text-blue-300 text-center">
              (Booked Appointments ÷ Answered Calls) × 100
            </div>
            <div className="text-[10px] text-slate-400 mt-1 text-center">Spam calls strictly excluded</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Calls (Left) + Needs Follow-up & Upcoming Appointments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Calls List (Col Span 2) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">Recent Calls</h3>
              <p className="text-xs text-slate-400">Latest activity handled by voice AI</p>
            </div>
            <button
              onClick={onNavigateToCalls}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentCalls.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-500">
              <Inbox className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-sm">No recent calls recorded for this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  onClick={onNavigateToCalls}
                  className="bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all space-x-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-200 truncate">
                        {call.caller_name || 'Unknown caller'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{call.caller_phone}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{call.summary || 'No summary available.'}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 text-right">
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      call.booking_status === 'booked'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : call.outcome === 'callback_requested'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : call.status === 'failed' || call.status === 'missed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {call.booking_status === 'booked'
                        ? 'Booked'
                        : call.outcome === 'callback_requested'
                        ? 'Callback Req'
                        : call.status === 'failed' || call.status === 'missed'
                        ? 'Failed/Missed'
                        : 'Answered'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                      {call.duration_seconds ? `${call.duration_seconds}s` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Stack: Needs Follow-up & Upcoming Appointments */}
        <div className="space-y-6">
          {/* Needs Follow-up List */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">Needs Follow-Up</h3>
                <p className="text-xs text-slate-400">Open action items requiring attention</p>
              </div>
              <button
                onClick={onNavigateToFollowUps}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
              >
                <span>View ({openFollowUps.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {openFollowUps.length === 0 ? (
              <div className="text-center py-6 text-slate-500 space-y-1">
                <p className="text-xs">No pending follow-up tasks!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {openFollowUps.map((item) => (
                  <div
                    key={item.id}
                    onClick={onNavigateToFollowUps}
                    className="bg-slate-950/60 border border-slate-800/60 hover:border-amber-500/30 p-3 rounded-xl cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-slate-200">
                        {item.call?.caller_name || 'Caller'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        {item.reason.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 space-x-2">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-slate-300">{item.call?.caller_phone || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments List */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-slate-100">Upcoming Appointments</h3>
              <p className="text-xs text-slate-400">Scheduled in Google Calendar</p>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-6 text-slate-500 space-y-1">
                <p className="text-xs">No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-emerald-400">{app.service || 'Service Appointment'}</span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(app.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium">{app.customer_name}</div>
                    <div className="flex items-center text-[11px] text-slate-400 space-x-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      {app.address && (
                        <span className="flex items-center space-x-1 truncate" title={app.address}>
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{app.address}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
