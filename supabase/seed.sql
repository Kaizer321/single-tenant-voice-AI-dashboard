-- Seed script: ~15 realistic fake calls for single-tenant voice AI dashboard

DO $$
DECLARE
    call1_id UUID := gen_random_uuid();
    call2_id UUID := gen_random_uuid();
    call3_id UUID := gen_random_uuid();
    call4_id UUID := gen_random_uuid();
    call5_id UUID := gen_random_uuid();
    call6_id UUID := gen_random_uuid();
    call7_id UUID := gen_random_uuid();
    call8_id UUID := gen_random_uuid();
    call9_id UUID := gen_random_uuid();
    call10_id UUID := gen_random_uuid();
    call11_id UUID := gen_random_uuid();
    call12_id UUID := gen_random_uuid();
    call13_id UUID := gen_random_uuid();
    call14_id UUID := gen_random_uuid();
    call15_id UUID := gen_random_uuid();
BEGIN
    -- Clear existing seed data if any
    TRUNCATE follow_ups, appointments, calls CASCADE;

    -- 1. Booked Call (Emergency Pipe Repair)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call1_id,
        'retell_call_001',
        'John Smith',
        '+1 (555) 123-4567',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours' + INTERVAL '180 seconds',
        180,
        'answered',
        'qualified',
        TRUE,
        FALSE,
        'genuine',
        'Emergency Pipe Repair',
        'Customer reported a bursting pipe under the kitchen sink. AI booked an urgent technician appointment for tomorrow morning.',
        'User: Hello, I have water leaking under my kitchen sink!\nAI: I can help with that. Is it a continuous leak?\nUser: Yes, it is bursting out.\nAI: Let me book our emergency technician for tomorrow at 9:00 AM. What is your address?\nUser: 742 Evergreen Terrace.',
        'positive',
        'booked',
        NOW() - INTERVAL '2 hours'
    );

    INSERT INTO appointments (call_id, customer_name, customer_phone, address, service, start_time, end_time, google_event_id, status, created_at)
    VALUES (
        call1_id,
        'John Smith',
        '+1 (555) 123-4567',
        '742 Evergreen Terrace, Springfield',
        'Emergency Pipe Repair',
        NOW() + INTERVAL '1 day' + INTERVAL '4 hours',
        NOW() + INTERVAL '1 day' + INTERVAL '5 hours',
        'gcal_event_001',
        'scheduled',
        NOW() - INTERVAL '2 hours'
    );

    -- 2. Qualified Call, Not Booked (Water Heater Installation Quote)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call2_id,
        'retell_call_002',
        'Sarah Jenkins',
        '+1 (555) 987-6543',
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '4 hours' + INTERVAL '240 seconds',
        240,
        'answered',
        'qualified',
        TRUE,
        FALSE,
        'genuine',
        'Tankless Water Heater Installation',
        'Customer asked for a cost estimate for installing a tankless water heater. Qualified lead, but wanted to discuss with her spouse before confirming time slot.',
        'User: Hi, how much does it cost to install a tankless water heater?\nAI: Prices typically range from $1,800 to $3,200 depending on your electrical setup. Would you like a free home audit?\nUser: I need to check with my husband first.',
        'neutral',
        'not_booked',
        NOW() - INTERVAL '4 hours'
    );

    INSERT INTO follow_ups (call_id, reason, notes, status, created_at)
    VALUES (
        call2_id,
        'qualified_not_booked',
        'Qualified lead for tankless water heater ($2k+ quote). Follow up in 24 hours to schedule audit.',
        'open',
        NOW() - INTERVAL '4 hours'
    );

    -- 3. Callback Requested (HVAC / Boiler Maintenance)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call3_id,
        'retell_call_003',
        'Michael Vance',
        '+1 (555) 456-7890',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '6 hours' + INTERVAL '110 seconds',
        110,
        'answered',
        'callback_requested',
        TRUE,
        TRUE,
        'genuine',
        'Commercial Boiler Inspection',
        'Commercial property manager requested a callback from senior master plumber regarding multi-unit maintenance contract.',
        'User: I manage a 12-unit complex and need commercial boiler inspection.\nAI: Great, I will have our Commercial Lead call you back today.\nUser: Thanks, call me after 2 PM.',
        'positive',
        'not_booked',
        NOW() - INTERVAL '6 hours'
    );

    INSERT INTO follow_ups (call_id, reason, notes, status, created_at)
    VALUES (
        call3_id,
        'callback_requested',
        'Commercial client (12-unit complex). Requested callback after 2 PM.',
        'open',
        NOW() - INTERVAL '6 hours'
    );

    -- 4. Spam Call (Robocall Solar Marketing)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call4_id,
        'retell_call_004',
        'Unknown caller',
        '+1 (800) 555-0199',
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '8 hours' + INTERVAL '25 seconds',
        25,
        'answered',
        'spam',
        FALSE,
        FALSE,
        'spam',
        NULL,
        'Automated marketing call offering solar panels.',
        'User: Hello! You have been pre-selected for free solar panel installation...\nAI: Thank you, but we are a plumbing business.',
        'negative',
        'not_booked',
        NOW() - INTERVAL '8 hours'
    );

    -- 5. Failed Call (Network Disconnect)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call5_id,
        'retell_call_005',
        'David Miller',
        '+1 (555) 321-7654',
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '12 hours' + INTERVAL '8 seconds',
        8,
        'failed',
        'not_qualified',
        FALSE,
        FALSE,
        'genuine',
        'Drain Cleaning',
        'Call dropped due to poor cellular reception after caller stated drain issue.',
        'User: Hi my main drain is backing up...\n[Call disconnected]',
        'neutral',
        'not_booked',
        NOW() - INTERVAL '12 hours'
    );

    INSERT INTO follow_ups (call_id, reason, notes, status, created_at)
    VALUES (
        call5_id,
        'failed_call',
        'Call disconnected after 8s while reporting main drain backup. Call back immediately.',
        'open',
        NOW() - INTERVAL '12 hours'
    );

    -- 6. Booked Call (Clogged Drain Clearing)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call6_id,
        'retell_call_006',
        'Emily Davis',
        '+1 (555) 654-3210',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '195 seconds',
        195,
        'answered',
        'qualified',
        TRUE,
        FALSE,
        'genuine',
        'Drain Hydro-jetting',
        'Severe clogged main sewer line. AI scheduled hydro-jetting service for tomorrow afternoon.',
        'User: My sewer line is completely backed up into the basement.\nAI: That needs immediate attention. I can schedule our drain hydro-jetting truck for tomorrow at 2:00 PM.\nUser: Perfect, please do.',
        'positive',
        'booked',
        NOW() - INTERVAL '1 day'
    );

    INSERT INTO appointments (call_id, customer_name, customer_phone, address, service, start_time, end_time, google_event_id, status, created_at)
    VALUES (
        call6_id,
        'Emily Davis',
        '+1 (555) 654-3210',
        '104 Elm Street, Downtown',
        'Drain Hydro-jetting',
        NOW() + INTERVAL '1 day' + INTERVAL '9 hours',
        NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
        'gcal_event_006',
        'scheduled',
        NOW() - INTERVAL '1 day'
    );

    -- 7. Booked Call (Faucet Replacement)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call7_id,
        'retell_call_007',
        'Robert Taylor',
        '+1 (555) 789-0123',
        NOW() - INTERVAL '1 day 4 hours',
        NOW() - INTERVAL '1 day 4 hours' + INTERVAL '140 seconds',
        140,
        'answered',
        'qualified',
        TRUE,
        FALSE,
        'genuine',
        'Kitchen Faucet Replacement',
        'Customer bought a new Kohler faucet and needed professional installation.',
        'User: I bought a new faucet and need someone to install it.\nAI: We can assist with that. How about Thursday at 10:00 AM?\nUser: Sounds great.',
        'positive',
        'booked',
        NOW() - INTERVAL '1 day 4 hours'
    );

    INSERT INTO appointments (call_id, customer_name, customer_phone, address, service, start_time, end_time, google_event_id, status, created_at)
    VALUES (
        call7_id,
        'Robert Taylor',
        '+1 (555) 789-0123',
        '45 Oak Lane, Westside',
        'Kitchen Faucet Replacement',
        NOW() + INTERVAL '2 days' + INTERVAL '5 hours',
        NOW() + INTERVAL '2 days' + INTERVAL '6 hours',
        'gcal_event_007',
        'scheduled',
        NOW() - INTERVAL '1 day 4 hours'
    );

    -- 8. Booked Call (Sewer Line Inspection) - Needs Human follow-up cross-check
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call8_id,
        'retell_call_008',
        'Jessica Alba',
        '+1 (555) 890-1234',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days' + INTERVAL '160 seconds',
        160,
        'answered',
        'qualified',
        TRUE,
        FALSE,
        'genuine',
        'Sewer Camera Inspection',
        'Customer requested sewer camera inspection. Booking was recorded as booked but appointment time needed manual confirmation.',
        'User: I need a camera scope for my sewer main line.\nAI: Sure, I have marked you for Friday morning.',
        'neutral',
        'booked',
        NOW() - INTERVAL '2 days'
    );

    INSERT INTO follow_ups (call_id, reason, notes, status, created_at)
    VALUES (
        call8_id,
        'needs_human',
        'Booking status is marked booked but exact appointment datetime was ambiguous in payload. Contact client to confirm time.',
        'open',
        NOW() - INTERVAL '2 days'
    );

    -- 9. Resolved Follow-up (General Inquiry resolved)
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call9_id,
        'retell_call_009',
        'James Wilson',
        '+1 (555) 234-8901',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days' + INTERVAL '150 seconds',
        150,
        'answered',
        'callback_requested',
        TRUE,
        TRUE,
        'genuine',
        'Sump Pump Check',
        'Customer called regarding noisy sump pump. Asked for callback. Dispatcher called back and resolved.',
        'User: My sump pump is making a grinding noise.\nAI: Let me request a callback from a senior technician.',
        'positive',
        'not_booked',
        NOW() - INTERVAL '3 days'
    );

    INSERT INTO follow_ups (call_id, reason, notes, status, created_at, resolved_at)
    VALUES (
        call9_id,
        'callback_requested',
        'Dispatcher called back, diagnosed float switch issue over phone and scheduled maintenance.',
        'resolved',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days'
    );

    -- 10. Wrong Number Call
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES (
        call10_id,
        'retell_call_010',
        'Unknown caller',
        '+1 (555) 111-2233',
        NOW() - INTERVAL '3 days 6 hours',
        NOW() - INTERVAL '3 days 6 hours' + INTERVAL '18 seconds',
        18,
        'answered',
        'spam',
        FALSE,
        FALSE,
        'wrong_number',
        NULL,
        'Caller was trying to reach a local pizza restaurant.',
        'User: Is this Mario Pizza?\nAI: No, this is Apex Plumbing & Heating.',
        'neutral',
        'not_booked',
        NOW() - INTERVAL '3 days 6 hours'
    );

    -- 11-15. Mix of historical calls over the last 30 days
    INSERT INTO calls (id, retell_call_id, caller_name, caller_phone, started_at, ended_at, duration_seconds, status, outcome, is_qualified, callback_requested, call_type, service, summary, transcript, sentiment, booking_status, created_at)
    VALUES
    (call11_id, 'retell_call_011', 'Karen White', '+1 (555) 444-5566', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '210 seconds', 210, 'answered', 'qualified', TRUE, FALSE, 'genuine', 'Water Line Replacement', 'Inquired about water line replacement. Booked audit.', 'User: I need main water line replacement quote...', 'positive', 'booked', NOW() - INTERVAL '5 days'),
    (call12_id, 'retell_call_012', 'David Clark', '+1 (555) 333-7788', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '120 seconds', 120, 'answered', 'not_qualified', FALSE, FALSE, 'genuine', 'HVAC Ductwork', 'Called for ductwork cleaning. AI clarified we specialize in plumbing & boilers.', 'User: Do you clean air ducts?', 'neutral', 'not_booked', NOW() - INTERVAL '6 days'),
    (call13_id, 'retell_call_013', 'Lisa Ray', '+1 (555) 999-0011', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '175 seconds', 175, 'answered', 'qualified', TRUE, FALSE, 'genuine', 'Garbage Disposal Repair', 'Clogged garbage disposal. Scheduled repair.', 'User: My disposal jammed and won me reset.', 'positive', 'booked', NOW() - INTERVAL '10 days'),
    (call14_id, 'retell_call_014', 'Tom Hardy', '+1 (555) 888-2211', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '130 seconds', 130, 'answered', 'not_qualified', FALSE, FALSE, 'genuine', 'DIY Advice', 'Asking how to unfreeze pipes himself.', 'User: Can I use a hairdryer on my pipes?', 'neutral', 'not_booked', NOW() - INTERVAL '15 days'),
    (call15_id, 'retell_call_015', 'Amanda Knox', '+1 (555) 777-3322', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '190 seconds', 190, 'answered', 'qualified', TRUE, FALSE, 'genuine', 'Bathroom Plumbing Rough-in', 'New construction bathroom rough-in quote booked.', 'User: Building an addition, need rough-in plumbing.', 'positive', 'booked', NOW() - INTERVAL '20 days');

    INSERT INTO appointments (call_id, customer_name, customer_phone, address, service, start_time, end_time, google_event_id, status, created_at)
    VALUES
    (call11_id, 'Karen White', '+1 (555) 444-5566', '12 Pine St', 'Water Line Replacement', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1 hour', 'gcal_event_011', 'scheduled', NOW() - INTERVAL '5 days'),
    (call13_id, 'Lisa Ray', '+1 (555) 999-0011', '88 Maple Ave', 'Garbage Disposal Repair', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '1 hour', 'gcal_event_013', 'scheduled', NOW() - INTERVAL '10 days'),
    (call15_id, 'Amanda Knox', '+1 (555) 777-3322', '404 Birch Rd', 'Bathroom Plumbing Rough-in', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '2 hours', 'gcal_event_015', 'scheduled', NOW() - INTERVAL '20 days');

END $$;
