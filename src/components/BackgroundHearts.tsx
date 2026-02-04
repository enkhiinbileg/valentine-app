'use client';

import React, { useEffect, useState } from 'react';

export default function BackgroundHearts() {
    const [hearts, setHearts] = useState<Array<{ id: number, left: string, duration: string, fontSize: string, delay: string }>>([]);

    useEffect(() => {
        // Generate hearts only on client side to avoid hydration mismatch
        const newHearts = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: `${10 + Math.random() * 20}s`,
            fontSize: `${10 + Math.random() * 30}px`,
            delay: `${Math.random() * 10}s`
        }));
        setHearts(newHearts);
    }, []);

    return (
        <>
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="floating-heart text-2xl"
                    style={{
                        left: heart.left,
                        // @ts-ignore
                        '--duration': heart.duration,
                        fontSize: heart.fontSize,
                        animationDelay: heart.delay
                    }}
                >
                    ❤️
                </div>
            ))}
        </>
    );
}
