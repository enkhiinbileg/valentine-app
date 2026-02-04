"use client";

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from '@/components/LandingPage'
import CardGenerator from '@/components/CardGenerator'
import SharedCard from '@/components/SharedCard'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'

export default function Home() {
  const [view, setView] = useState('landing') // landing, create, view
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  /* Define refresh function outside effect so it can be passed down */
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getProfile(user.id);
      setProfile(userProfile);
    }
  };

  useEffect(() => {
    console.log("Home component mounted, checking auth...");

    const checkInitialSession = async () => {
      console.warn("--- AUTH DEBUG START ---");
      const currentHash = window.location.hash;
      console.warn("Current Hash excerpt:", currentHash.substring(0, 30));

      try {
        // 1. Check existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          console.warn("Session found automatically for:", session.user.email);
          setUser(session.user);
          const userProfile = await getProfile(session.user.id);
          setProfile(userProfile);
        } else if (currentHash.includes('access_token')) {
          // 2. Manual fallback
          console.warn("No session but access_token in hash. Manually setting...");
          const params = new URLSearchParams(currentHash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            const { data: { session: newSession }, error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (newSession) {
              console.warn("Manual login SUCCESS!");
              setUser(newSession.user);
              const userProfile = await getProfile(newSession.user.id);
              setProfile(userProfile);
              window.history.replaceState(null, '', window.location.pathname);
            } else if (setErr) {
              console.error("Manual login FAILED:", setErr.message);
            }
          }
        } else {
          console.warn("No session and no token in URL.");
        }
      } catch (e: any) {
        console.error("Auth Exception:", e.message || e);
      } finally {
        setLoadingAuth(false);
        console.warn("--- AUTH DEBUG END ---");
      }
    };

    checkInitialSession();

    // Listen for changes (This will catch the login event from the URL hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event, session?.user?.email);

      if (session?.user) {
        setUser(session.user);
        const userProfile = await getProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoadingAuth(false);
    });

    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      setView('view')
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [])

  return (
    <main>
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LandingPage onCreate={() => setView('create')} user={user} profile={profile} />
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <CardGenerator
              onBack={() => setView('landing')}
              user={user}
              profile={profile}
              loadingAuth={loadingAuth}
              refreshProfile={refreshProfile}
            />
          </motion.div>
        )}

        {view === 'view' && (
          <motion.div
            key="view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SharedCard />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
