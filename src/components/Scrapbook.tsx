import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { X, Heart, Share2, Sparkles, Sun } from 'lucide-react';
import Image from 'next/image';

interface Memory {
    type: 'image' | 'video';
    url: string;
    caption?: string;
    id?: string | number;
}

interface ScrapbookProps {
    memories: Memory[];
    onClose?: () => void;
}

// Film Strip Video Card
const VideoCard = ({ memory }: { memory: Memory }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { amount: 0.6 }); // Play when 60% visible

    // Handle Autoplay based on visibility
    React.useEffect(() => {
        if (!videoRef.current) return;

        if (isInView) {
            videoRef.current.play().catch(e => console.log("Autoplay blocked/error", e));
        } else {
            videoRef.current.pause();
        }
    }, [isInView]);

    return (
        <div ref={containerRef} className="relative w-full mb-12">
            <div className="bg-[#1a1a1a] p-2 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                {/* Film Perforations Top/Bottom */}
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-8 py-1 z-20 opacity-50 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-2 h-3 bg-white/20 rounded-[1px]" />
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-between px-8 py-1 z-20 opacity-50 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-2 h-3 bg-white/20 rounded-[1px]" />
                    ))}
                </div>

                <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-black">
                    <video
                        ref={videoRef}
                        src={memory.url}
                        className="w-full h-full object-contain"
                        controls
                        loop
                        playsInline
                        muted={false} // Allow sound, autoplay logic handles the "when"
                    />

                    {/* Fake UI Elements match reference - Hidden when playing usually, but here decorative */}
                    <div className="absolute bottom-4 left-6 text-white/50 text-xs font-mono pointer-events-none">REC</div>
                    <div className="absolute bottom-6 left-12 right-12 h-1 bg-white/10 rounded-full pointer-events-none"></div>
                </div>
            </div>
            {memory.caption && (
                <div className="absolute -bottom-4 left-0 right-0 flex justify-center z-20">
                    <div className="bg-white px-6 py-2 rounded-lg shadow-lg transform -rotate-2 border-2 border-pink-100/50">
                        <p className="text-red-500 font-[Comic Sans MS] font-bold text-sm text-center whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                            {memory.caption}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

// Soft Rounded Photo Card
const PhotoCard = ({ memory, index }: { memory: Memory, index: number }) => {
    // const borders = ['border-pink-200', 'border-rose-200', 'border-red-100'];
    const bgs = ['bg-pink-50', 'bg-rose-50', 'bg-red-50'];

    return (
        <div className={`relative w-full aspect-square p-4 ${bgs[index % 3]} rounded-[3rem] shadow-lg mb-12 mx-auto max-w-sm`}>
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-inner">
                <Image
                    src={memory.url}
                    alt="Memory"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Sticker Caption or Date */}
            <div className="absolute -bottom-5 left-0 right-0 flex justify-center z-20">
                <div className={`bg-white px-6 py-2 rounded-lg shadow-lg transform ${index % 2 === 0 ? '-rotate-2' : 'rotate-2'} border-2 border-pink-100/50`}>
                    <p className="text-red-400 font-[Comic Sans MS] font-bold text-xs uppercase tracking-wider">
                        {memory.caption || "2-Р САР"}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Quote Bubble
const QuoteCard = ({ text }: { text: string }) => {
    return (
        <div className="bg-white rounded-[3rem] p-8 shadow-[0_10px_40px_-10px_rgba(255,182,193,0.5)] mb-12 relative max-w-md mx-auto">
            <Heart className="absolute top-6 right-6 text-pink-200 w-8 h-8 opacity-50 fill-pink-100" />
            <p className="text-center text-stone-700 font-[Comic Sans MS] text-lg leading-relaxed">
                {text}
            </p>
            <p className="text-center text-red-500 font-bold mt-4 text-sm tracking-wider uppercase">
                #ҮүрдХамт
            </p>
        </div>
    )
}

const MemoryItem = ({ memory, index }: { memory: Memory; index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
        >
            {memory.type === 'video' ? (
                <VideoCard memory={memory} />
            ) : (
                <PhotoCard memory={memory} index={index} />
            )}

        </motion.div>
    );
};

const Scrapbook = ({ memories, onClose }: ScrapbookProps) => {

    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-col items-center pt-6 pb-24 bg-[#FFF0F5] overflow-y-auto">
            {/* Dot Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffd1dc_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-8 relative z-10 w-full px-4">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={onClose} className="p-2"><X className="w-6 h-6 text-stone-800" /></button>
                    <h2 className="text-red-500 font-bold text-lg">Бидний Дурсамж</h2>
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>

                <h1 className="text-red-400 text-xs font-bold tracking-[0.2em] uppercase mt-4 mb-2">
                    ХАЙРЫН ТҮҮХ
                </h1>
                <div className="w-12 h-1 bg-pink-200 mx-auto rounded-full"></div>
            </div>

            {/* Feed */}
            <div className="w-full max-w-lg px-4 z-10 flex flex-col items-center">
                {memories.map((memory, index) => (
                    <MemoryItem key={memory.id || index} memory={memory} index={index} />
                ))}

                {/* Bottom Decoration */}
                <div className="mt-8 text-center opacity-50 z-10 pb-8">
                    <p className="text-stone-400 font-serif text-sm">~ Бидний түүх үргэлжилнэ ~</p>
                </div>
            </div>

            {/* Decoration Elements floating */}
            <Sparkles className="absolute top-32 left-4 text-pink-300 w-8 h-8 animate-pulse" />
            <div className="absolute bottom-32 right-4 text-red-400 rotate-12">
                <Sun className="w-8 h-8" />
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 mb-12 flex justify-center gap-4 bg-white/50 py-2 px-8 rounded-full backdrop-blur-sm">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <Share2 className="w-6 h-6 text-red-500" />
            </div>
        </div>
    );
};

export default Scrapbook;
