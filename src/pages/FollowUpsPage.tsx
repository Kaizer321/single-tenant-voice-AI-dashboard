import React, { useState, useMemo } from 'react';
import type { FollowUpRecord } from '../types/database';
import { 
  CheckCircle2, 
  Clock, 
  Phone, 
  User, 
  HelpCircle, 
  PhoneOff, 
  Inbox,
  Check
} from 'lucide-react';

interface FollowUpsPageProps {
  followUps: FollowUpRecord[];
  loading: boolean;
  onResolveFollowUp: (id: string) => Promise<void> | void;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({
  followUps,
  loading,
  onResolveFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const openItems = useMemo(() => {
    return followUps.filter(f => f.status === 'open');
  }, [followUps]);

  const resolvedItems = useMemo(() => {
    return followUps.filter(f => f.status === 'resolved');
  }, [followUps]);

  const currentItems = activeTab === 'open' ? openItems : resolvedItems;

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    await onResolveFollowUp(id);
    setResolvingId(null);
  };

  const renderReasonBadge = (reason: string) => {
    switch (reason) {
      case 'callback_requested':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Phone className="w-3 h-3" />
            <span>Callback Requested</span>
          </span>
        );
      case 'qualified_not_booked':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <User className="w-3 h-3" />
            <span>Qualified - Unbooked</span>
          </span>
        );
      case 'failed_call':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <PhoneOff className="w-3 h-3" />
            <span>Dropped / Failed Call</span>
          </span>
        );
      case 'needs_human':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-3 h-3" />
            <span>Needs Verification</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {reason}
          </span>
        );
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
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Follow-ups Queue</h2>
        <p className="text-sm text-slate-400">Action items automatically flagged from customer voice calls.</p>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('open')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'open'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Open Tasks</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {openItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'resolved'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Resolved History</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">
            {resolvedItems.length}
          </span>
        </button>
      </div>

      {/* Content List */}
      {currentItems.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
          <Inbox className="w-10 h-10 mx-auto stroke-1 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-300">
            {activeTab === 'open' ? 'No open follow-ups!' : 'No resolved follow-ups recorded.'}
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'open' ? 'All action items have been marked resolved.' : 'Resolved items will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              {/* Left Details */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {renderReasonBadge(item.reason)}
                  <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Flagged {new Date(item.created_at).toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="font-bold text-base text-slate-100">
                    {item.call?.caller_name || 'Unknown Caller'}
                  </div>
                  <a
                    href={`tel:${item.call?.caller_phone}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.call?.caller_phone || 'Call Now'}</span>
                  </a>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl">
                    <span className="font-semibold text-slate-400 block mb-0.5">Task Notes:</span>
                    {item.notes}
                  </p>
                )}

                {item.call?.summary && (
                  <p className="text-xs text-slate-400 line-clamp-1">
                    <span className="font-medium text-slate-500">Call Context: </span>
                    {item.call.summary}
                  </p>
                )}
              </div>

              {/* Right Action */}
              <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                {item.status === 'open' ? (
                  <button
                    onClick={() => handleResolve(item.id)}
                    disabled={resolvingId === item.id}
                    className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{resolvingId === item.id ? 'Updating...' : 'Mark Resolved'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolved {item.resolved_at ? new Date(item.resolved_at).toLocaleDateString() : ''}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
