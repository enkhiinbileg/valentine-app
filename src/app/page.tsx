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
      console.log("--- Auth Check Start ---");
      console.log("Window Hash Length:", window.location.hash.length);
      if (window.location.hash) console.log("Hash excerpt:", window.location.hash.substring(0, 30) + "...");

      try {
        // 1. Standard Session Check
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase getSession Error:", error.message);
          throw error;
        }

        console.log("Initial session status:", session ? "Found" : "Not Found");

        // 2. Fragment Parsing Fallback
        if (!session && window.location.hash.includes('access_token')) {
          console.log("Access token found in hash. Attempting manual session set...");

          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            console.log("Token extracted. Calling setSession...");
            const { data: { session: newSession }, error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (setErr) {
              console.error("setSession Error:", setErr.message);
            } else if (newSession) {
              console.log("Manual session set SUCCESS for:", newSession.user.email);
              setUser(newSession.user);
              const userProfile = await getProfile(newSession.user.id);
              setProfile(userProfile);
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          } else {
            console.warn("Found access_token key but value was empty in hash.");
          }
        }

        if (session?.user) {
          console.log("Session verified for:", session.user.email);
          setUser(session.user);
          const userProfile = await getProfile(session.user.id);
          setProfile(userProfile);
        } else {
          console.log("No user session identified.");
        }
      } catch (err: any) {
        console.error("Critical Auth Check Failed:", err.message || err);
      } finally {
        setLoadingAuth(false);
        console.log("--- Auth Check End ---");
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
