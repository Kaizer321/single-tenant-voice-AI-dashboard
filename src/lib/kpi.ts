import type { CallRecord, AppointmentRecord } from '../types/database';

export interface KPIMetrics {
  totalCalls: number;
  answeredCalls: number;
  failedOrMissedCalls: number;
  qualifiedLeads: number;
  appointmentsBooked: number;
  conversionRate: number; // Percentage float, e.g. 42.8
}

/**
 * Calculates dashboard KPI metrics from calls and appointments arrays.
 * 
 * STRICT RULES:
 * 1. Spam and wrong-number calls (call_type === 'spam' || call_type === 'wrong_number')
 *    are excluded from ALL KPIs including total calls, answered calls, and conversion rate.
 * 2. Source of truth for appointmentsBooked is the appointments table count.
 * 3. Conversion Rate Formula:
 *    conversionRate = (appointmentsBooked / answeredCalls) * 100
 *    If answeredCalls === 0, conversionRate = 0.
 */
export function calculateKPIMetrics(
  calls: CallRecord[],
  appointments: AppointmentRecord[]
): KPIMetrics {
  // Filter out spam and wrong number calls from all KPI calculations
  const validCalls = calls.filter(c => c.call_type !== 'spam' && c.call_type !== 'wrong_number');

  const totalCalls = validCalls.length;
  const answeredCalls = validCalls.filter(c => c.status === 'answered').length;
  const failedOrMissedCalls = validCalls.filter(c => c.status === 'failed' || c.status === 'missed').length;
  const qualifiedLeads = validCalls.filter(c => c.is_qualified || c.outcome === 'qualified').length;

  // Source of truth for booked appointments: appointments table count
  const appointmentsBooked = appointments.filter(a => a.status === 'scheduled').length;

  // Conversion rate = booked appointments / answered calls (expressed as percentage)
  const conversionRate = answeredCalls > 0
    ? Number(((appointmentsBooked / answeredCalls) * 100).toFixed(1))
    : 0;

  return {
    totalCalls,
    answeredCalls,
    failedOrMissedCalls,
    qualifiedLeads,
    appointmentsBooked,
    conversionRate,
  };
}
