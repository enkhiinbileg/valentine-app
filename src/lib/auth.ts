"use client";

import { supabase } from "@/lib/supabase";

export const signInWithGoogle = async () => {
    try {
        console.log("Starting Google Sign In...");

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error("Supabase environment variables are missing!");
            alert("Supabase тохиргоо дутуу байна (.env файл)");
            return;
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            console.error("Supabase OAuth Error:", error.message);
            throw error;
        }

        console.log("OAuth sign in initiated:", data);
    } catch (error: any) {
        console.error("Critical Login Error:", error);
        // If it's an AbortError, it might be a Next.js/Turbopack internally handled one
        if (error.name === 'AbortError') {
            console.warn("Login was aborted, but this might be expected during redirect.");
            return;
        }
        throw error;
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
};

export const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
};

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
    }
    return data;
};
