// Client and Edge-compatible mapRetellCall function
export function mapRetellCall(payload: any) {
  const call = payload?.call || payload || {};
  const analysis = call?.call_analysis || {};
  const custom = analysis?.custom_analysis_data || {};

  const retellCallId = call.call_id || `retell_${Date.now()}`;
  const callerPhone = call.from_number || call.caller_phone || 'Unknown Phone';

  const startMs = call.start_timestamp ? Number(call.start_timestamp) : Date.now();
  const endMs = call.end_timestamp ? Number(call.end_timestamp) : startMs;
  const startedAt = new Date(startMs).toISOString();
  const endedAt = new Date(endMs).toISOString();
  const durationSeconds = Math.max(0, Math.round((endMs - startMs) / 1000));

  const disconnectReason = (call.disconnection_reason || '').toLowerCase();
  let status: 'answered' | 'failed' | 'missed' = 'answered';

  if (['no_answer', 'dial_failed', 'busy', 'voicemail'].includes(disconnectReason)) {
    status = 'missed';
  } else if (['error', 'failed', 'user_hangup'].includes(disconnectReason) && durationSeconds < 5) {
    status = 'failed';
  } else {
    status = 'answered';
  }

  // Extract custom fields safely
  const firstName = typeof custom.first_name === 'string' ? custom.first_name.trim() : '';
  const lastName = typeof custom.last_name === 'string' ? custom.last_name.trim() : '';
  const rawCallerName = `${firstName} ${lastName}`.trim();
  const callerName = rawCallerName || 'Unknown caller';

  const service = typeof custom.service === 'string' ? custom.service : null;
  const address = typeof custom.address === 'string' ? custom.address : null;

  // Booking status enum mapping
  let bookingStatus: 'booked' | 'not_booked' | 'pending' = 'pending';
  if (['booked', 'not_booked', 'pending'].includes(custom.booking_status)) {
    bookingStatus = custom.booking_status;
  } else if (custom.booking_status === true || custom.booking_status === 'true') {
    bookingStatus = 'booked';
  } else if (custom.booking_status === false || custom.booking_status === 'false') {
    bookingStatus = 'not_booked';
  }

  const isQualified = Boolean(custom.is_qualified);
  const callbackRequested = Boolean(custom.callback_requested);

  // Call type enum mapping
  let callType: 'genuine' | 'spam' | 'wrong_number' = 'genuine';
  if (['genuine', 'spam', 'wrong_number'].includes(custom.call_type)) {
    callType = custom.call_type;
  }

  // Derived outcome
  let outcome: 'qualified' | 'not_qualified' | 'spam' | 'callback_requested' = 'not_qualified';
  if (callType === 'spam' || callType === 'wrong_number') {
    outcome = 'spam';
  } else if (callbackRequested) {
    outcome = 'callback_requested';
  } else if (isQualified) {
    outcome = 'qualified';
  } else {
    outcome = 'not_qualified';
  }

  // Appointment datetime validation
  let appointmentDatetime: string | null = null;
  if (custom.appointment_datetime && typeof custom.appointment_datetime === 'string') {
    const parsed = Date.parse(custom.appointment_datetime);
    if (!isNaN(parsed)) {
      appointmentDatetime = new Date(parsed).toISOString();
    }
  }

  return {
    retell_call_id: retellCallId,
    caller_name: callerName,
    caller_phone: callerPhone,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds,
    status,
    outcome,
    is_qualified: isQualified,
    callback_requested: callbackRequested,
    call_type: callType,
    service,
    summary: analysis.call_summary || call.summary || 'No summary available.',
    transcript: call.transcript || 'No transcript available.',
    sentiment: analysis.user_sentiment || 'neutral',
    booking_status: bookingStatus,
    raw_payload: payload,
    appointment_datetime: appointmentDatetime,
    address,
  };
}
