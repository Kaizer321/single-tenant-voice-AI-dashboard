import type { CallRecord, AppointmentRecord, FollowUpRecord } from '../types/database';

const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call-001',
    retell_call_id: 'retell_call_001',
    caller_name: 'John Smith',
    caller_phone: '+1 (555) 123-4567',
    started_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 2 * 3600 * 1000 + 180 * 1000).toISOString(),
    duration_seconds: 180,
    status: 'answered',
    outcome: 'qualified',
    is_qualified: true,
    callback_requested: false,
    call_type: 'genuine',
    service: 'Emergency Pipe Repair',
    summary: 'Customer reported a bursting pipe under the kitchen sink. AI booked an urgent technician appointment for tomorrow morning.',
    transcript: 'User: Hello, I have water leaking under my kitchen sink!\nAI: I can help with that. Is it a continuous leak?\nUser: Yes, it is bursting out.\nAI: Let me book our emergency technician for tomorrow at 9:00 AM. What is your address?\nUser: 742 Evergreen Terrace.',
    sentiment: 'positive',
    booking_status: 'booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-002',
    retell_call_id: 'retell_call_002',
    caller_name: 'Sarah Jenkins',
    caller_phone: '+1 (555) 987-6543',
    started_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 4 * 3600 * 1000 + 240 * 1000).toISOString(),
    duration_seconds: 240,
    status: 'answered',
    outcome: 'qualified',
    is_qualified: true,
    callback_requested: false,
    call_type: 'genuine',
    service: 'Tankless Water Heater Installation',
    summary: 'Customer asked for a cost estimate for installing a tankless water heater. Qualified lead, but wanted to discuss with her spouse before confirming time slot.',
    transcript: 'User: Hi, how much does it cost to install a tankless water heater?\nAI: Prices typically range from $1,800 to $3,200 depending on your electrical setup. Would you like a free home audit?\nUser: I need to check with my husband first.',
    sentiment: 'neutral',
    booking_status: 'not_booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-003',
    retell_call_id: 'retell_call_003',
    caller_name: 'Michael Vance',
    caller_phone: '+1 (555) 456-7890',
    started_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 6 * 3600 * 1000 + 110 * 1000).toISOString(),
    duration_seconds: 110,
    status: 'answered',
    outcome: 'callback_requested',
    is_qualified: true,
    callback_requested: true,
    call_type: 'genuine',
    service: 'Commercial Boiler Inspection',
    summary: 'Commercial property manager requested a callback from senior master plumber regarding multi-unit maintenance contract.',
    transcript: 'User: I manage a 12-unit complex and need commercial boiler inspection.\nAI: Great, I will have our Commercial Lead call you back today.\nUser: Thanks, call me after 2 PM.',
    sentiment: 'positive',
    booking_status: 'not_booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-004',
    retell_call_id: 'retell_call_004',
    caller_name: 'Unknown caller',
    caller_phone: '+1 (800) 555-0199',
    started_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 8 * 3600 * 1000 + 25 * 1000).toISOString(),
    duration_seconds: 25,
    status: 'answered',
    outcome: 'spam',
    is_qualified: false,
    callback_requested: false,
    call_type: 'spam',
    service: null,
    summary: 'Automated marketing call offering solar panels.',
    transcript: 'User: Hello! You have been pre-selected for free solar panel installation...\nAI: Thank you, but we are a plumbing business.',
    sentiment: 'negative',
    booking_status: 'not_booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-005',
    retell_call_id: 'retell_call_005',
    caller_name: 'David Miller',
    caller_phone: '+1 (555) 321-7654',
    started_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 12 * 3600 * 1000 + 8 * 1000).toISOString(),
    duration_seconds: 8,
    status: 'failed',
    outcome: 'not_qualified',
    is_qualified: false,
    callback_requested: false,
    call_type: 'genuine',
    service: 'Drain Cleaning',
    summary: 'Call dropped due to poor cellular reception after caller stated drain issue.',
    transcript: 'User: Hi my main drain is backing up...\n[Call disconnected]',
    sentiment: 'neutral',
    booking_status: 'not_booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-006',
    retell_call_id: 'retell_call_006',
    caller_name: 'Emily Davis',
    caller_phone: '+1 (555) 654-3210',
    started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 24 * 3600 * 1000 + 195 * 1000).toISOString(),
    duration_seconds: 195,
    status: 'answered',
    outcome: 'qualified',
    is_qualified: true,
    callback_requested: false,
    call_type: 'genuine',
    service: 'Drain Hydro-jetting',
    summary: 'Severe clogged main sewer line. AI scheduled hydro-jetting service for tomorrow afternoon.',
    transcript: 'User: My sewer line is completely backed up into the basement.\nAI: That needs immediate attention. I can schedule our drain hydro-jetting truck for tomorrow at 2:00 PM.\nUser: Perfect, please do.',
    sentiment: 'positive',
    booking_status: 'booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-007',
    retell_call_id: 'retell_call_007',
    caller_name: 'Robert Taylor',
    caller_phone: '+1 (555) 789-0123',
    started_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 28 * 3600 * 1000 + 140 * 1000).toISOString(),
    duration_seconds: 140,
    status: 'answered',
    outcome: 'qualified',
    is_qualified: true,
    callback_requested: false,
    call_type: 'genuine',
    service: 'Kitchen Faucet Replacement',
    summary: 'Customer bought a new Kohler faucet and needed professional installation.',
    transcript: 'User: I bought a new faucet and need someone to install it.\nAI: We can assist with that. How about Thursday at 10:00 AM?\nUser: Sounds great.',
    sentiment: 'positive',
    booking_status: 'booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-008',
    retell_call_id: 'retell_call_008',
    caller_name: 'Jessica Alba',
    caller_phone: '+1 (555) 890-1234',
    started_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 48 * 3600 * 1000 + 160 * 1000).toISOString(),
    duration_seconds: 160,
    status: 'answered',
    outcome: 'qualified',
    is_qualified: true,
    callback_requested: false,
    call_type: 'genuine',
    service: 'Sewer Camera Inspection',
    summary: 'Customer requested sewer camera inspection. Booking was recorded as booked but appointment time needed manual confirmation.',
    transcript: 'User: I need a camera scope for my sewer main line.\nAI: Sure, I have marked you for Friday morning.',
    sentiment: 'neutral',
    booking_status: 'booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-009',
    retell_call_id: 'retell_call_009',
    caller_name: 'James Wilson',
    caller_phone: '+1 (555) 234-8901',
    started_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 72 * 3600 * 1000 + 150 * 1000).toISOString(),
    duration_seconds: 150,
    status: 'answered',
    outcome: 'callback_requested',
    is_qualified: true,
    callback_requested: true,
    call_type: 'genuine',
    service: 'Sump Pump Check',
    summary: 'Customer called regarding noisy sump pump. Asked for callback. Dispatcher called back and resolved.',
    transcript: 'User: My sump pump is making a grinding noise.\nAI: Let me request a callback from a senior technician.',
    sentiment: 'positive',
    booking_status: 'not_booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-010',
    retell_call_id: 'retell_call_010',
    caller_name: 'Unknown caller',
    caller_phone: '+1 (555) 111-2233',
    started_at: new Date(Date.now() - 78 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 78 * 3600 * 1000 + 18 * 1000).toISOString(),
    duration_seconds: 18,
    status: 'answered',
    outcome: 'spam',
    is_qualified: false,
    callback_requested: false,
    call_type: 'wrong_number',
    service: null,
    summary: 'Caller was trying to reach a local pizza restaurant.',
    transcript: 'User: Is this Mario Pizza?\nAI: No, this is Apex Plumbing & Heating.',
    sentiment: 'neutral',
    booking_status: 'not_booked',
    raw_payload: {},
    created_at: new Date(Date.now() - 78 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'app-001',
    call_id: 'call-001',
    customer_name: 'John Smith',
    customer_phone: '+1 (555) 123-4567',
    address: '742 Evergreen Terrace, Springfield',
    service: 'Emergency Pipe Repair',
    start_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
    google_event_id: 'gcal_event_001',
    status: 'scheduled',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'app-006',
    call_id: 'call-006',
    customer_name: 'Emily Davis',
    customer_phone: '+1 (555) 654-3210',
    address: '104 Elm Street, Downtown',
    service: 'Drain Hydro-jetting',
    start_time: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 29 * 3600 * 1000).toISOString(),
    google_event_id: 'gcal_event_006',
    status: 'scheduled',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'app-007',
    call_id: 'call-007',
    customer_name: 'Robert Taylor',
    customer_phone: '+1 (555) 789-0123',
    address: '45 Oak Lane, Westside',
    service: 'Kitchen Faucet Replacement',
    start_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 49 * 3600 * 1000).toISOString(),
    google_event_id: 'gcal_event_007',
    status: 'scheduled',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_FOLLOW_UPS: FollowUpRecord[] = [
  {
    id: 'fu-002',
    call_id: 'call-002',
    reason: 'qualified_not_booked',
    notes: 'Qualified lead for tankless water heater ($2k+ quote). Follow up in 24 hours to schedule audit.',
    status: 'open',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    resolved_at: null,
    call: INITIAL_CALLS[1],
  },
  {
    id: 'fu-003',
    call_id: 'call-003',
    reason: 'callback_requested',
    notes: 'Commercial client (12-unit complex). Requested callback after 2 PM.',
    status: 'open',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    resolved_at: null,
    call: INITIAL_CALLS[2],
  },
  {
    id: 'fu-005',
    call_id: 'call-005',
    reason: 'failed_call',
    notes: 'Call disconnected after 8s while reporting main drain backup. Call back immediately.',
    status: 'open',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolved_at: null,
    call: INITIAL_CALLS[4],
  },
  {
    id: 'fu-008',
    call_id: 'call-008',
    reason: 'needs_human',
    notes: 'Booking status is marked booked but exact appointment datetime was ambiguous in payload. Contact client to confirm time.',
    status: 'open',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    resolved_at: null,
    call: INITIAL_CALLS[7],
  },
  {
    id: 'fu-009',
    call_id: 'call-009',
    reason: 'callback_requested',
    notes: 'Dispatcher called back, diagnosed float switch issue over phone and scheduled maintenance.',
    status: 'resolved',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    call: INITIAL_CALLS[8],
  }
];

class MockStore {
  private calls: CallRecord[] = [...INITIAL_CALLS];
  private appointments: AppointmentRecord[] = [...INITIAL_APPOINTMENTS];
  private followUps: FollowUpRecord[] = [...INITIAL_FOLLOW_UPS];
  private listeners: Set<() => void> = new Set();

  public getCalls(): CallRecord[] {
    return [...this.calls].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getAppointments(): AppointmentRecord[] {
    return [...this.appointments].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }

  public getFollowUps(): FollowUpRecord[] {
    return [...this.followUps].map(fu => {
      const linkedCall = this.calls.find(c => c.id === fu.call_id);
      return { ...fu, call: linkedCall || fu.call };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addCall(call: Omit<CallRecord, 'id' | 'created_at'>): CallRecord {
    const newCall: CallRecord = {
      ...call,
      id: `call-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Upsert by retell_call_id
    const existingIndex = this.calls.findIndex(c => c.retell_call_id === newCall.retell_call_id);
    if (existingIndex >= 0) {
      this.calls[existingIndex] = { ...this.calls[existingIndex], ...newCall };
    } else {
      this.calls.unshift(newCall);
    }

    this.notify();
    return newCall;
  }

  public addAppointment(app: Omit<AppointmentRecord, 'id' | 'created_at'>): AppointmentRecord {
    const newApp: AppointmentRecord = {
      ...app,
      id: `app-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.appointments.unshift(newApp);

    // Update linked call booking_status to booked
    if (app.call_id) {
      const call = this.calls.find(c => c.id === app.call_id);
      if (call) {
        call.booking_status = 'booked';
      }
    }

    this.notify();
    return newApp;
  }

  public addFollowUp(fu: Omit<FollowUpRecord, 'id' | 'created_at'>): FollowUpRecord {
    const newFu: FollowUpRecord = {
      ...fu,
      id: `fu-${Date.now()}`,
      created_at: new Date().toISOString(),
      resolved_at: fu.status === 'resolved' ? new Date().toISOString() : null,
    };
    this.followUps.unshift(newFu);
    this.notify();
    return newFu;
  }

  public resolveFollowUp(id: string): void {
    const item = this.followUps.find(f => f.id === id);
    if (item) {
      item.status = 'resolved';
      item.resolved_at = new Date().toISOString();
      this.notify();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }
}

export const mockStore = new MockStore();
