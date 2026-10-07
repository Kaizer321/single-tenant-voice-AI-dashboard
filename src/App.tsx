import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { NavigationLayout } from './components/NavigationLayout';
import type { NavTab } from './components/NavigationLayout';
import { OverviewPage } from './pages/OverviewPage';
import { CallHistoryPage } from './pages/CallHistoryPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { DevSimulatorPage } from './pages/DevSimulatorPage';
import type { CallRecord, AppointmentRecord, FollowUpRecord } from './types/database';
import { mockStore } from './lib/mock-store';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const queryClient = new QueryClient();

const DashboardContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [showSimulator, setShowSimulator] = useState<boolean>(() => {
    return window.location.hash === '#/dev/simulator';
  });

  // Dashboard Data States
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hash listener for dev simulator route
  useEffect(() => {
    const handleHashChange = () => {
      setShowSimulator(window.location.hash === '#/dev/simulator');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Primary Data Fetching & Realtime Subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (isSupabaseConfigured) {
        try {
          const [callsRes, appRes, fuRes] = await Promise.all([
            supabase.from('calls').select('*').order('created_at', { ascending: false }),
            supabase.from('appointments').select('*').order('start_time', { ascending: true }),
            supabase.from('follow_ups').select('*, call:calls(*)').order('created_at', { ascending: false }),
          ]);

          if (callsRes.error) throw callsRes.error;
          if (appRes.error) throw appRes.error;
          if (fuRes.error) throw fuRes.error;

          setCalls(callsRes.data || []);
          setAppointments(appRes.data || []);
          setFollowUps(fuRes.data || []);
        } catch (err: any) {
          console.error("Error loading Supabase data:", err);
          setError("Connected to Supabase, but failed to fetch data. Falling back to local data.");
          setCalls(mockStore.getCalls());
          setAppointments(mockStore.getAppointments());
          setFollowUps(mockStore.getFollowUps());
        }
      } else {
        // Mock store fallback mode
        setCalls(mockStore.getCalls());
        setAppointments(mockStore.getAppointments());
        setFollowUps(mockStore.getFollowUps());
      }
      setLoading(false);
    };

    fetchData();

    // Supabase Realtime Subscriptions
    let callsSub: any;
    let appsSub: any;
    let followUpsSub: any;

    if (isSupabaseConfigured) {
      callsSub = supabase.channel('realtime_calls')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, () => {
          fetchData();
        }).subscribe();

      appsSub = supabase.channel('realtime_apps')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          fetchData();
        }).subscribe();

      followUpsSub = supabase.channel('realtime_followups')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_ups' }, () => {
          fetchData();
        }).subscribe();
    }

    // Subscribe to mock store updates for dev fallback
    const unsubscribeMock = mockStore.subscribe(() => {
      if (!isSupabaseConfigured) {
        setCalls(mockStore.getCalls());
        setAppointments(mockStore.getAppointments());
        setFollowUps(mockStore.getFollowUps());
      }
    });

    return () => {
      unsubscribeMock();
      if (isSupabaseConfigured) {
        if (callsSub) supabase.removeChannel(callsSub);
        if (appsSub) supabase.removeChannel(appsSub);
        if (followUpsSub) supabase.removeChannel(followUpsSub);
      }
    };
  }, [isAuthenticated]);

  // Action: Mark follow up resolved
  const handleResolveFollowUp = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('follow_ups')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        setFollowUps(prev => prev.map(fu => 
          fu.id === id ? { ...fu, status: 'resolved', resolved_at: new Date().toISOString() } : fu
        ));
      } catch (err) {
        console.error("Error resolving follow-up in Supabase:", err);
      }
    } else {
      mockStore.resolveFollowUp(id);
      setFollowUps(mockStore.getFollowUps());
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (showSimulator && import.meta.env.VITE_ENABLE_DEV !== 'false') {
    return <DevSimulatorPage onBackToDashboard={() => {
      window.location.hash = '';
      setShowSimulator(false);
    }} />;
  }

  return (
    <NavigationLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'overview' && (
        <OverviewPage
          calls={calls}
          appointments={appointments}
          followUps={followUps}
          loading={loading}
          error={error}
          onNavigateToCalls={() => setActiveTab('calls')}
          onNavigateToFollowUps={() => setActiveTab('followups')}
        />
      )}
      {activeTab === 'calls' && (
        <CallHistoryPage
          calls={calls}
          appointments={appointments}
          loading={loading}
        />
      )}
      {activeTab === 'followups' && (
        <FollowUpsPage
          followUps={followUps}
          loading={loading}
          onResolveFollowUp={handleResolveFollowUp}
        />
      )}
    </NavigationLayout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
