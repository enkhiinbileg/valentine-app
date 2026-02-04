import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SharedCard from '@/components/SharedCard';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { id } = await params;
        const { data: card } = await supabase
            .from('cards')
            .select('partner_name, sender_name, theme')
            .eq('id', id)
            .single();

        if (!card) return { title: 'Valentine Card' };


        const title = `${card.partner_name}-д зориулсан гэнэтийн бэлэг 🎁`;
        const description = `${card.sender_name}-аас илгээсэн хайрын зурвас.`;

        // Dynamic OG Image URL
        const ogUrl = new URL('https://valentine.artmo.dev/api/og');
        ogUrl.searchParams.set('title', 'Valentine Card');
        ogUrl.searchParams.set('partner', card.partner_name);
        ogUrl.searchParams.set('sender', card.sender_name);
        ogUrl.searchParams.set('theme', card.theme || 'classic');

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                images: [
                    {
                        url: ogUrl.toString(),
                        width: 1200,
                        height: 630,
                        alt: 'Valentine Card Flash',
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [ogUrl.toString()],
            },
        };
    } catch (e) {
        console.error("Metadata generation failed:", e);
        return { title: 'Valentine Card' };
    }
}

export default async function CardPageRoute({ params }: Props) {
    const { id } = await params;
    // Картыг өгөгдлийн сангаас шалгах
    // Server-side check removed to allow client-side handling if RLS is tricky
    // const { data: card } = await supabase
    //     .from('cards')
    //     .select('id')
    //     .eq('id', params.id)
    //     .single();

    // if (!card) {
    //     notFound();
    // }

    return <SharedCard cardId={id} />;
}
