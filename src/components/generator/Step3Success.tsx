import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface Step3Props {
    generatedLink: string;
}

const Step3Success = ({ generatedLink }: Step3Props) => {
    return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-rose-900 mb-2">Амжилттай бүтлээ!</h2>
            <p className="text-rose-700/70 mb-8">Одоо энэ холбоосыг хайртай хүн рүүгээ илгээгээрэй.</p>

            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="p-4 bg-white rounded-2xl shadow-md border border-rose-100">
                    <QRCodeSVG value={generatedLink} size={150} />
                </div>
                <p className="text-xs text-rose-400">Утсаар нь уншуулж болно 📸</p>
            </div>

            <div className="bg-white/50 p-4 rounded-xl border border-rose-100 mb-6 flex items-center gap-2">
                <input
                    readOnly
                    value={generatedLink}
                    className="bg-transparent text-rose-600 font-medium flex-1 outline-none truncate"
                />
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        alert('Холбоос хуулагдлаа!');
                    }}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold flex-shrink-0"
                >
                    Хуулах
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}`, '_blank')}
                        className="flex-1 py-3 bg-[#1877F2] text-white rounded-xl text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                    >
                        Facebook Share
                    </button>
                    <button
                        onClick={() => window.open(`fb-messenger://share/?link=${encodeURIComponent(generatedLink)}`, '_blank')}
                        className="flex-1 py-3 bg-[#0084FF] text-white rounded-xl text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                    >
                        Messenger
                    </button>
                    <button
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Чамд зориулсан гэнэтийн бэлэг! ' + generatedLink)}`, '_blank')}
                        className="flex-1 py-3 bg-[#25D366] text-white rounded-xl text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                    >
                        WhatsApp
                    </button>
                </div>

                <button
                    onClick={() => window.open(generatedLink, '_blank')}
                    className="w-full py-4 text-rose-600 font-bold hover:underline flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> Үр дүнг үзэх
                </button>
            </div>
        </motion.div>
    );
};

export default Step3Success;
