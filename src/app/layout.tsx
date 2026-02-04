import type { Metadata } from "next";
import { Inter, Dancing_Script, Playfair_Display } from 'next/font/google';
import "./globals.css";
import TouchHearts from "@/components/TouchHearts";
import BackgroundHearts from "@/components/BackgroundHearts"; // Assuming this was extracted or exists, wait, the previous view_file showing it inline at bottom. I should keep it inline or extract? The previous view_file shows it inline at bottom of layout.tsx. I will keep it inline for now but I need to be careful with imports.
// Actually, looking at the previous view_file output for layout.tsx (Step 176), BackgroundHearts is defined at the bottom of the file.
// But in line 27 it is used.
// I will just add Playfair_Display.

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Valentine's Day - Хайртай хүндээ гэнэтийн бэлэг",
  description: "Хайртай хүндээ дижитал хайрын хуудас үүсгэж гэнэтийн бэлэг бариарай.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans bg-rose-50/30 bg-noise">
        <div className="min-h-screen relative overflow-hidden">
          {/* Background Effect */}
          <div className="heart-bg" />

          {/* Dynamic Interactive Effects */}
          <BackgroundHearts />
          <TouchHearts />

          {children}

          <footer className="fixed bottom-4 left-0 w-full text-center text-rose-300 text-[10px] font-bold uppercase tracking-widest opacity-40 pointer-events-none z-0">
            Made with ❤️ for Valentine's Day
          </footer>
        </div>
      </body>
    </html>
  );
}


