"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserCheck, UserX, Loader2, ShieldCheck,
    Mail, Calendar, Hash, Sparkles, Check, Lock,
    Copy, LayoutDashboard, CreditCard, Image as ImageIcon,
    Users, TrendingUp, ChevronRight, LogOut, ArrowLeft, Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userCards, setUserCards] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Showcase management state
    const [showcaseItems, setShowcaseItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ title: '', tag: '', description: '', image_url: '', is_premium: false });
    const [showcaseLoading, setShowcaseLoading] = useState(false);

    useEffect(() => {
        checkAdmin();
        fetchRecentUsers();
        fetchShowcaseItems();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role === 'admin') {
                setIsAdmin(true);
            }
        }
        setCheckingAuth(false);
    };

    const fetchRecentUsers = async () => {
        const { data: pending } = await supabase
            .from('profiles')
            .select('*')
            .eq('payment_status', 'pending')
            .order('payment_requested_at', { ascending: true });

        if (pending) setPendingUsers(pending);

        const { data: recent } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (recent) setRecentUsers(recent);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchId.trim();
        if (!term) return;

        setLoading(true);
        setError('');
        setUserProfile(null);

        try {
            // Determine if it looks like a UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term);

            let query = supabase.from('profiles').select('*');

            if (isUuid) {
                query = query.or(`id.eq.${term},short_id.eq.${term},email.ilike.%${term}%`);
            } else {
                query = query.or(`short_id.eq.${term},email.ilike.%${term}%`);
            }

            const { data, error } = await query.single();

            if (error || !data) throw new Error('Хэрэглэгч олдсонгүй');
            setUserProfile(data);

            const { data: cards } = await supabase
                .from('cards')
                .select('id, partner_name, view_count, created_at')
                .eq('user_id', data.id)
                .order('created_at', { ascending: false });

            setUserCards(cards || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = async (u: any) => {
        setActiveTab('users');
        setSearchId(u.short_id || u.email);
        setLoading(true);
        try {
            setUserProfile(u);
            const { data: cards } = await supabase
                .from('cards')
                .select('id, partner_name, view_count, created_at')
                .eq('user_id', u.id)
                .order('created_at', { ascending: false });
            setUserCards(cards || []);
        } finally {
            setLoading(false);
        }
    };

    const togglePaidStatus = async (id: string, currentStatus: boolean) => {
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                is_paid: !currentStatus,
                payment_status: !currentStatus ? 'paid' : 'none'
            })
            .eq('id', id);

        if (!error) {
            if (userProfile && userProfile.id === id) {
                setUserProfile({ ...userProfile, is_paid: !currentStatus, payment_status: !currentStatus ? 'paid' : 'none' });
            }
            fetchRecentUsers();
        }
        setLoading(false);
    };

    const grantVipStatus = async (id: string) => {
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                is_paid: true,
                payment_status: 'paid',
                package_type: 'diamond'
            })
            .eq('id', id);

        if (!error) {
            if (userProfile && userProfile.id === id) {
                setUserProfile({ ...userProfile, is_paid: true, payment_status: 'paid', package_type: 'diamond' });
            }
            fetchRecentUsers();
        }
        setLoading(false);
    };

    const confirmPayment = async (uProfile: any) => {
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                is_paid: true,
                payment_status: 'paid'
            })
            .eq('id', uProfile.id);

        if (!error) {
            fetchRecentUsers();
            if (userProfile && userProfile.id === uProfile.id) {
                setUserProfile({ ...userProfile, is_paid: true, payment_status: 'paid' });
            }
        }
        setLoading(false);
    };

    const fetchShowcaseItems = async () => {
        const { data } = await supabase
            .from('showcase_items')
            .select('*')
            .order('display_order', { ascending: true });
        if (data) setShowcaseItems(data);
    };

    const handleAddShowcase = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowcaseLoading(true);
        const { error } = await supabase
            .from('showcase_items')
            .insert([newItem]);

        if (!error) {
            setNewItem({ title: '', tag: '', description: '', image_url: '', is_premium: false });
            fetchShowcaseItems();
        }
        setShowcaseLoading(false);
    };

    const handleDeleteShowcase = async (id: string) => {
        const { error } = await supabase
            .from('showcase_items')
            .delete()
            .eq('id', id);
        if (!error) fetchShowcaseItems();
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto" />
                    <p className="text-rose-400 font-bold tracking-tighter">АДМИН ХУУДАС УНШИЖ БАЙНА...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-rose-100"
                >
                    <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-black text-rose-950 mb-4">Хандах эрхгүй</h1>
                    <p className="text-rose-700/60 mb-8 font-medium">Уучлаарай, энэ хуудсанд зөвхөн систем хариуцагч нэвтрэх боломжтой.</p>
                    <a href="/" className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all">
                        <ArrowLeft className="w-5 h-5" /> Нүүр хуудас руу буцах
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#FFF4F6]">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-rose-100 flex flex-col p-6 fixed h-full z-20 overflow-y-auto">
                <div className="flex items-center justify-between mb-12 px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg shadow-rose-200 text-white">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-rose-950 tracking-tighter">VALENTINE</h2>
                            <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest leading-none">Admin Dashboard</span>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-2 hover:bg-rose-50 rounded-xl text-rose-400 transition-colors"
                        title="Нүүр хуудас руу буцах"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        icon={<Home className="w-5 h-5" />}
                        label="Буцах (Нүүр)"
                        active={false}
                        onClick={() => window.location.href = '/'}
                    />
                    <div className="py-2">
                        <div className="h-px bg-rose-100/50 w-full" />
                    </div>
                    <SidebarItem
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard Overview"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem
                        icon={<CreditCard className="w-5 h-5" />}
                        label="Pending Payments"
                        count={pendingUsers.length}
                        active={activeTab === 'payments'}
                        onClick={() => setActiveTab('payments')}
                    />
                    <SidebarItem
                        icon={<Users className="w-5 h-5" />}
                        label="User Management"
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarItem
                        icon={<ImageIcon className="w-5 h-5" />}
                        label="Showcase Editor"
                        active={activeTab === 'showcase'}
                        onClick={() => setActiveTab('showcase')}
                    />
                </nav>

                <div className="mt-auto pt-8 border-t border-rose-50 px-2 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-rose-950 truncate uppercase tracking-tighter">Art Mongolia</p>
                            <p className="text-[10px] text-rose-400 font-bold truncate">System Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex items-center gap-2 text-rose-400 hover:text-rose-600 font-bold text-xs transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Гэр лүүгээ харих
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 p-8 md:p-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <header className="flex items-end justify-between">
                                <div>
                                    <h1 className="romantic-text text-6xl text-rose-950 mb-2">Хянах самбар</h1>
                                    <p className="text-rose-400 font-bold uppercase tracking-[0.3em] text-[10px]">Overview & Statistics</p>
                                </div>
                                <div className="hidden md:flex items-center gap-4 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white shadow-sm">
                                    <div className="text-right">
                                        <p className="text-[10px] text-rose-300 font-black uppercase">Өнөөдөр</p>
                                        <p className="text-sm font-bold text-rose-900">{new Date().toLocaleDateString()}</p>
                                    </div>
                                    <Calendar className="w-5 h-5 text-rose-500" />
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <StatCard icon={<Users className="w-6 h-6" />} label="Нийт хэрэглэгч" value={recentUsers.length} trend="+12%" />
                                <StatCard icon={<CreditCard className="w-6 h-6" />} label="Хүлээгдэж буй" value={pendingUsers.length} color="bg-orange-500" />
                                <StatCard icon={<ImageIcon className="w-6 h-6" />} label="Нийт загвар" value={showcaseItems.length} color="bg-indigo-500" />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <RecentUsersSection users={recentUsers} togglePaidStatus={togglePaidStatus} grantVipStatus={grantVipStatus} onSelectUser={handleSelectUser} />
                                <PendingPaymentsSection users={pendingUsers} confirmPayment={confirmPayment} onManage={() => setActiveTab('payments')} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'payments' && (
                        <motion.div
                            key="payments"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <h1 className="romantic-text text-6xl text-rose-950">Төлбөрүүд</h1>
                            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-rose-100">
                                {pendingUsers.length > 0 ? (
                                    <div className="grid gap-6">
                                        {pendingUsers.map(user => (
                                            <PaymentRow key={user.id} user={user} confirmPayment={confirmPayment} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Check className="w-10 h-10 text-rose-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-rose-950 uppercase tracking-tighter">Шинэ төлбөр байхгүй</h3>
                                        <p className="text-rose-400 font-medium">Одоогоор хүлээгдэж буй төлбөр байхгүй байна.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <h1 className="romantic-text text-6xl text-rose-950">Хэрэглэгчид</h1>

                            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-rose-100">
                                <form onSubmit={handleSearch} className="flex gap-4 mb-10">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-rose-300" />
                                        <input
                                            type="text"
                                            placeholder="ID, Email эсвэл Short ID хайх..."
                                            value={searchId}
                                            onChange={(e) => setSearchId(e.target.value)}
                                            className="w-full pl-16 pr-6 py-5 bg-[#FDF1F3] border border-rose-100 rounded-3xl focus:ring-4 focus:ring-rose-200 outline-none transition-all text-rose-900 font-bold placeholder:text-rose-300"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Хайх'}
                                    </button>
                                </form>

                                {error && <p className="text-rose-500 font-bold mb-6 px-4 bg-rose-50 py-3 rounded-2xl border border-rose-100 text-sm">⚠️ {error}</p>}

                                {userProfile ? (
                                    <UserProfileDetails userProfile={userProfile} userCards={userCards} togglePaidStatus={togglePaidStatus} grantVipStatus={grantVipStatus} loading={loading} />
                                ) : (
                                    <div className="grid gap-4">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <h3 className="text-lg font-black text-rose-950 uppercase tracking-tighter">Сүүлийн хэрэглэгчид</h3>
                                            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Нийт {recentUsers.length}</p>
                                        </div>
                                        {recentUsers.map(user => (
                                            <UserRow
                                                key={user.id}
                                                user={user}
                                                togglePaidStatus={togglePaidStatus}
                                                grantVipStatus={grantVipStatus}
                                                onSelect={handleSelectUser}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'showcase' && (
                        <motion.div
                            key="showcase"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <h1 className="romantic-text text-6xl text-rose-950">Загвар удирдах</h1>

                            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-rose-100">
                                <ShowcaseForm newItem={newItem} setNewItem={setNewItem} onAdd={handleAddShowcase} loading={showcaseLoading} />

                                <div className="mt-12">
                                    <h3 className="text-xl font-black text-rose-950 mb-8 flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-rose-500" /> Нүүр хуудсан дээрх жагсаалт
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {showcaseItems.map(item => (
                                            <ShowcaseCard key={item.id} item={item} onDelete={handleDeleteShowcase} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// Sub-components

function SidebarItem({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count?: number, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${active
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-200'
                : 'text-rose-800 hover:bg-rose-50'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className={`${active ? 'text-white' : 'text-rose-400 group-hover:text-rose-600'} transition-colors`}>{icon}</span>
                <span className={`text-sm font-bold uppercase tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
            </div>
            {count !== undefined && count > 0 && (
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-white/20 text-white border border-white/20' : 'bg-rose-100 text-rose-500'
                    }`}>
                    {count}
                </span>
            )}
            {active && <ChevronRight className="w-4 h-4 text-white/50" />}
        </button>
    );
}

function StatCard({ icon, label, value, trend, color = "bg-rose-500" }: { icon: React.ReactNode, label: string, value: string | number, trend?: string, color?: string }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-rose-100 shadow-xl shadow-rose-100/30 group hover:scale-[1.02] transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${color} text-white rounded-[1.25rem] flex items-center justify-center shadow-lg`}>
                    {icon}
                </div>
                {trend && <span className="text-green-500 text-xs font-black">{trend}</span>}
            </div>
            <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-4xl font-black text-rose-950 tracking-tighter">{value}</h3>
        </div>
    );
}

function RecentUsersSection({ users, togglePaidStatus, grantVipStatus, onSelectUser }: { users: any[], togglePaidStatus: (id: string, s: boolean) => void, grantVipStatus: (id: string) => void, onSelectUser: (u: any) => void }) {
    return (
        <div className="bg-white p-8 rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-100/20">
            <h3 className="text-xl font-black text-rose-950 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <Users className="w-6 h-6 text-rose-500" /> Сүүлийн хэрэглэгчид
            </h3>
            <div className="space-y-4">
                {users.map(user => (
                    <UserRow
                        key={user.id}
                        user={user}
                        togglePaidStatus={togglePaidStatus}
                        grantVipStatus={grantVipStatus}
                        onSelect={onSelectUser}
                    />
                ))}
            </div>
        </div>
    );
}

function PendingPaymentsSection({ users, confirmPayment, onManage }: { users: any[], confirmPayment: (u: any) => void, onManage: () => void }) {
    return (
        <div className="bg-rose-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-rose-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <CreditCard className="w-40 h-40" />
            </div>
            <h3 className="text-xl font-black mb-2 flex items-center gap-3 uppercase tracking-tighter">
                <CreditCard className="w-6 h-6 text-rose-300" /> Хүлээгдэж буй
            </h3>
            <p className="text-rose-300/80 text-sm font-medium mb-8">Таны баталгаажуулалтыг хүлээж буй {users.length} төлбөр байна.</p>
            <div className="space-y-4">
                {users.slice(0, 3).map(user => (
                    <div key={user.id} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="font-bold truncate text-sm">{user.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-rose-200 uppercase tracking-widest font-black">{user.package_type}</p>
                        </div>
                        <button onClick={() => confirmPayment(user)} className="px-4 py-2 bg-white text-rose-900 rounded-xl text-xs font-black shadow-lg">Нээх</button>
                    </div>
                ))}
            </div>
            <button onClick={onManage} className="w-full mt-8 py-4 bg-white/5 border border-white/20 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                Бүгдийг удирдах <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

function UserRow({ user, togglePaidStatus, grantVipStatus, onSelect }: { user: any, togglePaidStatus: (id: string, s: boolean) => void, grantVipStatus: (id: string) => void, onSelect: (u: any) => void }) {
    return (
        <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100 hover:border-rose-300 transition-all group">
            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onSelect(user)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${user.is_paid ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-400'}`}>
                    {user.is_paid ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-rose-950 uppercase tracking-tight truncate group-hover:text-rose-600 transition-colors">{user.email?.split('@')[0]}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-rose-100 font-black text-rose-600 font-mono tracking-widest leading-none">ID: {user.short_id || 'N/A'}</span>
                        {user.package_type && user.package_type !== 'none' && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">{user.package_type}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onSelect(user)}
                    className="hidden md:flex px-3 py-1.5 bg-white text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                    Дэлгэрэнгүй
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); grantVipStatus(user.id); }}
                    title="Grant Diamond VIP"
                    disabled={user.package_type === 'diamond'}
                    className={`p-2 rounded-xl transition-all ${user.package_type === 'diamond' ? 'text-indigo-500 bg-indigo-50' : 'text-rose-400 hover:bg-rose-100 hover:scale-110'}`}
                >
                    <Sparkles className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); togglePaidStatus(user.id, user.is_paid); }}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.is_paid ? 'bg-green-500 text-white shadow-md hover:bg-green-600' : 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50'}`}
                >
                    {user.is_paid ? 'Active' : 'Locked'}
                </button>
            </div>
        </div>
    );
}

function PaymentRow({ user, confirmPayment }: { user: any, confirmPayment: (u: any) => void }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-[#FDF1F3] rounded-[2.5rem] border border-rose-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-rose-50">{user.package_type === 'diamond' ? '💎' : '💝'}</div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h3 className="font-black text-rose-950 text-xl tracking-tight uppercase">{user.email?.split('@')[0]}</h3>
                    <span className="bg-rose-200 text-rose-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">{user.package_type}</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                    <span className="bg-white px-3 py-1 rounded-lg border border-rose-100 text-rose-600 font-black font-mono tracking-widest text-xs">ID: {user.short_id}</span>
                </div>
            </div>
            <button onClick={() => confirmPayment(user)} className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black shadow-xl">ШУУД НЭЭХ</button>
        </div>
    );
}

function ShowcaseForm({ newItem, setNewItem, onAdd, loading }: { newItem: any, setNewItem: any, onAdd: (e: React.FormEvent) => void, loading: boolean }) {
    return (
        <div className="p-8 bg-[#FDF1F3] rounded-[2.5rem] border border-rose-100">
            <h3 className="text-xl font-black text-rose-950 mb-8 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-rose-500" /> Шинэ загвар нэмэх
            </h3>
            <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <InputField placeholder="Гарчиг" value={newItem.title} onChange={v => setNewItem({ ...newItem, title: v })} required />
                    <InputField placeholder="Таг" value={newItem.tag} onChange={v => setNewItem({ ...newItem, tag: v })} />
                    <textarea placeholder="Тайлбар..." value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-6 py-4 bg-white border border-rose-100 rounded-2xl min-h-[120px] font-bold" />
                </div>
                <div className="space-y-4 flex flex-col">
                    <InputField placeholder="Зургийн линк" value={newItem.image_url} onChange={v => setNewItem({ ...newItem, image_url: v })} required />
                    <label className="flex items-center gap-4 px-6 py-5 bg-white border border-rose-100 rounded-2xl cursor-pointer">
                        <input type="checkbox" checked={newItem.is_premium} onChange={e => setNewItem({ ...newItem, is_premium: e.target.checked })} className="w-6 h-6 accent-rose-500" />
                        <span className="text-rose-950 font-black text-sm uppercase tracking-tight">VIP ЗАГВАР</span>
                    </label>
                    <button type="submit" disabled={loading} className="mt-auto w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-3xl font-black text-xl shadow-xl">{loading ? <Loader2 className="animate-spin" /> : 'ЖАГСААЛТАД НЭМЭХ'}</button>
                </div>
            </form>
        </div>
    );
}

function InputField({ placeholder, value, onChange, required = false }: { placeholder: string, value: string, onChange: (v: string) => void, required?: boolean }) {
    return (
        <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full px-6 py-5 bg-white border border-rose-100 rounded-2xl font-bold" />
    );
}

function ShowcaseCard({ item, onDelete }: { item: any, onDelete: (id: string) => void }) {
    return (
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2.5rem] overflow-hidden border border-rose-100 shadow-xl relative group">
            <div className="aspect-[4/5] relative overflow-hidden">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {item.is_premium && <span className="p-2 bg-indigo-500 text-white rounded-xl"><Sparkles className="w-4 h-4" /></span>}
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase text-rose-500 tracking-widest">{item.tag}</span>
                </div>
            </div>
            <div className="p-6">
                <h3 className="font-black text-rose-950 text-lg mb-1 truncate tracking-tight">{item.title}</h3>
                <p className="text-xs text-rose-400 font-medium line-clamp-2 h-8 mb-4">{item.description}</p>
                <button onClick={() => onDelete(item.id)} className="w-full py-3 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[10px]">Устгах</button>
            </div>
        </motion.div>
    );
}

function UserProfileDetails({ userProfile, userCards, togglePaidStatus, grantVipStatus, loading }: { userProfile: any, userCards: any[], togglePaidStatus: (id: string, s: boolean) => void, grantVipStatus: (id: string) => void, loading: boolean }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-[#FDF1F3] rounded-[2.5rem] border border-rose-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm"><UserCheck className="w-10 h-10 text-rose-500" /></div>
                    <div>
                        <h3 className="text-3xl font-black text-rose-950 uppercase tracking-tighter">{userProfile.email?.split('@')[0]}</h3>
                        <p className="text-rose-400 font-bold font-mono tracking-widest text-sm uppercase">{userProfile.short_id}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() => grantVipStatus(userProfile.id)}
                        disabled={loading || userProfile.package_type === 'diamond'}
                        className={`px-8 py-5 rounded-[1.5rem] font-black shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${userProfile.package_type === 'diamond'
                            ? 'bg-indigo-500 text-white cursor-default'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-200'
                            }`}
                    >
                        <Sparkles className="w-5 h-5" />
                        {userProfile.package_type === 'diamond' ? 'DIAMOND VIP' : 'GRANT DIAMOND'}
                    </button>
                    <button
                        onClick={() => togglePaidStatus(userProfile.id, userProfile.is_paid)}
                        disabled={loading}
                        className={`px-10 py-5 rounded-[1.5rem] font-black shadow-xl transform hover:scale-105 active:scale-95 transition-all ${userProfile.is_paid ? 'bg-white text-rose-500 border border-rose-100' : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
                            }`}
                    >
                        {userProfile.is_paid ? 'ЭРХИЙГ ХААХ' : 'ЭРХИЙГ НЭЭХ'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailBox label="И-Мэйл" value={userProfile.email} icon={<Mail className="w-4 h-4 text-rose-300" />} />
                <DetailBox label="Бүртгүүлсэн" value={new Date(userProfile.created_at).toLocaleDateString()} icon={<Calendar className="w-4 h-4 text-rose-300" />} />
            </div>
            {userCards.length > 0 && (
                <div className="mt-10 pt-10 border-t border-rose-200/30">
                    <h4 className="text-sm font-black text-rose-950 mb-6 uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles className="w-4 h-4 text-rose-500" /> Үүсгэсэн картууд</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userCards.map(card => (
                            <div key={card.id} className="p-5 bg-white rounded-3xl border border-rose-50 flex items-center justify-between shadow-sm">
                                <p className="font-black text-rose-900 uppercase text-xs tracking-tight">{card.partner_name}-д</p>
                                <div className="text-right"><span className="text-xl font-black text-rose-600 leading-none">{card.view_count || 0}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function DetailBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white/60 p-5 rounded-[2rem] border border-white flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner">{icon}</div>
            <div>
                <p className="text-[10px] text-rose-300 font-black uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-rose-800">{value}</p>
            </div>
        </div>
    );
}
