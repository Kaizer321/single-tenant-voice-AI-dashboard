// Supabase Edge Function: retell-webhook
// Handles Retell AI webhooks (call_started, call_ended, call_analyzed)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RETELL_WEBHOOK_SECRET = Deno.env.get("RETELL_WEBHOOK_SECRET") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Maps Retell payload defensively to dashboard call schema
 */
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

/**
 * Evaluates follow-up rules and creates follow_ups rows without duplicates
 */
async function processFollowUpRules(callId: string, mappedData: ReturnType<typeof mapRetellCall>) {
  const followUpReasons: Array<{ reason: 'callback_requested' | 'qualified_not_booked' | 'failed_call' | 'needs_human'; notes: string }> = [];

  // Rule 1: callback_requested = true
  if (mappedData.callback_requested) {
    followUpReasons.push({
      reason: 'callback_requested',
      notes: `Caller requested a callback. Contact ${mappedData.caller_name} at ${mappedData.caller_phone}.`
    });
  }

  // Rule 2: is_qualified = true AND booking_status != 'booked'
  if (mappedData.is_qualified && mappedData.booking_status !== 'booked') {
    followUpReasons.push({
      reason: 'qualified_not_booked',
      notes: `Qualified lead for ${mappedData.service || 'service'}, but no appointment was booked.`
    });
  }

  // Rule 3: status in ('failed', 'missed') AND call_type != 'spam'
  if ((mappedData.status === 'failed' || mappedData.status === 'missed') && mappedData.call_type !== 'spam') {
    followUpReasons.push({
      reason: 'failed_call',
      notes: `Call marked as ${mappedData.status}. Reach out to recover the lead.`
    });
  }

  // Rule 4: booking_status = 'booked' but appointment_datetime missing/invalid
  if (mappedData.booking_status === 'booked' && !mappedData.appointment_datetime) {
    followUpReasons.push({
      reason: 'needs_human',
      notes: `Call marked as booked, but valid appointment datetime was not provided in custom extraction.`
    });
  }

  for (const item of followUpReasons) {
    // Check for existing open follow-up with same call_id and reason to avoid duplicates
    const { data: existing } = await supabase
      .from('follow_ups')
      .select('id')
      .eq('call_id', callId)
      .eq('reason', item.reason)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('follow_ups').insert({
        call_id: callId,
        reason: item.reason,
        notes: item.notes,
        status: 'open',
      });
    }
  }
}

/**
 * Verifies Retell webhook signature
 */
async function verifyRetellSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!RETELL_WEBHOOK_SECRET || RETELL_WEBHOOK_SECRET === 'bypass_in_dev') {
    return true;
  }
  if (!signatureHeader) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RETELL_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );

    let expectedHash = signatureHeader;
    if (signatureHeader.includes('v1=')) {
      const parts = signatureHeader.split(',');
      const v1Part = parts.find(p => p.trim().startsWith('v1='));
      if (v1Part) {
        expectedHash = v1Part.trim().substring(3);
      }
    }

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-retell-signature, x-dev-simulator",
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const rawBody = await req.text();
    const isDevSimulator = req.headers.get("x-dev-simulator") === "true";
    const signatureHeader = req.headers.get("x-retell-signature");

    if (!isDevSimulator) {
      const isValid = await verifyRetellSignature(rawBody, signatureHeader);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event || payload.event_type || 'call_analyzed';
    console.log(`[retell-webhook] Processing event: ${event}`);

    const mapped = mapRetellCall(payload);

    // UPSERT into calls table on retell_call_id
    const { data: upsertedCall, error: upsertError } = await supabase
      .from('calls')
      .upsert({
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
        raw_payload: mapped.raw_payload,
      }, { onConflict: 'retell_call_id' })
      .select('id')
      .single();

    if (upsertError) {
      console.error("[retell-webhook] Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: upsertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Process follow-up rules if call record exists
    if (upsertedCall?.id) {
      await processFollowUpRules(upsertedCall.id, mapped);
    }

    return new Response(JSON.stringify({
      success: true,
      event,
      retell_call_id: mapped.retell_call_id,
      call_id: upsertedCall?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err: any) {
    console.error("[retell-webhook] Unhandled exception:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
