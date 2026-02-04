import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'valentine-red': '#cc0000',
                'valentine-pink': '#ff4d6d',
                'valentine-rose': '#ff758f',
                'valentine-cream': '#fff0f3',
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                'romantic': ['"Dancing Script"', 'cursive'],
                'serif': ['var(--font-playfair)', 'serif'],
                'sans': ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-fast': 'float 3s ease-in-out infinite',
                'subtle-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
