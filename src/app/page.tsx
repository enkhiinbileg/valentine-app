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
    // Check initial user
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const userProfile = await getProfile(user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkUser();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);
      } else {
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
