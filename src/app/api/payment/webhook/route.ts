import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin client with safety checks
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { secret, userId, invoiceId, amount } = body;

        // 1. Security Check
        // In production, this should match a secure environment variable
        // e.g., process.env.PAYMENT_WEBHOOK_SECRET
        if (secret !== 'MY_SECURE_SECRET_KEY') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        console.log(`Processing payment for user: ${userId}, Invoice: ${invoiceId}`);

        // 2. Update Profile
        // We accept the payment and unlock the account
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error('Supabase credentials missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                is_paid: true,
                payment_status: 'paid',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Database update failed:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Payment processed successfully' });

    } catch (err) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
