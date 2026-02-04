import React from 'react';
import { ArrowLeft, ShieldAlert, Copy, Loader2, Check } from 'lucide-react';
import { PACKAGES } from './constants';

interface PaymentModalProps {
    selectedPackage: string | null;
    setSelectedPackage: (id: string | null) => void;
    profile: any;
    onNotifyPayment: (pkgId: string) => void;
    isSubmitting: boolean;
    onBack?: () => void;
}

const PaymentModal = ({ selectedPackage, setSelectedPackage, profile, onNotifyPayment, isSubmitting, onBack }: PaymentModalProps) => {

    // Copy helper
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} хуулагдлаа!`);
    };

    if (!selectedPackage) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20">
                <button onClick={onBack} className="p-3 bg-white hover:bg-rose-50 rounded-2xl text-rose-500 shadow-sm border border-rose-100 transition-all mb-8">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center mb-12">
                    <h2 className="romantic-text text-6xl text-rose-950 mb-4">Багцаа сонгоно уу</h2>
                    <p className="text-rose-400 font-medium">Хамгийн гоё дурсамжийг хамтдаа бүтээе ✨</p>
                </div>
                <div className="grid gap-6">
                    {PACKAGES.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`glass-card p-8 text-left border-2 transition-all hover:scale-[1.02] active:scale-95 relative group ${pkg.popular ? 'border-rose-300 ring-4 ring-rose-50' : 'border-white hover:border-rose-100'}`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 right-8 px-4 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    Маш эрэлттэй
                                </div>
                            )}
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-inner">
                                    {pkg.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-rose-950 mb-1">{pkg.name}</h3>
                                    <p className="text-rose-500/60 text-sm">{pkg.desc}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-rose-600 leading-none">{pkg.price}</div>
                                    <div className="text-[10px] text-rose-300 font-bold uppercase mt-1">Төлөх дүн</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentPkg = PACKAGES.find(p => p.id === selectedPackage);

    return (
        <div className="max-w-xl mx-auto px-4 py-20">
            <button onClick={() => setSelectedPackage(null)} className="flex items-center gap-2 text-rose-500 mb-8 hover:underline font-bold">
                <ArrowLeft className="w-4 h-4" /> Буцах
            </button>
            <div className="glass-card p-10 md:p-12 text-center border-2 border-rose-300 bg-white shadow-2xl shadow-rose-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>
                <h2 className="romantic-text text-5xl text-rose-900 mb-4">Төлбөр төлөх</h2>
                <p className="text-rose-700/70 mb-8 leading-relaxed">
                    Сонгосон багц: <strong className="text-rose-600 font-black">{currentPkg?.name} ({currentPkg?.price})</strong> <br />
                    Доорх зааврын дагуу шилжүүлэг хийнэ үү. ✨
                </p>

                <div className="bg-rose-50/50 backdrop-blur-sm p-8 rounded-[2rem] border-2 border-white mb-8 text-left space-y-5 shadow-inner">
                    <p className="text-[10px] text-rose-400 mb-1 font-black uppercase tracking-widest text-center">💳 БАНКНЫ МЭДЭЭЛЭЛ:</p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center group">
                            <span className="text-rose-400 text-xs font-bold uppercase">Данс:</span>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-rose-900 text-lg">5954613802</span>
                                <button onClick={() => copyToClipboard('5954613802', 'Дансны дугаар')} className="p-2 bg-white hover:bg-rose-100 text-rose-500 rounded-xl transition-all shadow-sm active:scale-90">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-white/80 w-full" />

                        <div className="flex justify-between items-center">
                            <span className="text-rose-400 text-xs font-bold uppercase">Хүлээн авагч:</span>
                            <span className="font-bold text-rose-900">NYMDORJ ENKHIINBILEG</span>
                        </div>

                        <div className="h-px bg-white/80 w-full" />

                        <div className="flex justify-between items-center group">
                            <span className="text-rose-400 text-xs font-bold uppercase">Төлөх дүн:</span>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-rose-600 text-2xl">{currentPkg?.price}</span>
                                <button onClick={() => copyToClipboard(currentPkg?.price.replace('₮', '').replace(',', '') || '', 'Дүн')} className="p-2 bg-white hover:bg-rose-100 text-rose-500 rounded-xl transition-all shadow-sm active:scale-90">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl text-white shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                            <p className="text-[10px] text-white/70 mb-1 font-black uppercase tracking-widest">ГҮЙЛГЭЭНИЙ УТГА (ID):</p>
                            <div className="flex items-center justify-between">
                                <code className="text-2xl font-mono font-black tracking-widest">{profile?.short_id || profile?.id || '...'}</code>
                                <button
                                    onClick={() => copyToClipboard(profile?.short_id || profile?.id || '', 'Гүйлгээний утга')}
                                    className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-md active:scale-90"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onNotifyPayment(selectedPackage)}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-rose-200 flex items-center justify-center gap-3"
                >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                    Төлбөр төлсөн, Мэдэгдэх
                </button>

                <p className="mt-6 text-xs text-rose-400 font-medium">Төлбөр мэдэгдсэний дараа админ 1-5 минутад баталгаажуулна. ✨</p>
            </div>
        </div>
    );
};

export default PaymentModal;
