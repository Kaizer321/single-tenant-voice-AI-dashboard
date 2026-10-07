// Simple node runner to test book-appointment mapping & speech generation
console.log("=== Testing book-appointment custom function logic ===");

const sampleInput = {
  call_id: "test_call_booking_99",
  args: {
    customer_name: "Eleanor Vance",
    customer_phone: "+1 (555) 777-9900",
    address: "88 Hill House Lane",
    service: "Emergency Boiler Leak",
    requested_start_time: "2026-10-08T15:00:00-04:00"
  }
};

const customerName = sampleInput.args.customer_name;
const service = sampleInput.args.service;
const address = sampleInput.args.address;
const startIso = new Date(sampleInput.args.requested_start_time).toISOString();
const formattedTime = new Date(startIso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const responseSpeech = `Great news ${customerName}, I have officially confirmed your appointment for ${service} on ${formattedTime}. Our master technician will see you at ${address}.`;

console.log("Formatted Start Time:", startIso);
console.log("Agent Speech Output:", responseSpeech);
console.log("Test execution complete!");
