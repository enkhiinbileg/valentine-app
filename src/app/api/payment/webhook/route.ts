import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin client to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // NOTE: In a real/prod app, use SERVICE_ROLE_KEY for admin rights
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

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
