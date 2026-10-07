import { mapRetellCall } from '../lib/map-retell-call.ts';

// Sample 1: Booked Call
const sampleBooked = {
  event: "call_analyzed",
  call: {
    call_id: "test_call_booked_101",
    from_number: "+15552345678",
    start_timestamp: 1772840000000,
    end_timestamp: 1772840180000,
    disconnection_reason: "agent_hangup",
    transcript: "AI: I booked your appointment for tomorrow at 2 PM.",
    call_analysis: {
      call_summary: "Customer booked emergency pipe repair.",
      user_sentiment: "positive",
      custom_analysis_data: {
        first_name: "Jane",
        last_name: "Doe",
        address: "123 Main St",
        service: "Emergency Pipe Repair",
        appointment_datetime: "2026-10-07T14:00:00-04:00",
        booking_status: "booked",
        is_qualified: true,
        callback_requested: false,
        call_type: "genuine"
      }
    }
  }
};

// Sample 2: Callback Requested
const sampleCallback = {
  event: "call_analyzed",
  call: {
    call_id: "test_call_cb_202",
    from_number: "+15559876543",
    start_timestamp: 1772840000000,
    end_timestamp: 1772840120000,
    disconnection_reason: "user_hangup",
    transcript: "User: Please have someone call me back after 3pm.",
    call_analysis: {
      call_summary: "Commercial quote request. Callback requested.",
      user_sentiment: "neutral",
      custom_analysis_data: {
        first_name: "Mark",
        last_name: "Stevens",
        booking_status: "not_booked",
        is_qualified: true,
        callback_requested: true,
        call_type: "genuine"
      }
    }
  }
};

// Sample 3: Spam Call
const sampleSpam = {
  event: "call_analyzed",
  call: {
    call_id: "test_call_spam_303",
    from_number: "+18005550199",
    start_timestamp: 1772840000000,
    end_timestamp: 1772840015000,
    disconnection_reason: "user_hangup",
    transcript: "Robocall solar panel offer.",
    call_analysis: {
      call_summary: "Robocall spam.",
      user_sentiment: "negative",
      custom_analysis_data: {
        call_type: "spam"
      }
    }
  }
};

console.log("=== Testing mapRetellCall logic ===");
console.log("Booked Result:", mapRetellCall(sampleBooked));
console.log("Callback Result:", mapRetellCall(sampleCallback));
console.log("Spam Result:", mapRetellCall(sampleSpam));
