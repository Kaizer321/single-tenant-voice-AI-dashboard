import React, { useState } from 'react';
import { mockStore } from '../lib/mock-store';
import { mapRetellCall } from '../lib/map-retell-call';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Play, 
  Terminal, 
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

export const DevSimulatorPage: React.FC<{ onBackToDashboard: () => void }> = ({ onBackToDashboard }) => {
  const [logs, setLogs] = useState<Array<{ timestamp: string; type: 'info' | 'success' | 'error'; message: string }>>([
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Dev Webhook Simulator initialized.' }
  ]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type, message }, ...prev]);
  };

  const triggerSimulation = async (scenario: 'booked' | 'qualified_unbooked' | 'callback' | 'spam' | 'failed') => {
    setLoading(true);
    let payload: any = {};

    const nowMs = Date.now();

    if (scenario === 'booked') {
      const callId = `sim_booked_${Date.now()}`;
      payload = {
        event: "call_analyzed",
        call: {
          call_id: callId,
          from_number: "+1 (555) 345-6789",
          start_timestamp: nowMs - 180000,
          end_timestamp: nowMs,
          disconnection_reason: "agent_hangup",
          transcript: "User: Water is gushing under my kitchen sink!\nAI: I will dispatch our emergency technician tomorrow at 2:00 PM.",
          call_analysis: {
            call_summary: "Emergency pipe leak. AI booked urgent appointment for tomorrow 2:00 PM.",
            user_sentiment: "positive",
            custom_analysis_data: {
              first_name: "Samantha",
              last_name: "Reed",
              address: "404 Main Street, Suite 100",
              service: "Emergency Pipe Repair",
              appointment_datetime: new Date(nowMs + 24 * 3600 * 1000).toISOString(),
              booking_status: "booked",
              is_qualified: true,
              callback_requested: false,
              call_type: "genuine"
            }
          }
        }
      };
    } else if (scenario === 'qualified_unbooked') {
      const callId = `sim_unbooked_${Date.now()}`;
      payload = {
        event: "call_analyzed",
        call: {
          call_id: callId,
          from_number: "+1 (555) 765-4321",
          start_timestamp: nowMs - 240000,
          end_timestamp: nowMs,
          disconnection_reason: "user_hangup",
          transcript: "User: How much to install a tankless water heater?\nAI: Quotes start at $1,800. Can I book an audit?\nUser: I need to check spouse schedule first.",
          call_analysis: {
            call_summary: "High intent lead for tankless water heater installation. Wants to confirm schedule with spouse before booking.",
            user_sentiment: "neutral",
            custom_analysis_data: {
              first_name: "Greg",
              last_name: "Norman",
              service: "Tankless Water Heater",
              booking_status: "not_booked",
              is_qualified: true,
              callback_requested: false,
              call_type: "genuine"
            }
          }
        }
      };
    } else if (scenario === 'callback') {
      const callId = `sim_callback_${Date.now()}`;
      payload = {
        event: "call_analyzed",
        call: {
          call_id: callId,
          from_number: "+1 (555) 999-8877",
          start_timestamp: nowMs - 120000,
          end_timestamp: nowMs,
          disconnection_reason: "user_hangup",
          transcript: "User: Commercial boiler maintenance for 15-unit complex. Call me back after 3pm.",
          call_analysis: {
            call_summary: "Commercial client maintenance inquiry. Requested callback after 3 PM.",
            user_sentiment: "positive",
            custom_analysis_data: {
              first_name: "Arthur",
              last_name: "Pemberton",
              service: "Commercial Boiler Inspection",
              booking_status: "not_booked",
              is_qualified: true,
              callback_requested: true,
              call_type: "genuine"
            }
          }
        }
      };
    } else if (scenario === 'spam') {
      const callId = `sim_spam_${Date.now()}`;
      payload = {
        event: "call_analyzed",
        call: {
          call_id: callId,
          from_number: "+1 (888) 555-0100",
          start_timestamp: nowMs - 15000,
          end_timestamp: nowMs,
          disconnection_reason: "user_hangup",
          transcript: "Robocall offering solar panels.",
          call_analysis: {
            call_summary: "Automated robocall marketing solar panels.",
            user_sentiment: "negative",
            custom_analysis_data: {
              call_type: "spam"
            }
          }
        }
      };
    } else if (scenario === 'failed') {
      const callId = `sim_failed_${Date.now()}`;
      payload = {
        event: "call_analyzed",
        call: {
          call_id: callId,
          from_number: "+1 (555) 444-3322",
          start_timestamp: nowMs - 6000,
          end_timestamp: nowMs,
          disconnection_reason: "dial_failed",
          transcript: "User: My main sewer drain is...\n[Connection Failed]",
          call_analysis: {
            call_summary: "Call disconnected after 6s. Reported sewer drain issue.",
            user_sentiment: "neutral",
            custom_analysis_data: {
              first_name: "Carl",
              last_name: "Bings",
              service: "Main Sewer Drain",
              booking_status: "not_booked",
              is_qualified: true,
              callback_requested: false,
              call_type: "genuine"
            }
          }
        }
      };
    }

    addLog(`Simulating payload for scenario: ${scenario}...`);

    try {
      const mapped = mapRetellCall(payload);

      if (isSupabaseConfigured) {
        // Post directly to Supabase DB or Edge function endpoint
        const { data: inserted, error: err } = await supabase.from('calls').upsert({
          retell_call_id: mapped.retell_call_id,
          caller_name: mapped.caller_name,
          caller_phone: mapped.caller_phone,
          started_at: mapped.started_at,
          ended_at: mapped.ended_at,
          duration_seconds: mapped.duration_seconds,
          status: mapped.status,
          outcome: mapped.outcome,
          is_qualified: mapped.is_qualified,
          callback_requested: mapped.callback_requested,
          call_type: mapped.call_type,
          service: mapped.service,
          summary: mapped.summary,
          transcript: mapped.transcript,
          sentiment: mapped.sentiment,
          booking_status: mapped.booking_status,
          raw_payload: mapped.raw_payload
        }, { onConflict: 'retell_call_id' }).select('id').single();

        if (err) throw err;

        // Create appointment if booked
        if (mapped.booking_status === 'booked' && mapped.appointment_datetime) {
          await supabase.from('appointments').insert({
            call_id: inserted.id,
            customer_name: mapped.caller_name,
            customer_phone: mapped.caller_phone,
            address: mapped.address || '123 Main St',
            service: mapped.service || 'Plumbing Service',
            start_time: mapped.appointment_datetime,
            end_time: new Date(new Date(mapped.appointment_datetime).getTime() + 3600000).toISOString(),
            status: 'scheduled'
          });
        }

        // Create follow-up if needed
        if (mapped.callback_requested) {
          await supabase.from('follow_ups').insert({
            call_id: inserted.id,
            reason: 'callback_requested',
            notes: `Caller requested callback for ${mapped.service}`,
            status: 'open'
          });
        } else if (mapped.is_qualified && mapped.booking_status !== 'booked') {
          await supabase.from('follow_ups').insert({
            call_id: inserted.id,
            reason: 'qualified_not_booked',
            notes: `Qualified lead for ${mapped.service}, unbooked.`,
            status: 'open'
          });
        } else if (mapped.status === 'failed' || mapped.status === 'missed') {
          await supabase.from('follow_ups').insert({
            call_id: inserted.id,
            reason: 'failed_call',
            notes: `Dropped call for ${mapped.caller_name}.`,
            status: 'open'
          });
        }

        addLog(`Successfully processed ${scenario} into Supabase DB! ID: ${inserted.id}`, 'success');
      } else {
        // Process into mockStore
        const newCall = mockStore.addCall({
          retell_call_id: mapped.retell_call_id,
          caller_name: mapped.caller_name,
          caller_phone: mapped.caller_phone,
          started_at: mapped.started_at,
          ended_at: mapped.ended_at,
          duration_seconds: mapped.duration_seconds,
          status: mapped.status,
          outcome: mapped.outcome,
          is_qualified: mapped.is_qualified,
          callback_requested: mapped.callback_requested,
          call_type: mapped.call_type,
          service: mapped.service,
          summary: mapped.summary,
          transcript: mapped.transcript,
          sentiment: mapped.sentiment,
          booking_status: mapped.booking_status,
          raw_payload: mapped.raw_payload
        });

        if (mapped.booking_status === 'booked' && mapped.appointment_datetime) {
          mockStore.addAppointment({
            call_id: newCall.id,
            customer_name: mapped.caller_name,
            customer_phone: mapped.caller_phone,
            address: mapped.address || '404 Main St',
            service: mapped.service || 'Plumbing Service',
            start_time: mapped.appointment_datetime,
            end_time: new Date(new Date(mapped.appointment_datetime).getTime() + 3600000).toISOString(),
            google_event_id: `gcal_sim_${Date.now()}`,
            status: 'scheduled'
          });
        }

        if (mapped.callback_requested) {
          mockStore.addFollowUp({
            call_id: newCall.id,
            reason: 'callback_requested',
            notes: `Callback requested by ${mapped.caller_name} for ${mapped.service}`,
            status: 'open',
            resolved_at: null,
          });
        } else if (mapped.is_qualified && mapped.booking_status !== 'booked') {
          mockStore.addFollowUp({
            call_id: newCall.id,
            reason: 'qualified_not_booked',
            notes: `Qualified lead for ${mapped.service}, follow up to book appointment.`,
            status: 'open',
            resolved_at: null,
          });
        } else if (mapped.status === 'failed' || mapped.status === 'missed') {
          mockStore.addFollowUp({
            call_id: newCall.id,
            reason: 'failed_call',
            notes: `Call dropped for ${mapped.caller_name}. Call back immediately.`,
            status: 'open',
            resolved_at: null,
          });
        }

        addLog(`Successfully processed ${scenario} into Mock Store!`, 'success');
      }
    } catch (err: any) {
      addLog(`Simulation error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Retell Webhook Simulator</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                DEV MODE ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400">Trigger test webhook payloads without needing an active Retell AI phone call.</p>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Warning Alert */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-purple-300">
        <ShieldAlert className="w-5 h-5 shrink-0 text-purple-400 mt-0.5" />
        <div>
          <span className="font-bold block text-white mb-0.5">Developer Sandbox active</span>
          Clicking any button below immediately maps the payload and updates the dashboard state in real time via Supabase / Realtime store.
        </div>
      </div>

      {/* Simulator Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Booked Call */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl space-y-3 transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Emergency Booked
            </span>
            <h3 className="font-bold text-sm text-slate-100">Pipe Leak - Appointment Booked</h3>
            <p className="text-xs text-slate-400">Samantha Reed calls with an urgent pipe leak. AI books slot for tomorrow 2:00 PM.</p>
          </div>
          <button
            onClick={() => triggerSimulation('booked')}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Booked Call</span>
          </button>
        </div>

        {/* 2. Qualified Unbooked */}
        <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-5 rounded-2xl space-y-3 transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
              Qualified Unbooked
            </span>
            <h3 className="font-bold text-sm text-slate-100">Water Heater Quote</h3>
            <p className="text-xs text-slate-400">Greg Norman requests quote for tankless heater. Qualified lead, but unbooked.</p>
          </div>
          <button
            onClick={() => triggerSimulation('qualified_unbooked')}
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-lg shadow-purple-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Unbooked Lead</span>
          </button>
        </div>

        {/* 3. Callback Requested */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl space-y-3 transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
              Callback Requested
            </span>
            <h3 className="font-bold text-sm text-slate-100">Commercial Boiler Inspection</h3>
            <p className="text-xs text-slate-400">Arthur Pemberton requests callback for 15-unit commercial boiler contract.</p>
          </div>
          <button
            onClick={() => triggerSimulation('callback')}
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Callback Req</span>
          </button>
        </div>

        {/* 4. Spam Call */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all flex flex-col justify-between">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              Spam Robocall
            </span>
            <h3 className="font-bold text-sm text-slate-100">Solar Marketing Robocall</h3>
            <p className="text-xs text-slate-400">Automated marketing call. Flagged as spam and excluded from KPIs.</p>
          </div>
          <button
            onClick={() => triggerSimulation('spam')}
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Spam Call</span>
          </button>
        </div>

        {/* 5. Failed Call */}
        <div className="bg-slate-900 border border-slate-800 hover:border-red-500/40 p-5 rounded-2xl space-y-3 transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-2">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
              Dropped Call
            </span>
            <h3 className="font-bold text-sm text-slate-100">Network Disconnect (Main Sewer Drain)</h3>
            <p className="text-xs text-slate-400">Carl Bings calls about backing sewer line. Call drops after 6s. Creates failed_call follow-up.</p>
          </div>
          <button
            onClick={() => triggerSimulation('failed')}
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-lg shadow-red-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Dropped Call</span>
          </button>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Execution Log Output</span>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-slate-500 hover:text-slate-300"
          >
            Clear Console
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs space-y-1.5 max-h-60 overflow-y-auto border border-slate-950">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span className={`break-all ${
                log.type === 'success'
                  ? 'text-emerald-400'
                  : log.type === 'error'
                  ? 'text-red-400'
                  : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
