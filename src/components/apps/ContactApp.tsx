'use client';

import { useState } from 'react';
import { useSounds } from '@/hooks';

interface ContactAppProps {
  onOpenPaint?: () => void;
}

// Email icon SVG
const EmailIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M4 4h16v16H4V4zm2 2v2l6 4 6-4V6H6zm0 4v6h12v-6l-6 4-6-4z" />
  </svg>
);

// Palette icon SVG
const PaletteIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.4 0-1.1.9-2 2-2h2.4c3 0 5.5-2.5 5.5-5.5C22 5.9 17.5 2 12 2zM6.5 12c-.8 0-1.5-.7-1.5-1.5S5.7 9 6.5 9 8 9.7 8 10.5 7.3 12 6.5 12zm3-4C8.7 8 8 7.3 8 6.5S8.7 5 9.5 5s1.5.7 1.5 1.5S10.3 8 9.5 8zm5 0c-.8 0-1.5-.7-1.5-1.5S13.7 5 14.5 5s1.5.7 1.5 1.5S15.3 8 14.5 8zm3 4c-.8 0-1.5-.7-1.5-1.5S16.7 9 17.5 9s1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
  </svg>
);

export function ContactApp({ onOpenPaint }: ContactAppProps) {
  const [copied, setCopied] = useState(false);
  const email = 'mateusmuste9@gmail.com';
  const sounds = useSounds();

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    sounds.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openDrawMessage = () => {
    sounds.click();
    onOpenPaint?.();
  };

  return (
    <div className="h-full flex flex-col bg-white select-none overflow-hidden">
      {/* Header */}
      <div className="app-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <EmailIcon size={16} />
          <span className="app-header-title">CONTACT</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-gray-50 p-4">
        <EmailIcon size={32} />
        <div className="font-mono text-lg font-bold mt-2 mb-1">GET IN TOUCH</div>
        <div className="font-mono text-xs text-gray-500 mb-4">{email}</div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <div className="flex gap-2">
            <button onClick={copyEmail} className="btn-primary flex-1 btn-sm">
              {copied ? 'COPIED!' : 'COPY EMAIL'}
            </button>
            <a
              href={`mailto:${email}`}
              className="btn-secondary flex-1 text-center btn-sm"
              onClick={() => sounds.click()}
            >
              OPEN MAIL
            </a>
          </div>

          <div className="border-t-2 border-black my-1" />

          <button
            onClick={openDrawMessage}
            className="btn-secondary w-full flex items-center justify-center gap-2 btn-sm"
          >
            <PaletteIcon size={16} />
            DIRECT CONTACT
          </button>
          <div className="text-center font-mono text-[10px] text-gray-400">
            Draw me a message instead
          </div>
        </div>
      </div>
    </div>
  );
}
