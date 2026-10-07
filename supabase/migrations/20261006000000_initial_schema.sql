-- Migration: 20261006000000_initial_schema.sql
-- Single Tenant Database Schema for Voice Agent Dashboard

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Calls Table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retell_call_id TEXT UNIQUE NOT NULL,
    caller_name TEXT,
    caller_phone TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    status TEXT CHECK (status IN ('answered', 'failed', 'missed')),
    outcome TEXT CHECK (outcome IN ('qualified', 'not_qualified', 'spam', 'callback_requested')),
    is_qualified BOOLEAN DEFAULT FALSE,
    callback_requested BOOLEAN DEFAULT FALSE,
    call_type TEXT CHECK (call_type IN ('genuine', 'spam', 'wrong_number')) DEFAULT 'genuine',
    service TEXT,
    summary TEXT,
    transcript TEXT,
    sentiment TEXT,
    booking_status TEXT CHECK (booking_status IN ('booked', 'not_booked', 'pending')) DEFAULT 'pending',
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    address TEXT,
    service TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    google_event_id TEXT,
    status TEXT CHECK (status IN ('scheduled', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Follow-ups Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
    reason TEXT CHECK (reason IN ('callback_requested', 'qualified_not_booked', 'failed_call', 'needs_human')),
    notes TEXT,
    status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_retell_call_id ON calls(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_call_type ON calls(call_type);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time ASC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);

-- Enable Row Level Security (RLS)
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authenticated users (admin) can read and update data
CREATE POLICY "Allow authenticated read calls" ON calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update calls" ON calls FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read appointments" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update appointments" ON appointments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read follow_ups" ON follow_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert follow_ups" ON follow_ups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update follow_ups" ON follow_ups FOR UPDATE TO authenticated USING (true);

-- Enable Supabase Realtime publication for calls, appointments, and follow_ups
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE follow_ups;
