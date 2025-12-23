import { useRef, memo } from 'react';

interface AboutAppProps {
  onAchievement?: (id: string) => void;
}

export const AboutApp = memo(({ onAchievement }: AboutAppProps) => {
  const achievementTriggered = useRef(false);

  const skills = [
    { name: 'PHOTOSHOP', yrs: 9 },
    { name: 'PREMIERE', yrs: 8 },
    { name: 'AFTER EFFECTS', yrs: 6 },
    { name: 'EXCEL', yrs: 5 },
    { name: 'META ADS', yrs: 5 },
    { name: 'DAVINCI', yrs: 4 },
    { name: 'ARCHICAD', yrs: 3 },
    { name: 'WEBFLOW', yrs: 3 },
    { name: 'UNREAL', yrs: 3 },
    { name: 'MIDJOURNEY', yrs: 2 },
    { name: 'CURSOR', yrs: 1 },
    { name: 'COMFYUI', yrs: 1 }
  ];

  const projects = [
    { t: "BIOBUILDS", s: "Web / Video / Marketing", d: "Sustainable construction across Europe." },
    { t: "ROMANIA OLYMPICS 2024", s: "Premiere / After Effects", d: "National contest winner." },
    { t: "ULT", s: "Documentary / Editing", d: "Self-directed channel." }
  ];

  return (
    <div className="h-full flex flex-col bg-white select-none overflow-auto">
      <div className="p-6 md:p-8 space-y-8">
        {/* Name */}
        <h1 className="font-black" style={{ fontSize: 'clamp(6rem, 22.5vw, 15rem)' }}>
          MATEUS<br />MUSTE
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-black text-white px-2 py-1 font-mono text-[10px] md:text-xs">DIGITAL DESIGNER</span>
          <span className="bg-black text-white px-2 py-1 font-mono text-[10px] md:text-xs">RADICAL OPTIMIST</span>
          <span className="border-2 border-black px-2 py-1 font-mono text-[10px] md:text-xs">ROMANIA</span>
        </div>

        {/* Skills */}
        <div>
          <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2">Skills</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {skills.map((skill, i) => (
              <div
                key={i}
                className="border-2 border-black p-2 text-center"
                style={{ opacity: 1 - (i / skills.length) * 0.5 }}
              >
                <div className="font-bold text-[10px]">{skill.name}</div>
                <div className="font-mono text-[10px] text-gray-500">{skill.yrs} YRS</div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2">Projects</h3>
          <div className="space-y-2">
            {projects.map((p, i) => (
              <div
                key={i}
                className="border-2 border-black p-3 hover:bg-black hover:text-white transition-colors cursor-pointer"
                onClick={() => {
                  if (!achievementTriggered.current) {
                    achievementTriggered.current = true;
                    onAchievement?.('WORK_IN_PROGRESS');
                  }
                }}
              >
                <div className="font-bold text-sm uppercase">{p.t}</div>
                <div className="font-mono text-[10px] text-gray-500">{p.s}</div>
                <div className="text-[13px] mt-1">{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

AboutApp.displayName = 'AboutApp';

export default AboutApp;
