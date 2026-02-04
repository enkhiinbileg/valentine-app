import React, { useState } from 'react';
import { Camera, Video, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Memory {
    type: 'image' | 'video';
    url: string;
    caption?: string;
    file?: File; // Temporary for upload handling
    isUploading?: boolean;
}

interface Step2MemoriesProps {
    memories: Memory[];
    setMemories: (memories: Memory[]) => void;
    onBack: () => void;
    onGenerate: () => void;
    isGenerating: boolean;
    handleFileUpload: (file: File, type: 'image' | 'video') => Promise<void>;
}

const Step2Memories = ({ memories, setMemories, onBack, onGenerate, isGenerating, handleFileUpload }: Step2MemoriesProps) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        const uploadPromises = Array.from(files).map(async (file) => {
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                await handleFileUpload(file, type);
            }
        });

        await Promise.all(uploadPromises);
    };

    const removeMemory = (index: number) => {
        const newMemories = [...memories];
        newMemories.splice(index, 1);
        setMemories(newMemories);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
                <h2 className="romantic-text text-5xl text-rose-900 mb-2">Бидний Дурсамж</h2>
                <p className="text-rose-400 text-sm font-medium">Хамтдаа өнгөрүүлсэн нандин мөчүүдээ зураг, бичлэгээр хадгалаарай 📸</p>
            </div>

            <div className="mb-8">
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-rose-500 bg-rose-50' : 'border-rose-200 bg-white/50 hover:bg-rose-50/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={onDrop}
                >
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleChange}
                        accept="image/*,video/*"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                            <Plus className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-rose-900 font-bold text-lg mb-1">Зураг эсвэл Бичлэг нэмэх</p>
                            <p className="text-rose-500/70 text-sm">Файлаа чирж оруулна уу эсвэл дарж сонгоно уу</p>
                        </div>
                    </div>
                </div>
            </div>

            {memories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {memories.map((memory, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-square rounded-xl overflow-hidden group bg-black/5 border border-rose-100 shadow-sm"
                            >
                                {memory.isUploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => removeMemory(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {memory.type === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
                                                <video src={memory.url} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <Video className="w-8 h-8 text-white drop-shadow-lg" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <Image
                                                    src={memory.url}
                                                    alt="Memory"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Caption Input Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pt-6">
                                            <input
                                                type="text"
                                                value={memory.caption || ''}
                                                onChange={(e) => {
                                                    const newMemories = [...memories];
                                                    newMemories[index].caption = e.target.value;
                                                    setMemories(newMemories);
                                                }}
                                                placeholder="Тайлбар бичих..."
                                                className="w-full bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1.5 rounded-lg placeholder-white/70 outline-none border border-white/10 focus:bg-white/30 transition-all text-center"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

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
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Уншиж байна...
                        </div>
                    ) : (
                        <>Карт үүсгэх ✨</>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default Step2Memories;
