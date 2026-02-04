"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            const requestUrl = new URL(window.location.href);
            const code = requestUrl.searchParams.get('code');

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error('Error exchanging code:', error.message);
                    router.push('/?error=code_exchange_failed');
                    return;
                }
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error getting session:', sessionError.message);
                router.push('/?error=session_error');
                return;
            }

            if (session) {
                window.location.replace('/');
            } else {
                window.location.replace('/');
            }
        };

        handleAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-rose-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Нэвтрэлтийг баталгаажуулж байна...</p>
            <p className="text-sm text-rose-300">Түр хүлээнэ үү</p>
        </div>
    );
}
