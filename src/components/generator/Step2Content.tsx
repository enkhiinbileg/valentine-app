import React from 'react';
import { Camera, Music, Loader2, Check, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Step2Props {
    formData: any;
    setFormData: (data: any) => void;
    onBack: () => void;
    onGenerate: () => void;
    isGenerating: boolean;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => void;
}

const Step2Content = ({ formData, setFormData, onBack, onGenerate, isGenerating, isUploading, handleFileUpload }: Step2Props) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
                <h2 className="romantic-text text-5xl text-rose-900 mb-2">Хайрын зурвас</h2>
                <p className="text-rose-400 text-sm font-medium">Хайртай хүндээ илгээх үг болон зургаа оруулаарай ✨</p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-rose-700 mb-1">Сэтгэлийн үг</label>
                    <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-rose-900"
                        placeholder="Таны хайртай хүндээ хэлэхийг хүссэн чин сэтгэлийн үг..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-rose-700 mb-1">Дуу хуулах (заавал биш)</label>
                    <div className="w-full">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-xl p-4 cursor-pointer hover:bg-rose-50 transition-all bg-white/50">
                            <Music className="w-6 h-6 text-rose-400 mb-1" />
                            <span className="text-xs text-rose-500 font-medium">Дуу хуулах</span>
                            <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} disabled={isUploading} />
                        </label>
                    </div>
                    {isUploading && (
                        <div className="flex items-center gap-2 mt-2 text-rose-500 text-sm animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" /> Файл хуулж байна...
                        </div>
                    )}
                    {formData.musicUrl && !isUploading && (
                        <div className="text-xs text-green-500 mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Дуу амжилттай хуулагдлаа
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Өмнөх
                    </button>
                    <button
                        onClick={onGenerate}
                        className="flex-[2] py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                    >
                        {isGenerating ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : <>Үүсгэх <Send className="w-4 h-4" /></>}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Step2Content;
