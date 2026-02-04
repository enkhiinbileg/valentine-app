import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Fetch params
        const sender = searchParams.get('sender') || 'Нууц';
        const partner = searchParams.get('partner') || 'Хайрт';
        const theme = searchParams.get('theme') || 'classic';

        // Theme configs
        const colors = {
            classic: { bg: '#fff0f3', accent: '#ff4d6d', text: '#881337' },
            midnight: { bg: '#1e1b4b', accent: '#6366f1', text: '#e0e7ff' },
            vintage: { bg: '#fffbeb', accent: '#d97706', text: '#78350f' },
            cyber: { bg: '#0f172a', accent: '#06b6d4', text: '#cffafe' },
            diamond: { bg: '#f3f4f6', accent: '#7c3aed', text: '#4c1d95' },
        };

        const style = colors[theme as keyof typeof colors] || colors.classic;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: style.bg,
                        backgroundImage: `radial-gradient(circle at 25px 25px, ${style.accent} 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${style.accent} 2%, transparent 0%)`,
                        backgroundSize: '100px 100px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '40px',
                            padding: '40px 80px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                            border: `4px solid ${style.accent}`,
                        }}
                    >
                        <div style={{ fontSize: 32, marginBottom: 20, color: style.accent }}>
                            💌 Гэгээн Валентины Мэнд!
                        </div>

                        <div style={{ fontSize: 72, fontWeight: 'bold', color: style.text, marginBottom: 10, whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                            {partner}
                        </div>

                        <div style={{ fontSize: 24, color: style.accent, marginBottom: 10 }}>
                            Танд ирсэн зурвас:
                        </div>

                        <div style={{ fontSize: 40, fontWeight: 'bold', color: style.text, opacity: 0.8 }}>
                            From: {sender}
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: 40, fontSize: 24, color: style.accent, opacity: 0.8 }}>
                        valentine.artmo.dev
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
