"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scrapbook from './Scrapbook';

interface ValentineExperienceProps {
    partnerName: string;
    senderName: string;
    message: string;
    musicUrl?: string;
    memories?: any[];
    onComplete?: () => void;
}

export default function ValentineExperience({ partnerName, senderName, message, onComplete, musicUrl, memories }: ValentineExperienceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [started, setStarted] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const [statusText, setStatusText] = useState("Над дээр дар! ❤");
    const [showMemories, setShowMemories] = useState(false);

    useEffect(() => {
        if (!started) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let stars = 500;
        let colorrange = [0, 60, 240];
        let starArray: any[] = [];

        function getRandom(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        for (let i = 0; i < stars; i++) {
            let x = Math.random() * canvas.offsetWidth;
            let y = Math.random() * canvas.offsetHeight;
            let radius = Math.random() * 1.2;
            let hue = colorrange[getRandom(0, colorrange.length - 1)];
            let sat = getRandom(50, 100);
            let opacity = Math.random();
            starArray.push({ x, y, radius, hue, sat, opacity });
        }

        let frameNumber = 0;
        let opacity = 0;
        let secondOpacity = 0;
        let thirdOpacity = 0;
        let baseFrame = context.getImageData(0, 0, window.innerWidth, window.innerHeight);

        function drawStars() {
            if (!context) return;
            for (let i = 0; i < stars; i++) {
                let star = starArray[i];
                context.beginPath();
                context.arc(star.x, star.y, star.radius, 0, 360);
                context.fillStyle = "hsla(" + star.hue + ", " + star.sat + "%, 88%, " + star.opacity + ")";
                context.fill();
            }
        }

        function updateStars() {
            for (let i = 0; i < stars; i++) {
                if (Math.random() > 0.99) {
                    starArray[i].opacity = Math.random();
                }
            }
        }

        function drawTextWithLineBreaks(lines: string[], x: number, y: number, fontSize: number, lineHeight: number) {
            lines.forEach((line, index) => {
                context?.fillText(line, x, y + index * (fontSize + lineHeight));
            });
        }

        function drawText() {
            if (!context) return;
            let fontSize = Math.min(30, window.innerWidth / 24);
            let lineHeight = 8;

            context.font = fontSize + "px Comic Sans MS";
            context.textAlign = "center";
            context.shadowColor = "rgba(45, 45, 255, 1)";
            context.shadowBlur = 8;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            if (frameNumber < 250) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Өдөр бүр би ямар их азтай вэ", "гэдэгтээ итгэж чаддаггүй"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Өдөр бүр би ямар их азтай вэ гэдэгтээ итгэж чаддаггүй", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity + 0.01;
            }
            if (frameNumber >= 250 && frameNumber < 500) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Өдөр бүр би ямар их азтай вэ", "гэдэгтээ итгэж чаддаггүй"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Өдөр бүр би ямар их азтай вэ гэдэгтээ итгэж чаддаггүй", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity - 0.01;
            }

            if (frameNumber == 500) opacity = 0;
            if (frameNumber > 500 && frameNumber < 750) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Тэрбум тэрбум одод дундаас,", "олон тэрбум жилийн туршид"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Тэрбум тэрбум одод дундаас, олон тэрбум жилийн туршид", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity + 0.01;
            }
            if (frameNumber >= 750 && frameNumber < 1000) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Тэрбум тэрбум одод дундаас,", "олон тэрбум жилийн туршид"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Тэрбум тэрбум одод дундаас, олон тэрбум жилийн туршид", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity - 0.01;
            }

            if (frameNumber == 1000) opacity = 0;
            if (frameNumber > 1000 && frameNumber < 1250) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Амьд байж, энэ амьдралыг", "чамтай хамт өнгөрүүлэх нь"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Амьд байж, энэ амьдралыг чамтай хамт өнгөрүүлэх нь", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity + 0.01;
            }
            if (frameNumber >= 1250 && frameNumber < 1500) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Амьд байж, энэ амьдралыг", "чамтай хамт өнгөрүүлэх нь"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Амьд байж, энэ амьдралыг чамтай хамт өнгөрүүлэх нь", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity - 0.01;
            }

            if (frameNumber == 1500) opacity = 0;
            if (frameNumber > 1500 && frameNumber < 1750) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Үнэхээр, санаанд багтамгүй", "ховор хувь тохиол юм"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Үнэхээр, санаанд багтамгүй ховор хувь тохиол юм", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity + 0.01;
            }
            if (frameNumber >= 1750 && frameNumber < 2000) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Үнэхээр, санаанд багтамгүй", "ховор хувь тохиол юм"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Үнэхээр, санаанд багтамгүй ховор хувь тохиол юм", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity - 0.01;
            }

            if (frameNumber == 2000) opacity = 0;
            if (frameNumber > 2000 && frameNumber < 2250) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Гэсэн ч би энд, чамтай танилцах", "энэ боломжгүй боломжийг олж авсан"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Гэсэн ч би энд, чамтай танилцах энэ боломжгүй боломжийг олж авсан", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity + 0.01;
            }
            if (frameNumber >= 2250 && frameNumber < 2500) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Гэсэн ч би энд, чамтай танилцах", "энэ боломжгүй боломжийг олж авсан"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText("Гэсэн ч би энд, чамтай танилцах энэ боломжгүй боломжийг олж авсан", canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity - 0.01;
            }

            if (frameNumber == 2500) opacity = 0;
            if (frameNumber > 2500 && frameNumber < 99999) {
                context.fillStyle = `rgba(45, 45, 255, ${opacity})`;
                // Use props for name
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks([`Би чамд маш их хайртай ${partnerName}, бүх цаг`, "хугацаа, орон зайгаас ч илүүгээр"], canvas!.width / 2, canvas!.height / 2, fontSize, lineHeight);
                } else {
                    context.fillText(`Би чамд маш их хайртай ${partnerName}, бүх цаг хугацаа, орон зайгаас ч илүүгээр`, canvas!.width / 2, canvas!.height / 2);
                }
                opacity = opacity + 0.01;
            }

            if (frameNumber >= 2750 && frameNumber < 99999) {
                context.fillStyle = `rgba(45, 45, 255, ${secondOpacity})`;
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks(["Энэ хайраа чамтай хуваалцахын тулд", "бүх цаг хугацааг зориулахад бэлэн байна!"], canvas!.width / 2, (canvas!.height / 2 + 60), fontSize, lineHeight);
                } else {
                    context.fillText("Энэ хайраа чамтай хуваалцахын тулд бүх цаг хугацааг зориулахад бэлэн байна!", canvas!.width / 2, (canvas!.height / 2 + 50));
                }
                secondOpacity = secondOpacity + 0.01;
            }

            if (frameNumber >= 3000 && frameNumber < 99999) {
                context.fillStyle = `rgba(45, 45, 255, ${thirdOpacity})`;
                context.fillText("Гэгээн хайрын өдрийн мэнд хүргэе <3", canvas!.width / 2, (canvas!.height / 2 + 120));
                thirdOpacity = thirdOpacity + 0.01;
            }

            if (frameNumber >= 3300 && frameNumber < 99999) {
                context.fillStyle = `rgba(255, 255, 255, ${Math.min((frameNumber - 3300) * 0.01, 1)})`;
                context.font = (fontSize * 0.8) + "px Comic Sans MS";
                if (window.innerWidth < 600) {
                    drawTextWithLineBreaks([message], canvas!.width / 2, (canvas!.height / 2 + 180), fontSize * 0.8, lineHeight);
                } else {
                    context.fillText(message, canvas!.width / 2, (canvas!.height / 2 + 180));
                }
            }

            context.shadowColor = "transparent";
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }

        let animationFrameId: number;

        function draw() {
            if (!context || !canvas) return;
            context.putImageData(baseFrame, 0, 0);
            drawStars();
            updateStars();
            drawText();
            if (frameNumber < 99999) {
                frameNumber++;
            }
            animationFrameId = window.requestAnimationFrame(draw);
        }

        const handleResize = () => {
            if (canvas && context) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                baseFrame = context.getImageData(0, 0, window.innerWidth, window.innerHeight);
            }
        }

        window.addEventListener("resize", handleResize);
        draw();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [started, partnerName, message]);

    const handleStart = () => {
        setStatusText("Уншиж байна...");
        setStarted(true);
        setShowButton(false);
        if (audioRef.current && musicUrl) {
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 overflow-hidden">

            {!started && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                        id="valentinesButton"
                        onClick={handleStart}
                        className="px-6 py-3 bg-[#2d2dff] border-2 border-[#2d2dff] text-white rounded-xl text-lg font-[Comic Sans MS] cursor-pointer hover:bg-[#1f1faa] transition-colors"
                        style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                    >
                        {statusText}
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} id="starfield" className="w-full h-full bg-[#111] block" />

            {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}

            {/* Overlay a back button for navigation safety */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                {memories && memories.length > 0 && (
                    <button
                        onClick={() => setShowMemories(true)}
                        className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-sm hover:bg-white/20 transition-all font-bold"
                    >
                        📸 Бидний Дурсамж
                    </button>
                )}
                {onComplete && (
                    <button
                        onClick={onComplete}
                        className="text-white/30 hover:text-white text-sm px-3"
                    >
                        Close
                    </button>
                )}
            </div>

            {/* Memories Overlay */}
            <AnimatePresence>
                {showMemories && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl p-6 overflow-y-auto"
                    >
                        <div className="max-w-4xl mx-auto pt-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-white font-[Comic Sans MS]">Бидний Дурсамж 📸</h2>
                                <button
                                    onClick={() => setShowMemories(false)}
                                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                                </button>
                            </div>

                            <div className="pb-20">
                                <Scrapbook
                                    memories={memories || []}
                                    onClose={() => setShowMemories(false)}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
