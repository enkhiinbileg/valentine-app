import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step1Props {
    formData: any;
    setFormData: (data: any) => void;
    onNext: () => void;
    onUpgrade: () => void;
    themes: any[];
    userPackageType?: string;
}

const Step1Names = ({ formData, setFormData, onNext, onUpgrade, themes, userPackageType }: Step1Props) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
                <h2 className="romantic-text text-5xl text-rose-900 mb-2">Нэрсээ оруулна уу</h2>
                <p className="text-rose-400 text-sm font-medium">Хайртай хүнийхээ болон өөрийнхөө нэрийг бичээрэй ✨</p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-rose-700 mb-1">Хайртай хүний тань нэр</label>
                    <input
                        type="text"
                        value={formData.partnerName}
                        onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-rose-900"
                        placeholder="Жишээ нь: Миний наран"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-rose-700 mb-1">Таны нэр</label>
                    <input
                        type="text"
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-rose-900"
                        placeholder="Таны нэр"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-rose-700 mb-3">Загвар сонгох (Theme)</label>
                    <div className="grid grid-cols-2 gap-3">
                        {themes.map((t) => {
                            const isLocked = t.premium && userPackageType !== 'diamond';
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => isLocked ? onUpgrade() : setFormData({ ...formData, theme: t.id })}
                                    className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all relative overflow-hidden ${formData.theme === t.id
                                        ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'
                                        : 'border-rose-100 bg-white/50 hover:border-rose-300'
                                        } ${isLocked ? 'hover:border-rose-400' : ''}`}
                                >
                                    <span className="text-xl">{t.icon}</span>
                                    <span className="text-xs font-bold text-rose-900">{t.name}</span>
                                    {isLocked && <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-rose-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <button
                    disabled={!formData.partnerName || !formData.senderName}
                    onClick={onNext}
                    className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-200"
                >
                    Дараах
                </button>
            </div>
        </motion.div>
    );
};

export default Step1Names;
