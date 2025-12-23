import { useState, useEffect, memo } from 'react';
import { PixelartIcon } from '@/components/ui';
import { sounds } from '@/lib/audio';

interface PersonalAppProps {
  unlocked?: boolean;
  onOpenDogStory?: () => void;
}

export const PersonalApp = memo(({ unlocked, onOpenDogStory }: PersonalAppProps) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [revealPhase, setRevealPhase] = useState(0);

  useEffect(() => {
    if (unlocked && revealPhase === 0) {
      sounds.passwordCorrect();
      setRevealPhase(1);
      setTimeout(() => setRevealPhase(2), 3000);
      setTimeout(() => setRevealPhase(3), 10000);
    }
  }, [unlocked, revealPhase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.passwordWrong();
    setAttempts(a => a + 1);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    const errors = [
      'ACCESS DENIED',
      'INVALID CREDENTIALS',
      'AUTHENTICATION FAILED',
      'PERMISSION DENIED',
      'UNAUTHORIZED ACCESS',
      'INCORRECT PASSWORD',
      'SECURITY VIOLATION',
      'ACCESS RESTRICTED',
      'VERIFICATION FAILED',
      'ENTRY PROHIBITED'
    ];
    setError(errors[Math.floor(Math.random() * errors.length)]);
    setPassword('');
  };

  if (unlocked) {
    return (
      <div className="h-full flex flex-col bg-white select-none overflow-hidden relative">
        <div
          className="absolute top-0 left-0 right-0 bg-black z-10 flex items-end justify-center"
          style={{
            height: '50%',
            transform: revealPhase >= 1 ? 'translateY(-100%)' : 'translateY(0)',
            transition: 'transform 10s ease-in-out'
          }}
        >
          <div className="font-mono text-red-500 text-xs mb-4">DECRYPTING...</div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 bg-black z-10 flex items-start justify-center"
          style={{
            height: '50%',
            transform: revealPhase >= 1 ? 'translateY(100%)' : 'translateY(0)',
            transition: 'transform 10s ease-in-out'
          }}
        >
          <div className="font-mono text-red-500 text-xs mt-4">LOADING SECRETS...</div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              transform: `scale(${revealPhase < 2 ? 0.2 : revealPhase < 3 ? 0.2 + ((revealPhase - 2) * 0.8) : 1})`,
              opacity: revealPhase < 2 ? 0 : revealPhase < 3 ? 0.3 : 1,
              transition: 'transform 7s ease-out, opacity 7s ease-out'
            }}
          >
            <button
              onClick={() => onOpenDogStory?.()}
              className="text-center cursor-pointer group"
              disabled={revealPhase < 3}
              style={{ pointerEvents: revealPhase < 3 ? 'none' : 'auto' }}
            >
              <div className="bg-white border-4 border-black p-6 group-hover:bg-gray-100 transition-colors">
                <PixelartIcon name="Folder" size={64} />
              </div>
              <div className="font-mono text-black text-lg font-bold mt-4">DOG.TXT</div>
              <div className="font-mono text-gray-600 text-xs mt-2 group-hover:text-black" style={{ opacity: revealPhase >= 3 ? 1 : 0 }}>Click to open</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="p-2 border-b border-red-900 bg-black flex items-center gap-2">
        <PixelartIcon name="Lock" size={16} />
        <span className="font-mono text-xs font-bold text-red-500">PRIVATE.EXE</span>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="mb-4">
          <PixelartIcon name="Lock" size={48} />
        </div>
        <div className="font-mono text-red-500 text-sm font-bold mb-4">SECURE AREA</div>

        <form onSubmit={handleSubmit} className={`w-56 ${shaking ? 'animate-shake' : ''}`}>
          <input
            type="password"
            aria-label="Enter password for secure area"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="w-full px-3 py-2 mb-3 bg-black border-2 border-red-800 text-red-500 font-mono text-sm placeholder-red-900 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="w-full px-3 py-2 bg-red-900 text-red-100 font-mono text-xs font-bold hover:bg-red-800 border-2 border-red-700"
          >
            AUTHENTICATE
          </button>
        </form>

        {error && (
          <div className="mt-4 p-2 border border-red-800 bg-red-950">
            <div className="font-mono text-red-500 text-xs font-bold">{error}</div>
          </div>
        )}

        {attempts > 0 && (
          <div className="mt-3 font-mono text-red-800 text-[10px]">
            FAILED: {attempts}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
});

PersonalApp.displayName = 'PersonalApp';

export default PersonalApp;
