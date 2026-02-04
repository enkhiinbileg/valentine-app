"use client";

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import { Heart, Play, Pause, Loader2, Star, Zap, Sparkles, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import ValentineExperience from './ValentineExperience'
import Scrapbook from './Scrapbook'

const THEME_STYLES = {
    classic: {
        bg: 'bg-rose-500',
        gradient: 'from-rose-400 to-rose-600',
        text: 'text-rose-500',
        textDark: 'text-rose-900',
        border: 'border-rose-200',
        accent: 'text-rose-400',
        icon: Heart
    },
    midnight: {
        bg: 'bg-indigo-600',
        gradient: 'from-indigo-500 to-purple-800',
        text: 'text-indigo-500',
        textDark: 'text-indigo-950',
        border: 'border-indigo-200',
        accent: 'text-indigo-400',
        icon: Star
    },
    vintage: {
        bg: 'bg-amber-600',
        gradient: 'from-amber-400 to-orange-700',
        text: 'text-amber-600',
        textDark: 'text-orange-950',
        border: 'border-amber-200',
        accent: 'text-amber-400',
        icon: Sparkles
    },
    cyber: {
        bg: 'bg-cyan-600',
        gradient: 'from-cyan-400 to-blue-600',
        text: 'text-cyan-500',
        textDark: 'text-blue-950',
        border: 'border-cyan-200',
        accent: 'text-cyan-400',
        icon: Zap
    },
    starfield: {
        bg: 'bg-slate-900',
        gradient: 'from-slate-800 to-slate-950',
        text: 'text-white',
        textDark: 'text-slate-200',
        border: 'border-slate-700',
        accent: 'text-slate-400',
        icon: Sparkles
    }
}

const SharedCard = ({ cardId, previewData, onBack }: { cardId?: string, previewData?: any, onBack?: () => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | boolean>(false)
    const audioRef = React.useRef<HTMLAudioElement | null>(null)
    const sfxRef = React.useRef<HTMLAudioElement | null>(null)

    // Parallax mouse position removed in favor of MotionValue


    useEffect(() => {
        if (previewData) {
            setData(previewData);
            setLoading(false);
            return;
        }

        const fetchCard = async () => {
            const params = new URLSearchParams(window.location.search)
            const id = cardId || params.get('id')

            if (!id) {
                setLoading(false)
                return
            }

            try {
                const { data: cardData, error: dbError } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (dbError) throw dbError

                setData({
                    id: cardData.id,
                    partnerName: cardData.partner_name,
                    senderName: cardData.sender_name,
                    message: cardData.message,
                    photoUrl: cardData.photo_url || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
                    musicUrl: cardData.music_url,
                    theme: cardData.theme || 'classic',
                    viewCount: cardData.view_count || 0,
                    memories: []
                })

                // Fetch memories
                const { data: memories } = await supabase
                    .from('memories')
                    .select('*')
                    .eq('card_id', id)
                    .order('order', { ascending: true });

                if (memories) {
                    setData((prev: any) => ({ ...prev, memories }));
                }
            } catch (err: any) {
                // Ignore abort errors
                if (
                    err.name === 'AbortError' ||
                    err.message?.includes('aborted') ||
                    err.message?.includes('signal is aborted')
                ) {
                    console.log('Fetch aborted');
                    return;
                }
                console.error('Error fetching card code:', err);
                // Set detailed error message for UI
                let errorMessage = err.message || 'Unknown error';
                if (err.code) errorMessage += ` (Code: ${err.code})`;
                if (err.details) errorMessage += ` - ${err.details}`;

                setError(errorMessage);
            } finally {
                setLoading(false)
            }
        }

        fetchCard()
    }, [cardId])

    const incrementViewCount = async (id: string) => {
        try {
            await supabase.rpc('increment_view_count', { card_id: id });
        } catch (err) {
            // Fallback if RPC is not set up
            const { data: current } = await supabase.from('cards').select('view_count').eq('id', id).single();
            await supabase.from('cards').update({
                view_count: (current?.view_count || 0) + 1,
                last_viewed_at: new Date().toISOString()
            }).eq('id', id);
        }
    }

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    // 3D Tilt Effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-100, 100], [10, -10])
    const rotateY = useTransform(x, [-100, 100], [-10, 10])

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set(e.clientX - centerX)
        y.set(e.clientY - centerY)
    }

    const theme = THEME_STYLES[data?.theme as keyof typeof THEME_STYLES] || THEME_STYLES.classic
    const ThemeIcon = theme.icon

    const handleOpen = () => {
        setIsOpen(true)
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: [data?.theme === 'classic' ? '#ff4d6d' : '#6366f1', '#ffffff']
        })

        // Sound FX
        if (sfxRef.current) {
            sfxRef.current.play().catch(e => console.log("Sound error:", e));
        }

        // Analytics
        if (data?.id) {
            incrementViewCount(data.id);
        }

        if (data?.musicUrl) {
            setTimeout(() => {
                audioRef.current?.play()
                setIsPlaying(true)
            }, 800)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <Heart className="w-16 h-16 text-rose-200 mb-4" />
                <h2 className="text-2xl font-bold text-rose-900 mb-2">Уучлаарай, карт олдсонгүй</h2>
                <p className="text-rose-700/70 mb-6">Холбоос буруу эсвэл карт устаж үгүй болсон байна.</p>
                {typeof error === 'string' && (
                    <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-mono max-w-sm mx-auto text-left border border-red-100">
                        <strong>Debug Info:</strong><br />
                        ID: {cardId || 'undefined'}<br />
                        {error}
                    </div>
                )}
                <a href="/" className="mt-8 px-6 py-3 bg-white border border-rose-200 text-rose-500 rounded-full font-bold hover:bg-rose-50 transition-colors">
                    Шинээр карт үүсгэх
                </a>
            </div>
        )
    }

    if (data.theme === 'starfield') {
        return (
            <ValentineExperience
                partnerName={data.partnerName}
                senderName={data.senderName}
                message={data.message}
                musicUrl={data.musicUrl}
                memories={data.memories}
                onComplete={onBack}
            />
        )
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
        >
            {data.musicUrl && <audio ref={audioRef} src={data.musicUrl} loop />}
            <audio ref={sfxRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" />
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.div
                        key="envelope"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="relative cursor-pointer group"
                        onClick={handleOpen}
                    >
                        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg ${theme.text} font-bold text-sm whitespace-nowrap group-hover:block hidden animate-bounce`}>
                            Чамд ирсэн бэлэг бий! 🎁
                        </div>

                        <div className={`w-80 h-56 ${theme.bg} rounded-2xl relative shadow-2xl overflow-hidden`}>
                            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${theme.gradient}`} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <ThemeIcon className="w-16 h-16 text-white/50 fill-white/20 animate-pulse" />
                            </div>
                            <div className="absolute bottom-4 left-4 text-white/80 font-bold italic">
                                {data.partnerName}-д...
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="card"
                        initial={{ y: 100, opacity: 0, rotateX: 90 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="max-w-2xl w-full glass-card p-8 md:p-12 relative overflow-hidden shadow-2xl"
                    >
                        {/* Glossy Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none z-20" />

                        <div className="absolute top-4 right-4 flex gap-2 z-30">
                            {data.musicUrl && (
                                <button
                                    onClick={togglePlay}
                                    className={`w-10 h-10 ${theme.bg} bg-opacity-10 ${theme.text} rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors`}
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                            )}
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col items-center text-center relative z-10" style={{ transform: "translateZ(20px)" }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.3 }}
                                className={`w-40 h-40 rounded-full border-8 ${theme.border} overflow-hidden mb-6 shadow-2xl relative z-10`}
                            >
                                <Image
                                    src={data.photoUrl}
                                    alt="Love"
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                    priority
                                />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className={`text-sm ${theme.text} font-serif font-bold mb-2 uppercase tracking-[0.3em] opacity-80`}
                            >
                                Гэгээн Валентины баярын мэнд!
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: "spring" }}
                                className={`romantic-text text-5xl md:text-6xl ${theme.textDark} mb-8 drop-shadow-sm`}
                            >
                                {data.partnerName}
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className={`romantic-text text-2xl md:text-3xl ${theme.textDark} leading-relaxed mb-10 max-w-lg opacity-80`}
                            >
                                "{data.message}"
                            </motion.p>

                            <div className={`w-12 h-[1px] ${theme.border.replace('border-', 'bg-')} mb-4`} />
                            <div className={`${theme.text} font-bold`}>Таныг хайрласан:</div>
                            <div className={`romantic-text text-3xl ${theme.textDark}`}>{data.senderName}</div>

                            {data.memories && data.memories.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="w-full mb-10"
                                >
                                    <h3 className={`romantic-text text-4xl ${theme.textDark} mb-6`}>Бидний Дурсамж 📸</h3>
                                    <div className="w-full py-8">
                                        <Scrapbook memories={data.memories} />
                                    </div>
                                </motion.div>
                            )}

                            <ShareSection cardId={data.id} partnerName={data.partnerName} />
                        </div>
                    </motion.div >
                )}
            </AnimatePresence >
        </div >
    )
}

const ShareSection = ({ cardId, partnerName }: { cardId: string, partnerName: string }) => {
    const shareUrl = `${window.location.origin}/c/${cardId}`;
    const text = `Би ${partnerName}-д зориулж Валентины карт үүсгэлээ! ❤️`;

    const shareActions = [
        { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: 'bg-[#1877F2]' },
        { label: 'Messenger', url: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`, color: 'bg-[#0084FF]' },
        { label: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, color: 'bg-[#1DA1F2]' }
    ];

    return (
        <div className="mt-8 pt-8 border-t border-rose-100 w-full">
            <p className="text-xs text-rose-400 font-bold mb-4 uppercase tracking-widest">Бусдад гайхуулах уу? ✨</p>
            <div className="flex flex-wrap justify-center gap-3">
                {shareActions.map(action => (
                    <button
                        key={action.label}
                        onClick={() => window.open(action.url, '_blank')}
                        className={`px-4 py-2 ${action.color} text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-sm`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SharedCard
