export interface BusinessConfig {
  name: string;
  tagline: string;
  logoUrl?: string;
  timezone: string;
  phone: string;
  retellAgentId: string;
  googleCalendarId: string;
  accentColor: string;
}

export const businessConfig: BusinessConfig = {
  name: import.meta.env.VITE_BUSINESS_NAME || 'Apex Plumbing & Heating',
  tagline: import.meta.env.VITE_BUSINESS_TAGLINE || '24/7 Professional Voice AI Desk',
  logoUrl: import.meta.env.VITE_BUSINESS_LOGO_URL || '',
  timezone: import.meta.env.VITE_BUSINESS_TIMEZONE || 'America/New_York',
  phone: import.meta.env.VITE_BUSINESS_PHONE || '+1 (555) 234-5678',
  retellAgentId: import.meta.env.VITE_RETELL_AGENT_ID || 'agent_demo_123',
  googleCalendarId: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary',
  accentColor: import.meta.env.VITE_ACCENT_COLOR || '#2563eb',
};
