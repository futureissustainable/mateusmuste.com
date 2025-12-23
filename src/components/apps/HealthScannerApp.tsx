import { useState, useEffect, memo } from 'react';

export const HealthScannerApp = memo(() => {
  const [booting, setBooting] = useState(true);
  const [bootText, setBootText] = useState('');

  useEffect(() => {
    const bootSequence = [
      'HEALTH SCANNER INDUSTRIES',
      '',
      'INITIALIZING BIOMETRIC SENSORS...',
      'LOADING NEURAL INTERFACE...',
      'CALIBRATING HEALTH MATRIX...',
      '',
      'SYSTEM READY'
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let currentText = '';

    const typeInterval = setInterval(() => {
      if (lineIndex >= bootSequence.length) {
        clearInterval(typeInterval);
        setTimeout(() => setBooting(false), 500);
        return;
      }

      const currentLine = bootSequence[lineIndex];
      if (charIndex < currentLine.length) {
        currentText += currentLine[charIndex];
        setBootText(currentText);
        charIndex++;
      } else {
        currentText += '\n';
        setBootText(currentText);
        lineIndex++;
        charIndex = 0;
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, []);

  if (booting) {
    return (
      <div className="h-full flex flex-col bg-black select-none">
        <div className="flex-grow flex flex-col items-center justify-center p-8 font-mono">
          <div className="text-green-500 text-center whitespace-pre-line text-sm mb-8">
            {bootText}
            <span className="animate-pulse">_</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <div className="p-2 border-t border-green-900 text-center">
          <span className="font-mono text-[10px] text-green-700">© HEALTH SCANNER INDUSTRIES 2077</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <iframe
        src="https://healthscore-2-0.vercel.app/"
        className="w-full h-full border-0"
        title="Health Scanner"
        allow="camera; microphone"
      />
    </div>
  );
});

HealthScannerApp.displayName = 'HealthScannerApp';

export default HealthScannerApp;
