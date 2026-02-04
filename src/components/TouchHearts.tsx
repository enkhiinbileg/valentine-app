"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Heart {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
}

const COLORS = ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#6366f1', '#818cf8'];

export default function TouchHearts() {
    const [hearts, setHearts] = useState<Heart[]>([]);

    const addHeart = (x: number, y: number) => {
        const id = Date.now() + Math.random();
        const size = 15 + Math.random() * 25;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        setHearts((prev) => [...prev, { id, x, y, size, color }]);

        // Remove heart after animation
        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 1500);
    };

    useEffect(() => {
        const handleTouch = (e: TouchEvent) => {
            const touch = e.touches[0];
            addHeart(touch.clientX, touch.clientY);
        };

        const handleClick = (e: MouseEvent) => {
            // Also allow desktop clicks for testing
            addHeart(e.clientX, e.clientY);
        };

        window.addEventListener('touchstart', handleTouch);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{ opacity: 1, scale: 0, x: heart.x, y: heart.y }}
                        animate={{
                            opacity: 0,
                            scale: 1.5,
                            y: heart.y - 100,
                            x: heart.x + (Math.random() - 0.5) * 50
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute select-none pointer-events-none"
                        style={{
                            color: heart.color,
                            fontSize: heart.size,
                            left: -heart.size / 2, // Center the heart relative to tap
                            top: -heart.size / 2
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
