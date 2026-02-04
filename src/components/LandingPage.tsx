import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Send, Gift, LogIn, User, LogOut, Copy, Check, ShieldCheck, Eye } from 'lucide-react'
import { signInWithGoogle, signOut, getProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const LandingPage = ({ onCreate, user, profile }: { onCreate: () => void, user: any, profile: any }) => {
    const [myCards, setMyCards] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            // Fetch user's cards
            const fetchCards = async () => {
                const { data: cards } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (cards) setMyCards(cards);
            }
            fetchCards();
        }
    }, [user]);

    const handleCopyId = () => {
        const idToCopy = profile?.short_id || user?.id;
        if (idToCopy) {
            navigator.clipboard.writeText(idToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-32 flex flex-col items-center text-center">
            {/* Top Auth Bar */}
            <div className="w-full flex justify-end mb-12">
                {user ? (
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-rose-100 shadow-sm">
                        <div className="flex items-center gap-2 text-rose-700 font-medium">
                            <User className="w-4 h-4" />
                            <span className="text-sm truncate max-w-[150px]">{user.email}</span>
                        </div>
                        {user.email === 'artmongolian1@gmail.com' && (
                            <a
                                href="/admin"
                                className="flex items-center gap-1 px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold hover:bg-rose-600 transition-colors shadow-sm"
                            >
                                <ShieldCheck className="w-3 h-3" />
                                Админ
                            </a>
                        )}
                        <button
                            onClick={async () => {
                                await signOut();
                                window.location.reload();
                            }}
                            className="text-rose-400 hover:text-rose-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={async () => {
                            try {
                                await signInWithGoogle();
                            } catch (e) {
                                console.error("LandingPage Login Error:", e);
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-full font-bold text-sm shadow-sm border border-rose-100 transition-all"
                    >
                        <LogIn className="w-4 h-4" />
                        Нэвтрэх
                    </button>
                )}
            </div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 mb-8"
            >
                <Heart className="w-12 h-12 text-white fill-current" />
            </motion.div>

            <motion.h1
                className="text-5xl md:text-8xl font-serif font-black text-rose-950 mb-8 leading-tight tracking-tight px-4 text-glow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Хайртай хүндээ <br />
                <span className="romantic-text text-8xl md:text-[10rem] text-transparent bg-clip-text bg-gradient-to-br from-rose-500 via-pink-600 to-rose-500 drop-shadow-sm animate-subtle-pulse">Гэнэтийн бэлэг</span> <br />
                бариарай
            </motion.h1>

            <motion.p
                className="text-lg md:text-xl text-rose-700/70 max-w-xl mb-12 leading-relaxed font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                Гэгээн Валентины баярт зориулж өөрийн хайрын түүхийг дижитал хуудас болгон хувиргаж,
                нандин нэгэндээ мартагдашгүй гэнэтийн бэлэг илгээгээрэй. ✨
            </motion.p>


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 w-full max-w-md px-4"
            >
                <button
                    onClick={onCreate}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <span>Одоо эхлэх</span>
                </button>
                <button
                    onClick={scrollToFeatures}
                    className="flex-1 px-8 py-5 bg-white text-rose-500 border-2 border-rose-100 rounded-[2rem] font-bold text-lg transition-all hover:bg-rose-50 active:scale-95 flex items-center justify-center gap-3 shadow-sm"
                >
                    <Gift className="w-6 h-6" />
                    <span>Загвар үзэх</span>
                </button>
            </motion.div>

            {/* My Cards History */}
            {myCards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="w-full max-w-4xl mt-24"
                >
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <Heart className="w-5 h-5 text-rose-500 fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold text-rose-950">Миний бүтээлүүд</h2>
                        <span className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-xs font-bold">{myCards.length}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
                        {myCards.map((card: any) => (
                            <div key={card.id} className="group bg-white p-4 rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl hover:shadow-rose-100/50 transition-all flex flex-col items-start text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/c/${card.id}`);
                                            alert("Линк хуулагдлаа! 📋");
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-rose-500 rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
                                        title="Линк хуулах"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-lg">
                                        {card.theme === 'midnight' ? '✨' : card.theme === 'vintage' ? '📜' : card.theme === 'cyber' ? '⚡' : card.theme === 'diamond' ? '💎' : '❤️'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-rose-900 line-clamp-1">{card.partner_name}</h3>
                                        <p className="text-xs text-rose-500/60">{new Date(card.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-rose-700/70 mb-4 line-clamp-2 w-full bg-rose-50/50 p-3 rounded-xl italic">
                                    "{card.message}"
                                </p>

                                <a
                                    href={`/c/${card.id}`}
                                    target="_blank"
                                    className="w-full py-3 bg-white border-2 border-rose-50 text-rose-500 hover:border-rose-200 hover:bg-rose-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95"
                                >
                                    <Eye className="w-4 h-4" /> Нээж үзэх
                                </a>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Template Showcase */}
            <section id="features" className="w-full mt-32 space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="romantic-text text-6xl text-rose-950">Загваруудын үзүүлэнгүүд</h2>
                    <p className="text-rose-400 font-bold uppercase tracking-[0.3em] text-[10px]">Choose your perfect vibe</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <TemplatePreviewCard
                        image="/templates/classic.png"
                        title="Classic Romantic"
                        tag="Standard"
                        desc="Уламжлалт улаан, ягаан өнгө болон зүрхэн анимациуд"
                        delay={0.6}
                    />
                    <TemplatePreviewCard
                        image="/templates/midnight.png"
                        title="Starry Night"
                        tag="Unlimited"
                        desc="Шөнийн тэнгэр, одод болон нууцлаг гоёмсог эффектүүд"
                        delay={0.8}
                    />
                    <TemplatePreviewCard
                        image="/templates/diamond.png"
                        title="Diamond VIP"
                        tag="VIP"
                        desc="Кристал эффект, тансаг загвар болон тусгай анимаци"
                        isPremium
                        delay={1.0}
                    />
                </div>
            </section>

            {/* Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
                <FeatureCard
                    icon={<Heart className="w-6 h-6 text-rose-500" />}
                    title="Хувийн мессеж"
                    desc="Өөрийн чин сэтгэлийн үгээ хамгийн гоё загвараар илэрхийл"
                    delay={0.8}
                />
                <SendFeatureCard delay={1.0} />
                <FeatureCard
                    icon={<Sparkles className="w-6 h-6 text-rose-500" />}
                    title="Тусгай эффект"
                    desc="Зүрхэн анимаци, хөгжим болон гэнэтийн бэлгүүд"
                    delay={1.2}
                />
            </div>
        </div>
    )
}

const SendFeatureCard = ({ delay }: { delay: number }) => (
    <motion.div
        className="glass-card p-8 flex flex-col items-center text-center hover:bg-white/30 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Send className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-rose-900 mb-2">Шууд илгээх</h3>
        <p className="text-rose-700/70">Ганц холбоос хуулж аваад Messenger эсвэл WhatsApp-аар явуул</p>
    </motion.div>
)

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
    <motion.div
        className="glass-card p-8 flex flex-col items-center text-center hover:bg-white/30 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-rose-900 mb-2">{title}</h3>
        <p className="text-rose-700/70">{desc}</p>
    </motion.div>
)

const TemplatePreviewCard = ({ image, title, tag, desc, delay, isPremium }: { image: string, title: string, tag: string, desc: string, delay: number, isPremium?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className={`group relative bg-white rounded-[2.5rem] p-4 border border-rose-100 shadow-xl shadow-rose-100/50 hover:scale-[1.02] transition-all overflow-hidden ${isPremium ? 'ring-2 ring-indigo-500/20' : ''}`}
    >
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isPremium ? 'text-indigo-600' : 'text-rose-500'}`}>{tag}</span>
            </div>
            {isPremium && (
                <div className="absolute top-4 left-4 bg-indigo-500 text-white p-2 rounded-xl shadow-lg">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
            )}
        </div>
        <div className="px-2 pb-2">
            <h3 className="text-xl font-black text-rose-950 mb-2">{title}</h3>
            <p className="text-sm text-rose-700/60 leading-relaxed">{desc}</p>
        </div>
    </motion.div>
)

export default LandingPage
