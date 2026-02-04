"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, UserX, Loader2, ShieldCheck, Mail, Calendar, Hash, Sparkles, Check, Lock, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
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
        // Fetch pending users first
        const { data: pending } = await supabase
            .from('profiles')
            .select('*')
            .eq('payment_status', 'pending')
            .order('payment_requested_at', { ascending: true });

        if (pending) setPendingUsers(pending);

        // Fetch recent users
        const { data: recent } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (recent) setRecentUsers(recent);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return;

        setLoading(true);
        setError('');
        setUserProfile(null);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`id.eq.${searchId},short_id.eq.${searchId}`)
                .single();

            if (error) throw new Error('Хэрэглэгч олдсонгүй');
            setUserProfile(data);

            // Fetch user cards for analytics
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
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-rose-100">
                    <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-rose-900 mb-2">Хандах эрхгүй</h1>
                    <p className="text-rose-700/70 mb-6">Та зөвхөн админ эрхтэйгээр энэ хуудсанд нэвтрэх боломжтой.</p>
                    <a href="/" className="inline-block px-8 py-3 bg-rose-500 text-white rounded-full font-bold shadow-lg shadow-rose-200">Нүүр хуудас</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rose-50/30 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-xl shadow-rose-200 text-white">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="romantic-text text-5xl text-rose-950">Админ Хяналт</h1>
                        <p className="text-rose-400 font-bold uppercase tracking-widest text-[10px] mt-1">Payment & User Management</p>
                    </div>
                </div>

                {/* Showcase Management Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-rose-100 border border-white mb-12">
                    <h2 className="text-2xl font-black text-rose-950 mb-8 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-rose-500" />
                        Үзүүлэн удирдах
                    </h2>

                    <form onSubmit={handleAddShowcase} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Гарчиг (Classic Romantic...)"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                required
                                className="w-full px-5 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200"
                            />
                            <input
                                type="text"
                                placeholder="Таг (Standard / VIP / Unlimited)"
                                value={newItem.tag}
                                onChange={e => setNewItem({ ...newItem, tag: e.target.value })}
                                className="w-full px-5 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200"
                            />
                            <textarea
                                placeholder="Тайлбар..."
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                className="w-full px-5 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200 min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Зургийн линк (/templates/classic.png...)"
                                value={newItem.image_url}
                                onChange={e => setNewItem({ ...newItem, image_url: e.target.value })}
                                required
                                className="w-full px-5 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-200"
                            />
                            <label className="flex items-center gap-3 px-5 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newItem.is_premium}
                                    onChange={e => setNewItem({ ...newItem, is_premium: e.target.checked })}
                                    className="w-5 h-5 accent-rose-500"
                                />
                                <span className="text-rose-900 font-bold">VIP загвар</span>
                            </label>
                            <button
                                type="submit"
                                disabled={showcaseLoading}
                                className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {showcaseLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Нэмэх</>}
                            </button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {showcaseItems.map((item) => (
                            <div key={item.id} className="relative group overflow-hidden bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl transition-all">
                                <img src={item.image_url} alt={item.title} className="w-full aspect-[4/5] object-cover" />
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-black text-rose-950 truncate">{item.title}</h3>
                                        <span className="text-[10px] bg-rose-100 text-rose-500 px-2 py-1 rounded-full font-bold">{item.tag}</span>
                                    </div>
                                    <p className="text-xs text-rose-400 line-clamp-2">{item.description}</p>
                                    <button
                                        onClick={() => handleDeleteShowcase(item.id)}
                                        className="mt-4 w-full py-2 bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold"
                                    >
                                        <UserX className="w-4 h-4" /> Устгах
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Payments Section */}
                {pendingUsers.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-black text-rose-900 mb-6 flex items-center gap-3">
                            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                            Баталгаажуулах төлбөрүүд ({pendingUsers.length})
                        </h2>
                        <div className="grid gap-4">
                            {pendingUsers.map((user) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={user.id}
                                    className="bg-white p-6 rounded-[2rem] border-2 border-rose-100 shadow-xl shadow-rose-50 flex flex-col md:flex-row items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                            {user.package_type === 'diamond' ? '💎' : user.package_type === 'infinite' ? '🚀' : '💝'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-rose-950 text-lg">{user.email?.split('@')[0]}</h3>
                                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.package_type === 'diamond' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {user.package_type}
                                                </span>
                                            </div>
                                            <p className="text-rose-400 font-mono font-bold text-sm tracking-widest">ID: {user.short_id}</p>
                                            <p className="text-[10px] text-rose-300 mt-1">Requested at: {new Date(user.payment_requested_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => confirmPayment(user)}
                                            className="flex-1 md:flex-none px-8 py-3 bg-green-500 text-white rounded-xl font-black text-sm shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Баталгаажуулах
                                        </button>
                                        <button
                                            onClick={() => togglePaidStatus(user.id, false)}
                                            className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
                                        >
                                            <UserX className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-rose-100 border border-white mb-12">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-rose-300" />
                            <input
                                type="text"
                                placeholder="ID эсвэл Email хайх..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="w-full pl-14 pr-4 py-5 bg-rose-50/50 border border-rose-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-200 outline-none transition-all text-rose-900 font-bold placeholder:text-rose-300 shadow-inner"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-[1.5rem] font-black text-lg shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Хайх'}
                        </button>
                    </form>

                    {error && <p className="text-rose-500 text-sm font-bold flex items-center gap-2 px-2"><UserX className="w-4 h-4" /> {error}</p>}

                    {userProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-50/30 rounded-[2rem] p-8 border-2 border-rose-100 mt-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <UserCheck className="w-8 h-8 text-rose-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-rose-950 uppercase tracking-tight">{userProfile.email?.split('@')[0]}</h3>
                                            <p className="text-rose-400 font-medium">{userProfile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-1.5 bg-white border border-rose-100 rounded-xl text-rose-600 font-mono font-black tracking-widest text-lg">
                                            ID: {userProfile.short_id}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${userProfile.is_paid ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {userProfile.is_paid ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                            {userProfile.is_paid ? 'ACTIVE' : 'LOCKED'}
                                        </span>
                                        {userProfile.package_type && userProfile.package_type !== 'none' && (
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">
                                                PKG: {userProfile.package_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePaidStatus(userProfile.id, userProfile.is_paid)}
                                    disabled={loading}
                                    className={`px-10 py-5 rounded-[1.5rem] font-black shadow-xl transition-all transform hover:scale-105 active:scale-95 ${userProfile.is_paid
                                        ? 'bg-white text-rose-500 border-2 border-rose-100'
                                        : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-200'
                                        }`}
                                >
                                    {userProfile.is_paid ? 'Эрхийг Хаах' : 'Эрхийг Нээх'}
                                </button>
                            </div>

                            {userCards.length > 0 && (
                                <div className="mt-10 pt-10 border-t-2 border-white/50">
                                    <h4 className="text-lg font-black text-rose-950 mb-6 flex items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-rose-500 animate-pulse" /> Үүсгэсэн картууд ({userCards.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {userCards.map(card => (
                                            <div key={card.id} className="p-5 bg-white rounded-2xl border border-rose-50 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                                                <div className="min-w-0">
                                                    <p className="font-black text-rose-900 truncate group-hover:text-rose-500 transition-colors uppercase text-sm tracking-tight">{card.partner_name}-д</p>
                                                    <p className="text-[10px] text-rose-300 font-mono mt-1">Short ID: {card.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-rose-600">{card.view_count || 0}</div>
                                                    <div className="text-[10px] text-rose-300 font-bold uppercase">Views</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Recent Users Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-rose-950 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-rose-500" />
                        Сүүлийн бүртгэлүүд
                    </h2>
                    <div className="grid gap-4">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all border-b-4 border-b-rose-100/30">
                                <div className="flex items-center gap-5 flex-1 w-full sm:w-auto">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${user.is_paid ? 'bg-green-50 text-green-500' : 'bg-rose-50 text-rose-500'}`}>
                                        <UserCheck className="w-7 h-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-rose-950 truncate text-lg uppercase tracking-tight">{user.email?.split('@')[0]}</p>
                                            {user.is_paid && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-lg font-black">{user.package_type}</span>}
                                        </div>
                                        <p className="text-sm text-rose-400 font-mono font-bold tracking-widest">{user.short_id || '...'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="hidden md:block text-right">
                                        <p className="text-[10px] text-rose-300 font-bold uppercase">Created At</p>
                                        <p className="text-xs font-bold text-rose-900">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => togglePaidStatus(user.id, user.is_paid)}
                                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${user.is_paid
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                                            : 'bg-white text-rose-500 border-2 border-rose-100 shadow-sm'
                                            }`}
                                    >
                                        {user.is_paid ? 'Active' : 'Locked'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
