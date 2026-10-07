export type CallStatus = 'answered' | 'failed' | 'missed';
export type CallOutcome = 'qualified' | 'not_qualified' | 'spam' | 'callback_requested';
export type CallType = 'genuine' | 'spam' | 'wrong_number';
export type BookingStatus = 'booked' | 'not_booked' | 'pending';
export type FollowUpReason = 'callback_requested' | 'qualified_not_booked' | 'failed_call' | 'needs_human';
export type FollowUpStatus = 'open' | 'resolved';
export type AppointmentStatus = 'scheduled' | 'cancelled';

export interface CallRecord {
  id: string;
  retell_call_id: string;
  caller_name: string | null;
  caller_phone: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  status: CallStatus | null;
  outcome: CallOutcome | null;
  is_qualified: boolean;
  callback_requested: boolean;
  call_type: CallType;
  service: string | null;
  summary: string | null;
  transcript: string | null;
  sentiment: string | null;
  booking_status: BookingStatus;
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  call_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  address: string | null;
  service: string | null;
  start_time: string;
  end_time: string;
  google_event_id: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface FollowUpRecord {
  id: string;
  call_id: string;
  reason: FollowUpReason;
  notes: string | null;
  status: FollowUpStatus;
  created_at: string;
  resolved_at: string | null;
  // Joined properties from calls table
  call?: CallRecord;
}
