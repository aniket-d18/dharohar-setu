'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 100
    const duration = 2200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setProgress(Math.floor(eased * 100));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Dismiss after animation
    const timer = setTimeout(() => setIsVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1A1714 0%, #2A2420 30%, #1A1714 60%, #0F0D0B 100%)',
          }}
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Radial glow behind logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.15, scale: 1.2 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
              style={{
                background: 'radial-gradient(circle, rgba(197,165,90,0.3) 0%, rgba(201,122,61,0.1) 40%, transparent 70%)',
              }}
            />
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                  opacity: 0,
                }}
                animate={{
                  y: -50,
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  background: i % 3 === 0 ? '#C5A55A' : i % 3 === 1 ? '#C97A3D' : '#E8973D',
                }}
              />
            ))}

            {/* Ornamental corner patterns */}
            <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-[#C5A55A]/20 rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-[#C5A55A]/20 rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-[#C5A55A]/20 rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-[#C5A55A]/20 rounded-br-lg" />
          </div>

          {/* Central content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo container with glow */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-[#C5A55A]/40 shadow-2xl shadow-[#C5A55A]/20">
                <img
                  src="/images/logo.png"
                  alt="Dharohar Setu"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl border-2 border-[#C5A55A]/30"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-serif text-3xl sm:text-4xl font-medium text-[#FAF7F1] tracking-tight mb-2"
            >
              Dharohar Setu
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xs sm:text-sm text-[#C5A55A] tracking-[0.25em] uppercase font-sans font-medium mb-8"
            >
              Living Cultural Atlas of India
            </motion.p>

            {/* Ornamental separator */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-32 h-[2px] mb-6"
              style={{
                background: 'linear-gradient(90deg, transparent, #C5A55A, transparent)',
              }}
            />

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-48 sm:w-56"
            >
              <div className="h-[3px] rounded-full bg-[#FAF7F1]/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #C5A55A, #C97A3D)',
                  }}
                />
              </div>
              <p className="text-center text-[10px] text-[#FAF7F1]/30 font-sans mt-2 tracking-wider">
                Preserving Heritage
              </p>
            </motion.div>
          </div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-[10px] text-[#FAF7F1]/25 font-sans tracking-wider">
              Dharohar Setu · Living Cultural Atlas of India
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
