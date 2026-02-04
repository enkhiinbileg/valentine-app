"use server";

import { getUploadUrl } from "@/lib/r2";
import { createClient } from '@supabase/supabase-js';

export async function getR2UploadUrlAction(fileName: string, contentType: string) {
    try {
        const url = await getUploadUrl(fileName, contentType);
        return { url };
    } catch (error) {
        console.error("Failed to generate R2 upload URL:", error);
        throw new Error("Failed to generate upload URL");
    }
}

export async function createCardAction(cardPayload: any, memoriesPayload: any[]) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
        throw new Error("Server configuration error: NEXT_PUBLIC_SUPABASE_URL is missing");
    }

    // Prefer service role key for server-side actions, fallback to anon key
    const supabaseKey = serviceKey || anonKey;

    if (!supabaseKey) {
        throw new Error("Server configuration error: Supabase API keys are missing");
    }

    console.log(`Using ${serviceKey ? 'Service Role' : 'Anon'} key for card creation`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Insert Card
        const { error: cardError } = await supabase
            .from('cards')
            .insert([cardPayload]);

        if (cardError) {
            console.error("Card Insert Error:", cardError);
            throw new Error(`Failed to create card: ${cardError.message}`);
        }

        // 2. Insert Memories
        if (memoriesPayload && memoriesPayload.length > 0) {
            const { error: memError } = await supabase
                .from('memories')
                .insert(memoriesPayload);

            if (memError) {
                console.error("Memories Insert Error:", memError);
                throw new Error(`Failed to save memories: ${memError.message}`);
            }
        }

        return { success: true, id: cardPayload.id };
    } catch (error: any) {
        console.error("Server Action Failed:", error);
        return { success: false, error: error.message || "Unknown server error" };
    }
}
