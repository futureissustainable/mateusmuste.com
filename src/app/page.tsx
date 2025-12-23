'use client';

import { useState, useEffect } from 'react';
import { OS } from '@/components/OS';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-black font-mono">Loading...</div>
      </div>
    );
  }

  return <OS />;
}
