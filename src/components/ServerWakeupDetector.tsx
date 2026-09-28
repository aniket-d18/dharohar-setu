'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiUrl';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export default function ServerWakeupDetector() {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function checkServerHealth() {
      const apiUrl = getApiUrl();
      
      // If server takes longer than 2000ms to respond, show cold-start message
      timer = setTimeout(() => {
        if (isMounted) {
          setIsWakingUp(true);
        }
      }, 2000);

      try {
        const res = await fetch(`${apiUrl}/api/health`, {
          cache: 'no-store',
        });
        if (res.ok && isMounted) {
          if (timer) clearTimeout(timer);
          setIsWakingUp(false);
        }
      } catch (e) {
        // Keep waking indicator if request is pending or retrying
      }
    }

    checkServerHealth();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isWakingUp || isDismissed) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[1300] max-w-md w-[92%] sm:w-auto animate-in slide-in-from-top duration-300">
      <div className="bg-[#FAF7F1] border border-[#C97A3D]/40 text-[#2A2420] px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center space-x-2.5">
          <RefreshCw className="w-4 h-4 text-[#C97A3D] animate-spin shrink-0" />
          <div>
            <span className="font-semibold text-[#2A2420]">Waking up the archive...</span>
            <p className="text-[10px] text-[#2A2420]/70 mt-0.5">
              Connecting to living heritage database (may take a few seconds on first visit).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-full text-[#2A2420]/40 hover:text-[#2A2420] hover:bg-[#E4DDD0]/50 transition-colors"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
