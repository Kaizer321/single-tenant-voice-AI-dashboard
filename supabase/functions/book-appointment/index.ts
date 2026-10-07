// Supabase Edge Function: book-appointment
// Retell AI Custom Function endpoint for Google Calendar booking during live calls
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const GOOGLE_REFRESH_TOKEN = Deno.env.get("GOOGLE_REFRESH_TOKEN") || "";
const GOOGLE_CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID") || "primary";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Obtains a fresh Google OAuth Access Token using Refresh Token
 */
async function getGoogleAccessToken(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || GOOGLE_REFRESH_TOKEN.includes('sample')) {
    return null;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      console.error("[book-appointment] Token refresh failed:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error("[book-appointment] Error refreshing token:", err);
    return null;
  }
}

/**
 * Checks Google Calendar availability for conflicts
 */
async function checkAvailability(accessToken: string, startTimeIso: string, endTimeIso: string): Promise<boolean> {
  try {
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`);
    url.searchParams.set("timeMin", startTimeIso);
    url.searchParams.set("timeMax", endTimeIso);
    url.searchParams.set("singleEvents", "true");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) return true; // Assume available if lookup error
    const data = await res.json();
    const items = data.items || [];
    return items.length === 0;
  } catch (err) {
    console.error("[book-appointment] Availability check error:", err);
    return true;
  }
}

/**
 * Creates event in Google Calendar
 */
async function createGoogleCalendarEvent(
  accessToken: string,
  summary: string,
  description: string,
  location: string,
  startTimeIso: string,
  endTimeIso: string
): Promise<string | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        description,
        location,
        start: { dateTime: startTimeIso },
        end: { dateTime: endTimeIso },
      }),
    });

    if (!res.ok) {
      console.error("[book-appointment] Failed to create GCal event:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.id || null;
  } catch (err) {
    console.error("[book-appointment] Error creating GCal event:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
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
    const body = await req.json();
    // Support parameters sent by Retell custom function
    const args = body.args || body.parameters || body;
    
    const customerName = args.customer_name || args.name || args.first_name ? `${args.first_name || ''} ${args.last_name || ''}`.trim() : 'Valued Customer';
    const customerPhone = args.customer_phone || args.phone || args.caller_phone || '';
    const address = args.address || 'Address provided verbally';
    const service = args.service || 'Plumbing & Heating Audit';
    const retellCallId = body.call_id || args.call_id || null;

    // Requested start time parsing
    const requestedTime = args.requested_start_time || args.appointment_datetime || args.time;
    let startIso: string;
    let endIso: string;

    if (requestedTime) {
      const parsed = Date.parse(requestedTime);
      if (!isNaN(parsed)) {
        startIso = new Date(parsed).toISOString();
        endIso = new Date(parsed + 60 * 60 * 1000).toISOString(); // 1 hour duration
      } else {
        startIso = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        endIso = new Date(Date.now() + 25 * 3600 * 1000).toISOString();
      }
    } else {
      startIso = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      endIso = new Date(Date.now() + 25 * 3600 * 1000).toISOString();
    }

    let googleEventId: string | null = null;
    const accessToken = await getGoogleAccessToken();

    if (accessToken) {
      const isFree = await checkAvailability(accessToken, startIso, endIso);
      if (!isFree) {
        const altTimeStr = new Date(new Date(startIso).getTime() + 2 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return new Response(JSON.stringify({
          success: false,
          available: false,
          response_speech: `I am sorry, that exact time slot is already booked on our calendar. Would ${altTimeStr} tomorrow work for you instead?`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      googleEventId = await createGoogleCalendarEvent(
        accessToken,
        `${service} - ${customerName}`,
        `Booked via Retell AI Voice Desk\nCustomer Phone: ${customerPhone}\nService: ${service}`,
        address,
        startIso,
        endIso
      );
    } else {
      console.log("[book-appointment] Google OAuth credentials omitted or in demo mode. Creating local appointment record.");
      googleEventId = `gcal_demo_${Date.now()}`;
    }

    // Lookup linked call ID if retellCallId provided
    let linkedCallUuid: string | null = null;
    if (retellCallId) {
      const { data: callRow } = await supabase
        .from('calls')
        .select('id')
        .eq('retell_call_id', retellCallId)
        .single();
      
      if (callRow?.id) {
        linkedCallUuid = callRow.id;
        // Update booking_status to booked
        await supabase
          .from('calls')
          .update({ booking_status: 'booked' })
          .eq('id', callRow.id);
      }
    }

    // Insert into appointments table (SOURCE OF TRUTH for Booked Appointments KPI)
    const { data: newApp, error: appErr } = await supabase
      .from('appointments')
      .insert({
        call_id: linkedCallUuid,
        customer_name: customerName,
        customer_phone: customerPhone,
        address: address,
        service: service,
        start_time: startIso,
        end_time: endIso,
        google_event_id: googleEventId,
        status: 'scheduled'
      })
      .select('id')
      .single();

    if (appErr) {
      console.error("[book-appointment] DB insert error:", appErr);
    }

    const formattedTime = new Date(startIso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const responseSpeech = `Great news ${customerName}, I have officially confirmed your appointment for ${service} on ${formattedTime}. Our master technician will see you at ${address}. Is there anything else I can help with?`;

    return new Response(JSON.stringify({
      success: true,
      appointment_id: newApp?.id || null,
      google_event_id: googleEventId,
      start_time: startIso,
      response_speech: responseSpeech
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err: any) {
    console.error("[book-appointment] Exception:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      response_speech: "I ran into a technical glitch scheduling that time. Let me flag this for our human dispatcher to call you right back."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
