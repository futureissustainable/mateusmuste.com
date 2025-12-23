import { useState, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface ContactAppProps {
  onOpenPaint?: () => void;
}

export const ContactApp = memo(({ onOpenPaint }: ContactAppProps) => {
  const [copied, setCopied] = useState(false);
  const email = 'mateusmuste9@gmail.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    sounds.copy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openDrawMessage = () => {
    sounds.click();
    onOpenPaint?.();
  };

  return (
    <div className="h-full flex flex-col bg-white select-none overflow-hidden">
      <div className="app-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <PixelartIcon name="Email" size={16} />
          <span className="app-header-title">CONTACT</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-gray-50 p-4">
        <PixelartIcon name="Email" size={32} />
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

          <div className="border-t-2 border-black my-1"></div>

          <button
            onClick={openDrawMessage}
            className="btn-secondary w-full flex items-center justify-center gap-2 btn-sm"
          >
            <PixelartIcon name="Palette" size={16} />
            DIRECT CONTACT
          </button>
          <div className="text-center font-mono text-[10px] text-gray-400">
            Draw me a message instead
          </div>
        </div>
      </div>
    </div>
  );
});

ContactApp.displayName = 'ContactApp';

export default ContactApp;
